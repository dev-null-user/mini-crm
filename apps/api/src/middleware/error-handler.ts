import type { ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { ZodError } from 'zod';
import { ValidationError } from '../errors/validation-error';

type ErrorDefinition = { status: ContentfulStatusCode; message: string };

export const ERROR_CODES = {
  // API / бизнес-логика
  BAD_REQUEST: { status: 400, message: 'Некорректный запрос' },
  VALIDATION_ERROR: { status: 400, message: 'Некорректные данные' },
  UNAUTHORIZED: { status: 401, message: 'Требуется авторизация' },
  FORBIDDEN: { status: 403, message: 'Недостаточно прав' },
  NOT_FOUND: { status: 404, message: 'Ресурс не найден' },
  METHOD_NOT_ALLOWED: { status: 405, message: 'Метод не поддерживается' },
  CONFLICT: { status: 409, message: 'Конфликт данных' },
  SHIFT_ALREADY_EXISTS: { status: 409, message: 'Смена уже назначена на эту дату' },
  SCHEDULE_PUBLISHED: { status: 409, message: 'Опубликованный график нельзя изменить' },
  VERSION_CONFLICT: { status: 409, message: 'График изменён другим пользователем' },
  TOO_MANY_REQUESTS: { status: 429, message: 'Слишком много запросов' },
  DATABASE_UNAVAILABLE: { status: 503, message: 'База данных временно недоступна' },
  DATABASE_ERROR: { status: 500, message: 'Ошибка при работе с базой данных' },
  INTERNAL_ERROR: { status: 500, message: 'Внутренняя ошибка сервера' },

  // PostgreSQL SQLSTATE: нарушения ограничений
  '23505': { status: 409, message: 'Запись уже существует' },
  '23503': { status: 400, message: 'Ссылка на несуществующую запись' },
  '23502': { status: 400, message: 'Не заполнено обязательное поле' },
  '23514': { status: 400, message: 'Нарушено ограничение данных' },
  '23P01': { status: 409, message: 'Записи конфликтуют между собой' },

  // PostgreSQL SQLSTATE: некорректные значения
  '22P02': { status: 400, message: 'Неверный формат значения' },
  '22001': { status: 400, message: 'Значение превышает допустимую длину' },
  '22003': { status: 400, message: 'Число вне допустимого диапазона' },
  '22007': { status: 400, message: 'Некорректный формат даты или времени' },
  '22008': { status: 400, message: 'Дата или время вне допустимого диапазона' },
  '22023': { status: 400, message: 'Некорректный параметр' },

  // PostgreSQL SQLSTATE: транзакции / блокировки
  '40001': { status: 409, message: 'Конфликт транзакций, повторите запрос' },
  '40P01': { status: 503, message: 'Конфликт блокировок, повторите запрос' },
  '55P03': { status: 503, message: 'Ресурс временно заблокирован' },
  '57014': { status: 503, message: 'Операция с базой данных прервана' },
  '53300': { status: 503, message: 'База данных перегружена' },
  '57P03': { status: 503, message: 'База данных запускается или недоступна' },
} as const satisfies Record<string, ErrorDefinition>;

export type ApiErrorCode = keyof typeof ERROR_CODES;

export class AppError extends Error {
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(code: ApiErrorCode, options?: { message?: string; details?: unknown; cause?: unknown }) {
    super(options?.message ?? ERROR_CODES[code].message, { cause: options?.cause });
    this.name = 'AppError';
    this.code = code;
    this.details = options?.details;
  }
}

function findDbCode(error: unknown): string | undefined {
  const visited = new Set<unknown>();
  let current: unknown = error;

  for (let i = 0; i < 8 && current && typeof current === 'object'; i++) {
    if (visited.has(current)) break;
    visited.add(current);
    const item = current as { code?: unknown; cause?: unknown; originalError?: unknown };
    if (typeof item.code === 'string') {
      if (/^[0-9A-Z]{5}$/.test(item.code) ||
          ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH'].includes(item.code)) {
        return item.code;
      }
    }
    current = item.cause ?? item.originalError;
  }
  return undefined;
}

function resolveDbError(code: string): { code: string; status: ContentfulStatusCode; message: string } {
  if (code in ERROR_CODES) {
    const key = code as ApiErrorCode;
    return { code: key, ...ERROR_CODES[key] };
  }
  if (['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH'].includes(code) ||
      code.startsWith('08')) {
    return { code: 'DATABASE_UNAVAILABLE', ...ERROR_CODES.DATABASE_UNAVAILABLE };
  }
  return { code: 'DATABASE_ERROR', ...ERROR_CODES.DATABASE_ERROR };
}

function httpCode(status: number): string {
  switch (status) {
    case 400: return 'BAD_REQUEST';
    case 401: return 'UNAUTHORIZED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 405: return 'METHOD_NOT_ALLOWED';
    case 409: return 'CONFLICT';
    case 429: return 'TOO_MANY_REQUESTS';
    default: return status >= 500 ? 'INTERNAL_ERROR' : 'HTTP_ERROR';
  }
}

export const errorHandler: ErrorHandler = (error, c) => {
  let code: string = 'INTERNAL_ERROR';
  let status: ContentfulStatusCode = 500;
  let message: string = ERROR_CODES.INTERNAL_ERROR.message;
  let details: unknown;


  if (error instanceof AppError) {
    code = error.code;
    status = ERROR_CODES[error.code].status;
    message = status >= 500 ? ERROR_CODES[error.code].message : error.message;
    if (status < 500) details = error.details;

  } else if (error instanceof ValidationError) {
    code = 'VALIDATION_ERROR';
    status = 400;
    message = ERROR_CODES.VALIDATION_ERROR.message;

    details = error.issues.map((issue) => ({
      field: issue.path,
      code: issue.code,
      message: issue.message,
    }));
  } else if (error instanceof ZodError) {
    code = 'VALIDATION_ERROR';
    status = 400;
    message = ERROR_CODES.VALIDATION_ERROR.message;
    details = error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
  } else if (error instanceof HTTPException) {
    status = error.status;
    code = httpCode(status);
    message = status >= 500 ? ERROR_CODES.INTERNAL_ERROR.message : error.message;
  } else {
    const dbCode = findDbCode(error);
    if (dbCode) {
      ({ code, status, message } = resolveDbError(dbCode));
    }
  }

  const requestId = crypto.randomUUID();
  if (status >= 500) {
    // Подробности ошибки — только в серверном логе.
    console.error(`[api][${requestId}]`, { code, path: c.req.path, method: c.req.method, error });
  }

  return c.json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
    requestId,
  }, status);
};

export const notFoundHandler: NotFoundHandler = (c) => {
  return c.json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Маршрут не найден' },
  }, 404);
};
