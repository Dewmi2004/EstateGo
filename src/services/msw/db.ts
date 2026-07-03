// src/services/msw/db.ts
// In-memory mock user database used by MSW handlers.
// Resets every time the app reloads (no real persistence layer yet).

import { User } from '@/types/auth.types';

interface StoredUser extends User {
  password: string; // plain text ONLY because this is a mock dev server, never do this for real
}

const seedUsers: StoredUser[] = [
  {
    id: 'u_1001',
    name: 'Imasha Dewmi',
    email: 'demo@estategoNumbergo.com',
    password: 'password123',
    createdAt: new Date('2026-01-10').toISOString(),
  },
];

export const usersDb = {
  list: (): StoredUser[] => seedUsers,

  findByEmail: (email: string): StoredUser | undefined =>
    seedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()),

  findById: (id: string): StoredUser | undefined => seedUsers.find((u) => u.id === id),

  create: (name: string, email: string, password: string): StoredUser => {
    const newUser: StoredUser = {
      id: `u_${Date.now()}`,
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    seedUsers.push(newUser);
    return newUser;
  },

  update: (id: string, patch: Partial<Pick<StoredUser, 'name' | 'email'>>): StoredUser | undefined => {
    const user = seedUsers.find((u) => u.id === id);
    if (!user) return undefined;
    Object.assign(user, patch);
    return user;
  },

  toPublicUser: (user: StoredUser): User => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  }),
};
