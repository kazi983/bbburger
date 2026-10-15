import type { NextFunction, Request, Response } from "express";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.session?.userId;

  if (typeof userId !== "number") {
    return res.status(401).json({
      message: "Unauthorized.",
    });
  }

  next();
}