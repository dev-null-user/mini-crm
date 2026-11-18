
import type { Hono } from 'hono';

export type RouteGroup = {
  path: string;
  router?: Hono;
  groups?: Record<string, RouteGroup>;
};

export function registerRoutes(
  app: Hono,
  group: RouteGroup,
  parentPath = ''
): void {
  const path = `${parentPath}/${group.path}`
    .replace(/\/+/g, '/')
    .replace(/\/$/, '') || '/';

  if (group.router) {
    app.route(path, group.router);
  }

  if (group.groups) {
    for (const child of Object.values(group.groups)) {
      registerRoutes(app, child, path);
    }
  }
}