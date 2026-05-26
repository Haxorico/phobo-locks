import type { Request, Response, NextFunction } from "express";
import { isHttpError } from "http-errors";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (isHttpError(err)) {
    return res.status(err.status).json({ error: err.message });
  }

  res.status(500).json({ error: "Internal server error" });
}