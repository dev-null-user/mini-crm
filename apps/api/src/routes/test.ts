import { Hono } from 'hono';
import { db, employees } from '@shift/db';

export const routesTest = new Hono;

routesTest.get('/', async (c: any) => {
    const data = await db.select().from(employees);

    return c.json(data);
});