import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMessageHtml(text: string): string {
  const escapeHtml = (value: string): string =>
    value.replace(/[&<>"']/g, (char) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };

      return entities[char];
    });

  const lines = text
    .replace(/\\n/g, '\n')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const paragraphs: string[] = [];
  const contacts: string[] = [];

  for (const line of lines) {
    const parts = line.split(/\s*\|\s*/);

    for (const part of parts) {
      const match = part.match(/^(Телефон|Email|Тг):\s*(.+)$/i);

      if (!match) {
        paragraphs.push(part);
        continue;
      }

      const [, label, rawValue] = match;
      const value = rawValue.trim();

      let href: string | null = null;

      switch (label.toLowerCase()) {
        case 'телефон': {
          const phone = value.replace(/[^\d+]/g, '');
          if (/^\+?\d{10,15}$/.test(phone)) {
            href = `tel:${phone}`;
          }
          break;
        }

        case 'email':
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            href = `mailto:${value}`;
          }
          break;

        case 'тг':
          if (/^https:\/\/t\.me\/[a-zA-Z0-9_]+\/?$/.test(value)) {
            href = value;
          }
          break;
      }

      const content = href
        ? `<a href="${escapeHtml(href)}" style="color:#2563eb;text-decoration:none;font-weight:500;">${escapeHtml(value)}</a>`
        : escapeHtml(value);

      contacts.push(`
        <div style="margin:6px 0;font-size:14px;">
          <span style="color:#64748b;">${escapeHtml(label)}:</span>
          ${content}
        </div>
      `);
    }
  }

  return `
    <div style="
      font-family:Arial,sans-serif;
      font-size:15px;
      line-height:1.65;
      color:#1e293b;
    ">
      ${paragraphs.map((p) => `
        <p style="margin:0 0 12px;">
          ${escapeHtml(p)}
        </p>
      `).join('')}

      ${contacts.length ? `
        <div style="
          padding:14px 18px;
          background:#f8fafc;
          border-left:3px solid #3b82f6;
          border-radius:6px;
        ">
          ${contacts.join('')}
        </div>
      ` : ''}
    </div>
  `;
}