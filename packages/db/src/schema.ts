import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const scheduleStatus = pgEnum('schedule_status', ['draft', 'published']);

export const employees = pgTable('employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: varchar('full_name', { length: 180 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('agent'),
  weeklyTargetMinutes: integer('weekly_target_minutes').notNull().default(1440),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('employees_full_name_idx').on(table.fullName),
  check('employees_weekly_target_nonnegative', sql`${table.weeklyTargetMinutes} >= 0`),
]);

export const schedules = pgTable('schedules', {
  id: uuid('id').defaultRandom().primaryKey(),
  startDate: date('start_date', { mode: 'string' }).notNull(),
  endDate: date('end_date', { mode: 'string' }).notNull(),
  status: scheduleStatus('status').notNull().default('draft'),
  version: integer('version').notNull().default(1),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('schedules_period_uidx').on(table.startDate, table.endDate),
  check('schedules_date_range_chk', sql`${table.endDate} >= ${table.startDate}`),
  check('schedules_version_positive_chk', sql`${table.version} >= 1`),
]);

export const shiftTemplates = pgTable('shift_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 80 }).notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  breakMinutes: integer('break_minutes').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('shift_templates_name_uidx').on(table.name),
  check('shift_templates_time_distinct_chk', sql`${table.startTime} <> ${table.endTime}`),
  check('shift_templates_break_range_chk', sql`${table.breakMinutes} >= 0 AND ${table.breakMinutes} < 1440`),
]);

export const shifts = pgTable('shifts', {
  id: uuid('id').defaultRandom().primaryKey(),
  scheduleId: uuid('schedule_id').notNull()
    .references(() => schedules.id, { onDelete: 'cascade' }),
  employeeId: uuid('employee_id').notNull()
    .references(() => employees.id, { onDelete: 'restrict' }),
  templateId: uuid('template_id')
    .references(() => shiftTemplates.id, { onDelete: 'set null' }),
  shiftDate: date('shift_date', { mode: 'string' }).notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  breakMinutes: integer('break_minutes').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('shifts_schedule_employee_date_uidx')
    .on(table.scheduleId, table.employeeId, table.shiftDate),
  index('shifts_schedule_date_idx').on(table.scheduleId, table.shiftDate),
  index('shifts_employee_id_idx').on(table.employeeId),
  index('shifts_template_id_idx').on(table.templateId),
  check('shifts_time_distinct_chk', sql`${table.startTime} <> ${table.endTime}`),
  check('shifts_break_range_chk', sql`${table.breakMinutes} >= 0 AND ${table.breakMinutes} < 1440`),
]);
