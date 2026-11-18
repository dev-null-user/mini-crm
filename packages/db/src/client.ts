
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { relations } from './relations';
import { resolveDatabaseUrl } from './env';

export const sqlClient = postgres(resolveDatabaseUrl(), {
  max: Number(process.env.DB_POOL_MAX ?? '10'),
});

export const db = drizzle({
  client: sqlClient,
  relations,
});
