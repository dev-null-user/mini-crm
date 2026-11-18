import { defineConfig } from 'drizzle-kit';
import { resolveDatabaseUrl } from './src/env';

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: resolveDatabaseUrl(),
  },
  verbose: true,
});