
import { Hono } from 'hono';

import { registerRoutes } from './router';
import { createRoutesConfig } from './router.config';

type ScheduleChanged = (
  scheduleId: string,
  kind: string
) => void;

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