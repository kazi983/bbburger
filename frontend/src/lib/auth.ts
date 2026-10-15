import type { PublicUser as User } from "../../../shared/types";

const API_URL = import.meta.env.PUBLIC_API_URL;

type AuthResponse = {
  user: User;
};

export async function login(
  email: string,
  password: string,
): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Invalid email or password.");
    }

    throw new Error("Login failed.");
  }

  const data: AuthResponse = await res.json();

  return data.user;
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Logout failed.");
  }
}

export async function getMe(): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      credentials: "include",
    });

    if (!res.ok) {
      return null;
    }

    const data: AuthResponse = await res.json();

    return data.user;
  } catch {
    return null;
  }
}
