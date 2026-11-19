import { Hono } from 'hono';
import { db, employees } from '@shift/db';
import { like } from 'drizzle-orm';
import ValidReqEmployees from '../validators/req-employees';

export const employeesRoute = new Hono;

employeesRoute.get('/search', async (c: any) => {
    const params = ValidReqEmployees(c.req.query());

    const data = await db.select().from(employees).where(like(employees.fullName, `%${params.fullName}%`));    
    
    return c.json({data});
});