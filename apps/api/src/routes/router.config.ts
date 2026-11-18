
import type { RouteGroup } from './router';

import { routesTest } from './test';

type ScheduleChanged = (
  scheduleId: string,
  kind: string
) => void;

export function createRoutesConfig(onChanged: ScheduleChanged): RouteGroup {
    return {
        path: '/v1',

        groups: {
        test: {
            path: '/test',
            router: routesTest,
        },
    }
  };
}