import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (process.env.NODE_ENV !== "production" && err.message) {
    message = err.message;
  }

  console.error(
    `[ERROR] status=${err instanceof ApiError ? err.statusCode : 500} isOperational=${err instanceof ApiError ? "true" : "false"} message=${err.message}`,
    err.stack
  );

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
