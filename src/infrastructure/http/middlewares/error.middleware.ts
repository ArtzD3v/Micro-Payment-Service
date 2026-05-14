import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { DuplicateEmailError, InvalidBalanceError } from '../../../application/use-cases/create-user.use-case';
import { UserNotFoundError, InvalidAmountError } from '../../../application/use-cases/deposit.use-case';
import { InsufficientFundsError, SelfTransferError } from '../../../application/use-cases/transfer.use-case';
import { UnauthorizedError } from './auth.middleware';
import { InvalidCredentialsError } from '../../../application/use-cases/login.use-case';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Business rule errors — 422 Unprocessable Entity
  if (
    err instanceof DuplicateEmailError ||
    err instanceof InvalidBalanceError ||
    err instanceof InvalidAmountError ||
    err instanceof InsufficientFundsError ||
    err instanceof SelfTransferError ||
    err instanceof InvalidCredentialsError
  ) {
    res.status(422).json({
      success: false,
      error: err.name,
      message: err.message,
    });
    return;
  }

  // Auth errors
  if (err instanceof UnauthorizedError) {
    res.status(401).json({
      success: false,
      error: err.name,
      message: err.message,
    });
    return;
  }

  // Resource not found
  if (err instanceof UserNotFoundError) {
    res.status(404).json({
      success: false,
      error: err.name,
      message: err.message,
    });
    return;
  }

  // Generic / unexpected errors
  console.error('[UnhandledError]', err);
  res.status(500).json({
    success: false,
    error: 'InternalServerError',
    message: 'An unexpected error occurred. Please try again later.',
  });
}
