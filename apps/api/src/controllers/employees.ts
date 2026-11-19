import { Hono } from 'hono';
import { db, employees } from '@shift/db';
import { ilike } from 'drizzle-orm';
import ValidReqEmployees from '../validators/req-employees';

export const employeesRoute = new Hono;

employeesRoute.get('/search', async (c: any) => {
    const params = ValidReqEmployees(c.req.query());

    const fullName = params.fullName.trim().replace(/[\\%_]/g, '\\$&');
    const data = await db.select().from(employees).where(ilike(employees.fullName, `%${fullName}%`));
    
    return c.json({data});
});
