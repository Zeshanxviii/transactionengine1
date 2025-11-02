import { db } from '../database/db.js';
import { itnChannelUsers } from '../database/schema/schema.js';
import { eq } from 'drizzle-orm';

export async function getAllUsers() {
  return await db.select().from(itnChannelUsers);
}

export async function getUserById(userId) {
  return await db.select().from(itnChannelUsers).where(eq(itnChannelUsers.userId, userId));
}

export async function createNewUser(userData) {
  return await db.insert(itnChannelUsers).values(userData);
}