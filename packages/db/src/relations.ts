
import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(
  schema,
  (r) => ({
    employees: {
      shifts: r.many.shifts(),
    },

    schedules: {
      shifts: r.many.shifts(),
    },

    shiftTemplates: {
      shifts: r.many.shifts(),
    },

    shifts: {
      employee: r.one.employees({
        from: r.shifts.employeeId,
        to: r.employees.id,
      }),

      schedule: r.one.schedules({
        from: r.shifts.scheduleId,
        to: r.schedules.id,
      }),

      template: r.one.shiftTemplates({
        from: r.shifts.templateId,
        to: r.shiftTemplates.id,
      }),
    },
  })
);
