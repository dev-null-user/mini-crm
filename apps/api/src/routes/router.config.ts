
import { employeesRoute } from '../controllers/employees';
import { createSchedulesRoute } from '../controllers/schedules';
import type { RouteGroup } from './router';

export function createRoutesConfig(onChanged: (scheduleId: string, kind: string) => void): RouteGroup {
    return {
        path: '/v1',
        groups: {
          employees: {
            path: '/employees',
            router: employeesRoute
          },
          schedules: {
            path: '/schedules',
            router: createSchedulesRoute(onChanged)
          }
        }
  };
}
