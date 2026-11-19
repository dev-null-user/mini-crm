import { z } from 'zod';

const date = z.iso.date();
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const periodSchema = z.object({
  startDate: date,
  endDate: date,
}).refine(value => {
  const days = (Date.parse(`${value.endDate}T00:00:00Z`) - Date.parse(`${value.startDate}T00:00:00Z`)) / 86400000;
  return days >= 0 && days <= 61;
}, { message: 'Период должен содержать от 1 до 62 дней' });

const cell = z.object({ employeeId: z.uuid(), date });
const assignment = cell.extend({
  templateId: z.uuid().nullable(),
  startTime: time,
  endTime: time,
  onlyIfEmpty: z.boolean().optional(),
}).refine(value => value.startTime !== value.endTime, { message: 'Время начала и окончания должно различаться' });
const removal = cell.extend({
  expected: z.object({ templateId: z.uuid().nullable(), startTime: time, endTime: time }).optional(),
});

export const updateShiftsSchema = z.object({
  assignments: z.array(assignment).max(1000),
  removals: z.array(removal).max(1000),
}).superRefine((value, ctx) => {
  const keys = new Set<string>();
  for (const item of [...value.assignments, ...value.removals]) {
    const key = `${item.employeeId}|${item.date}`;
    if (keys.has(key)) ctx.addIssue({ code: 'custom', message: 'Ячейка указана несколько раз' });
    keys.add(key);
  }
  if (!keys.size) ctx.addIssue({ code: 'custom', message: 'Не указаны смены для изменения' });
});
