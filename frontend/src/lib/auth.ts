import type { PublicUser as User } from "../../../shared/types";

const API_URL = import.meta.env.PUBLIC_API_URL;

export function login() {}

export function logout() {}

export async function getMe(): Promise<User | null> {
  const res = await fetch(`${API_URL}/api/auth/me`, { credentials: "include" });
  if (!res.ok) return null;
  return res.json();
}
