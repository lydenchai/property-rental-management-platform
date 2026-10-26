import { createError, H3Event } from 'h3';
import { ZodError } from 'zod';
import type { ApiResponse } from '../../shared/types/api';

export type { ApiResponse };

export function createApiResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function handleApiError(event: H3Event, error: unknown): ApiResponse<never> {
  if (error instanceof ZodError) {
    event.node.res.statusCode = 400;
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.flatten().fieldErrors,
      },
    };
  }

  const err = error as { statusCode?: number; statusMessage?: string; message?: string };
  const statusCode = err.statusCode || 500;
  event.node.res.statusCode = statusCode;

  return {
    success: false,
    error: {
      code:
        statusCode === 401
          ? 'UNAUTHORIZED'
          : statusCode === 403
            ? 'FORBIDDEN'
            : statusCode === 404
              ? 'NOT_FOUND'
              : 'INTERNAL_SERVER_ERROR',
      message: err.statusMessage || err.message || 'An unexpected error occurred',
    },
  };
}

export function unauthorizedError(message = 'Authentication required') {
  return createError({
    statusCode: 401,
    statusMessage: message,
  });
}

export function forbiddenError(message = 'You do not have permission to perform this action') {
  return createError({
    statusCode: 403,
    statusMessage: message,
  });
}

export function notFoundError(message = 'Resource not found') {
  return createError({
    statusCode: 404,
    statusMessage: message,
  });
}

export function badRequestError(message = 'Invalid request parameters') {
  return createError({
    statusCode: 400,
    statusMessage: message,
  });
}

export const createNotFoundError = notFoundError;
export const createForbiddenError = forbiddenError;
export const createUnauthorizedError = unauthorizedError;
export const createValidationError = badRequestError;
