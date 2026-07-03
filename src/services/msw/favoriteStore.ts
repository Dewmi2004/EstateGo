// src/services/msw/favoriteStore.ts
// In-memory favorites CRUD, keyed by userId -> Set of property ids.
// Shared by handlers.ts (native) and webMockAdapter.ts (web).

const favoritesByUser = new Map<string, Set<string>>();

function getSetFor(userId: string): Set<string> {
  if (!favoritesByUser.has(userId)) {
    favoritesByUser.set(userId, new Set());
  }
  return favoritesByUser.get(userId)!;
}

export const favoriteStore = {
  list(userId: string): string[] {
    return Array.from(getSetFor(userId));
  },

  add(userId: string, propertyId: string): void {
    getSetFor(userId).add(propertyId);
  },

  remove(userId: string, propertyId: string): void {
    getSetFor(userId).delete(propertyId);
  },

  isFavorite(userId: string, propertyId: string): boolean {
    return getSetFor(userId).has(propertyId);
  },
};
