import { db } from '../database/db.js';
import { itnChannelUsers } from '../database/schema/schema.js';
import { eq } from 'drizzle-orm';

export async function getAllUsers() {
  return await db.select().from(itnChannelUsers);
}

export async function getUserById(userId) {
  const users = await db.select().from(itnChannelUsers).where(eq(itnChannelUsers.userId, userId));
  return users.length > 0 ? users[0] : null;
}

export async function createNewUser(userData) {
  return await db.insert(itnChannelUsers).values(userData);
}

// export async function getAllUsers() {
//   try {
//     return await db.select().from(itnChannelUsers);
//   } catch (error) {
//     console.error('Get all users error:', error);
//     throw new Error(`Failed to get users: ${error.message}`);
//   }
// }

// export async function getUserById(userId) {
//   try {
//     return await db
//       .select()
//       .from(itnChannelUsers)
//       .where(eq(itnChannelUsers.userId, userId));
//   } catch (error) {
//     console.error('Get user by ID error:', error);
//     throw new Error(`Failed to get user: ${error.message}`);
//   }
// }

export async function updateUser(userId, updates) {
  try {
    const result = await db
      .update(itnChannelUsers)
      .set(updates)
      .where(eq(itnChannelUsers.userId, userId));

    return result;
  } catch (error) {
    console.error('Update user error:', error);
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

export async function deleteUser(userId) {
  try {
    const result = await db
      .update(itnChannelUsers)
      .set({
        status: 'DELETED',
        deletedOn: new Date(),
      })
      .where(eq(itnChannelUsers.userId, userId));

    return result;
  } catch (error) {
    console.error('Delete user error:', error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}