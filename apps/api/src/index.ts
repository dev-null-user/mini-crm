import { Server as BunEngine } from '@socket.io/bun-engine';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Server as SocketServer } from 'socket.io';

import { errorHandler, notFoundHandler } from './middleware/error-handler';

import { createApiRoutes } from './routes';
import type { ScheduleChanged } from './controllers/schedules';

const hostname = process.env.API_HOST ?? '0.0.0.0';

const port = Number(process.env.API_PORT ?? 3001);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid API port: ${port}`);
}

const origins = (
  process.env.CORS_ORIGIN ?? 'http://localhost:3000'
)
.split(',')
.map((origin) => origin.trim())
.filter(Boolean);

const app = new Hono();

app.get('/health', (c) => c.json({ status: 'ok' }));

app.use('/api/*', cors({
  origin: origins,
}));

const io = new SocketServer();

const engine = new BunEngine({
  path: '/socket.io/',
  cors: {
    origin: origins,
  },
});

io.bind(engine);

const onScheduleChanged: ScheduleChanged = (change) => {
  io.emit(
    'schedule:updated',
    {
      ...change,
      timestamp: new Date().toISOString(),
    }
  );
};

app.route('/api', createApiRoutes(onScheduleChanged));

app.onError(errorHandler);

app.notFound(notFoundHandler);

io.on('connection', (socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  io.emit('demo:users', io.of('/').sockets.size);

});

const { websocket } = engine.handler();

const server = Bun.serve({
  hostname,
  port,
  idleTimeout: 30,

  fetch(request: any, server: any) {
    const pathname = new URL(request.url).pathname;

    if (pathname === '/socket.io' || pathname === '/socket.io/') {
      return engine.handleRequest(request, server);
    }

    return app.fetch(request, server);
  },

  websocket,
});

console.log(
  `[api] Server running: http://${hostname}:${server.port}`
);
