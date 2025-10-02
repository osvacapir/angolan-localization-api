import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ApiError } from '@/types';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Default error response
  let statusCode = 500;
  let message = 'Erro interno do servidor';
  let code = 'INTERNAL_ERROR';

  // Handle different types of errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dados de entrada inválidos';
    code = 'VALIDATION_ERROR';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Não autorizado';
    code = 'UNAUTHORIZED';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Acesso negado';
    code = 'FORBIDDEN';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Recurso não encontrado';
    code = 'NOT_FOUND';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    message = 'Conflito de dados';
    code = 'CONFLICT';
  } else if (error.name === 'TooManyRequestsError') {
    statusCode = 429;
    message = 'Muitas requisições';
    code = 'TOO_MANY_REQUESTS';
  } else if (error.code === 'P2002') {
    statusCode = 409;
    message = 'Registro duplicado encontrado';
    code = 'DUPLICATE_ENTRY';
  } else if (error.code === 'P2025') {
    statusCode = 404;
    message = 'Registro não encontrado';
    code = 'NOT_FOUND';
  } else if (error.code === 'P2003') {
    statusCode = 400;
    message = 'Violação de chave estrangeira';
    code = 'FOREIGN_KEY_VIOLATION';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Erro interno do servidor';
  }

  const errorResponse: ApiError = {
    code,
    message,
    ...(process.env.NODE_ENV === 'development' && { details: error.stack }),
  };

  res.status(statusCode).json({
    success: false,
    error: errorResponse,
    timestamp: new Date().toISOString(),
  });
};
