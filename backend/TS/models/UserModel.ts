import bcrypt from "bcrypt";

type User = {
  id: number;
  email: string;
  passwordHash: string;
};

const users: User[] = [];

export function findByEmail(email: string): User | undefined {
  return users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );
}

export function findById(id: number): User | undefined {
  return users.find((user) => user.id === id);
}

export function seedAdmin(): void {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be configured.",
    );
  }

  if (findByEmail(adminEmail)) {
    return;
  }

  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  users.push({
    id: 1,
    email: adminEmail,
    passwordHash,
  });
}