import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { findByEmail, findById } from "../models/UserModel";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      message: "Email and password are required.",
    });
  }

  const user = findByEmail(email.trim());

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password.",
    });
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    return res.status(401).json({
      message: "Invalid email or password.",
    });
  }

  if (!req.session) {
    return res.status(500).json({
      message: "Session is unavailable.",
    });
  }

  req.session.userId = user.id;

  return res.status(200).json({
    user: {
      email: user.email,
    },
  });
}

export function logout(req: Request, res: Response) {
  req.session = null;

  return res.status(200).json({
    message: "Logged out successfully.",
  });
}

export function me(req: Request, res: Response) {
  const userId = req.session?.userId;

  if (typeof userId !== "number") {
    return res.status(401).json({
      message: "Unauthorized.",
    });
  }

  const user = findById(userId);

  if (!user) {
    req.session = null;

    return res.status(401).json({
      message: "Unauthorized.",
    });
  }

  return res.status(200).json({
    user: {
      email: user.email,
    },
  });
}