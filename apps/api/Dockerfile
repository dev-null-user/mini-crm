FROM oven/bun:1.4.4-debian

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN bun install --frozen-lockfile

COPY apps/api ./apps/api
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared

ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=3001

USER bun
EXPOSE 3001
CMD ["bun", "run", "apps/api/src/index.ts"]
