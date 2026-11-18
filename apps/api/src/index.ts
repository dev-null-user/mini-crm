import { Server as BunEngine } from '@socket.io/bun-engine';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { Server as SocketServer } from 'socket.io';
import { z } from 'zod';

import { errorHandler, notFoundHandler } from './middleware/error-handler';

import { createApiRoutes } from './routes';

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

const onScheduleChanged = (
  scheduleId: string,
  kind: string
) => {
  io.to(`schedule:${scheduleId}`).emit(
    'schedule:updated',
    {
      scheduleId,
      kind,
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

  socket.on('schedule:join', (scheduleId: unknown) => {
    const result = z.uuid().safeParse(scheduleId);

    if (result.success) {
      socket.join(`schedule:${result.data}`);
    }
  });

  socket.on('schedule:leave', (scheduleId: unknown) => {
    const result = z.uuid().safeParse(scheduleId);

    if (result.success) {
      socket.leave(`schedule:${result.data}`);
    }
  });
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
