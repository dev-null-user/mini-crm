
import { employeesRoute } from '../controllers/employees';
import type { RouteGroup } from './router';

import { routesTest } from './test';

export function createRoutesConfig(): RouteGroup {
    return {
        path: '/v1',
        groups: {
          employees: {
            path: '/employees',
            router: employeesRoute
          }
        }
  };
}