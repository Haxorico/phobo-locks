import type { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";

export function parseObjectId(id: unknown): ObjectId | null {
  if (typeof id !== "string" || !ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}


type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export function asyncHandler(fn: AsyncController) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}