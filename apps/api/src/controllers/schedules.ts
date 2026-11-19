import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { and, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { db, schedules, shifts, shiftTemplates } from '@shift/db';
import { AppError, errorHandler } from '../middleware/error-handler';
import { periodSchema, updateShiftsSchema } from '../validators/req-schedule';

type ScheduleChanged = (scheduleId: string, kind: string) => void;

async function parseJson(request: Request): Promise<unknown> {
  try { return await request.json(); }
  catch { throw new HTTPException(400, { message: 'Некорректный JSON' }); }
}

function datesInPeriod(startDate: string, endDate: string): string[] {
  const result: string[] = [];
  const current = new Date(`${startDate}T00:00:00Z`);
  while (current.toISOString().slice(0, 10) <= endDate) {
    result.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return result;
}

export function createSchedulesRoute(onChanged: ScheduleChanged, database: typeof db = db) {
  const route = new Hono();
  route.onError(errorHandler);

  route.get('/templates', async c => {
    const data = await database.select().from(shiftTemplates).where(eq(shiftTemplates.isActive, true)).orderBy(shiftTemplates.startTime);
    return c.json({ data });
  });

  route.get('/', async c => {
    const { startDate, endDate } = periodSchema.parse(c.req.query());
    const [items, periods] = await Promise.all([
      database.select().from(shifts).where(and(gte(shifts.shiftDate, startDate), lte(shifts.shiftDate, endDate))),
      database.select().from(schedules).where(and(lte(schedules.startDate, endDate), gte(schedules.endDate, startDate))),
    ]);
    const cellKeys = new Set(items.map(item => `${item.employeeId}|${item.shiftDate}`));
    if (cellKeys.size !== items.length) throw new AppError('CONFLICT', { message: 'Найдено несколько смен для одной ячейки' });
    const published = datesInPeriod(startDate, endDate).every(date =>
      periods.some(period => period.startDate <= date && period.endDate >= date && period.status === 'published') &&
      !periods.some(period => period.startDate <= date && period.endDate >= date && period.status === 'draft')
    );
    return c.json({ data: { shifts: items, published } });
  });

  route.patch('/shifts', async c => {
    const { assignments, removals } = updateShiftsSchema.parse(await parseJson(c.req.raw));
    const changedIds = await database.transaction(async tx => {
      const templateIds = [...new Set(assignments.flatMap(item => item.templateId ? [item.templateId] : []))];
      const availableTemplates = templateIds.length ? await tx.select().from(shiftTemplates).where(inArray(shiftTemplates.id, templateIds)) : [];
      const templates = new Map(availableTemplates.map(template => [template.id, template]));
      const touched = new Set<string>();
      const cells = [...assignments.map(item => ({ ...item, remove: false as const })), ...removals.map(item => ({ ...item, remove: true as const }))]
        .sort((a, b) => a.date.localeCompare(b.date) || a.employeeId.localeCompare(b.employeeId));
      const existingCells = new Map<string, (typeof shifts.$inferSelect)[]>();
      for (const cell of cells) {
        const existing = await tx.select().from(shifts).where(and(eq(shifts.employeeId, cell.employeeId), eq(shifts.shiftDate, cell.date))).for('update');
        if (existing.length > 1) throw new AppError('CONFLICT', { message: 'Найдено несколько смен для одной ячейки' });
        if (cell.remove && cell.expected && (!existing[0] || existing[0].templateId !== cell.expected.templateId || existing[0].startTime.slice(0, 5) !== cell.expected.startTime || existing[0].endTime.slice(0, 5) !== cell.expected.endTime)) {
          throw new AppError('CONFLICT', { message: 'Исходная смена изменилась. Обновите график.' });
        }
        existingCells.set(`${cell.employeeId}|${cell.date}`, existing);
      }
      const removal = removals.length === 1 ? removals[0] : undefined;
      const source = removal?.expected ? existingCells.get(`${removal.employeeId}|${removal.date}`)?.[0] : undefined;
      for (const cell of cells) {
        const existing = existingCells.get(`${cell.employeeId}|${cell.date}`)!;
        if (cell.remove) {
          if (existing[0]) {
            await tx.delete(shifts).where(eq(shifts.id, existing[0].id));
            touched.add(existing[0].scheduleId);
          }
          continue;
        }
        if (cell.onlyIfEmpty && existing.length) throw new AppError('CONFLICT', { message: 'В выбранной ячейке уже есть смена' });
        const template = cell.templateId ? templates.get(cell.templateId) : undefined;
        const movingShift = assignments.length === 1 && cell.onlyIfEmpty && source &&
          source.templateId === cell.templateId && source.startTime.slice(0, 5) === cell.startTime && source.endTime.slice(0, 5) === cell.endTime ? source : undefined;
        if (cell.templateId && !template) throw new AppError('BAD_REQUEST', { message: 'Шаблон смены не найден' });
        if (template && !template.isActive && !movingShift) throw new AppError('BAD_REQUEST', { message: 'Шаблон смены не найден' });
        if (template && !movingShift && (template.startTime.slice(0, 5) !== cell.startTime || template.endTime.slice(0, 5) !== cell.endTime)) {
          throw new AppError('CONFLICT', { message: 'Шаблон изменился. Обновите страницу.' });
        }
        let scheduleId = existing[0]?.scheduleId;
        if (!scheduleId) {
          await tx.insert(schedules).values({ startDate: cell.date, endDate: cell.date }).onConflictDoNothing();
          const [schedule] = await tx.select().from(schedules).where(and(eq(schedules.startDate, cell.date), eq(schedules.endDate, cell.date)));
          scheduleId = schedule.id;
        }
        const values = { templateId: cell.templateId, startTime: cell.startTime, endTime: cell.endTime, breakMinutes: movingShift?.breakMinutes ?? template?.breakMinutes ?? 0, updatedAt: new Date() };
        if (existing[0]) await tx.update(shifts).set(values).where(eq(shifts.id, existing[0].id));
        else if (cell.onlyIfEmpty) {
          const inserted = await tx.insert(shifts).values({ ...values, scheduleId, employeeId: cell.employeeId, shiftDate: cell.date })
            .onConflictDoNothing().returning({ id: shifts.id });
          if (!inserted.length) throw new AppError('CONFLICT', { message: 'В выбранной ячейке уже есть смена' });
        } else await tx.insert(shifts).values({ ...values, scheduleId, employeeId: cell.employeeId, shiftDate: cell.date })
          .onConflictDoUpdate({ target: [shifts.scheduleId, shifts.employeeId, shifts.shiftDate], set: values });
        touched.add(scheduleId);
      }
      if (touched.size) await tx.update(schedules).set({ status: 'draft', publishedAt: null, updatedAt: new Date(), version: sql`${schedules.version} + 1` }).where(inArray(schedules.id, [...touched]));
      return [...touched];
    });
    changedIds.forEach(id => onChanged(id, 'shifts'));
    return c.json({ data: { updated: changedIds.length } });
  });

  route.post('/publish', async c => {
    const { startDate, endDate } = periodSchema.parse(await parseJson(c.req.raw));
    const changedIds = await database.transaction(async tx => {
      const overlapping = await tx.select().from(schedules).where(and(lte(schedules.startDate, endDate), gte(schedules.endDate, startDate)));
      if (overlapping.some(period => period.startDate < startDate || period.endDate > endDate)) {
        throw new AppError('CONFLICT', { message: 'Существующий график можно опубликовать только целиком' });
      }
      const dates = datesInPeriod(startDate, endDate);
      await tx.insert(schedules).values(dates.map(date => ({ startDate: date, endDate: date }))).onConflictDoNothing();
      const updated = await tx.update(schedules).set({ status: 'published', publishedAt: new Date(), updatedAt: new Date(), version: sql`${schedules.version} + 1` })
        .where(and(gte(schedules.startDate, startDate), lte(schedules.endDate, endDate))).returning({ id: schedules.id });
      return updated.map(item => item.id);
    });
    changedIds.forEach(id => onChanged(id, 'published'));
    return c.json({ data: { published: true } });
  });

  return route;
}
