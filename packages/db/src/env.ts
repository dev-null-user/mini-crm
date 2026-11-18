
import { config as loadDotenv } from 'dotenv';
import { fileURLToPath } from 'node:url';

loadDotenv({
  path: fileURLToPath(
    new URL('../../../.env', import.meta.url)
  ),
  override: false,
});

export function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.POSTGRES_HOST ?? '127.0.0.1';

  const port = process.env.POSTGRES_PORT ?? '5432';

  const user = process.env.POSTGRES_USER ?? 'mini_crm';
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DB ?? 'mini_crm';

  if (!password) {
    throw new Error('POSTGRES_PASSWORD is required');
  }

  const url = new URL(`postgresql://${host}:${port}/`);
  url.username = user;
  url.password = password;
  url.pathname = `/${encodeURIComponent(database)}`;

  return url.toString();
}