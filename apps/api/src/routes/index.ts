
import { Hono } from 'hono';

import { registerRoutes } from './router';
import { createRoutesConfig } from './router.config';
import type { ScheduleChanged } from '../controllers/schedules';

export function createApiRoutes(
  onChanged: ScheduleChanged
) {
  const api = new Hono();

  registerRoutes(
    api,
    createRoutesConfig(onChanged)
  );

  return api;
}
