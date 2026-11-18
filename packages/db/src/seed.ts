import { eq } from 'drizzle-orm';
import { db, sqlClient } from './client';
import { employees, shiftTemplates } from './schema';

const names = [
  'Кузнецова Алина', 'Волков Тимур', 'Морозова Виктория',
  'Соколов Артём', 'Лебедева Полина', 'Новиков Кирилл',
  'Ерохина Дарья', 'Гаврилов Егор',
];
const templates = [
  { name: 'Утро', startTime: '07:00', endTime: '15:00' },
  { name: 'День', startTime: '10:00', endTime: '18:00' },
  { name: 'Вечер', startTime: '15:00', endTime: '23:00' },
];

try {
  for (const fullName of names) {
    const [existing] = await db.select({ id: employees.id }).from(employees)
      .where(eq(employees.fullName, fullName)).limit(1);
    if (!existing) {
      await db.insert(employees).values({ fullName });
    }
  }

  for (const template of templates) {
    await db.insert(shiftTemplates).values(template).onConflictDoNothing();
  }
  console.log('Seed completed');
} finally {
  await sqlClient.end();
}
