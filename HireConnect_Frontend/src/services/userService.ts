import type { User, UserStatus } from '../types';
import { mockUsers } from '../data/mock/users';
import { simulateLatency, ApiError } from './apiClient';

const users: User[] = [...mockUsers];

// Saved jobs kept per-user in memory (would live server-side eventually).
const savedJobsByUser = new Map<string, Set<string>>([['u1', new Set(['j5', 'j10', 'j16', 'j18'])]]);

export const userService = {
  async getMe(userId: string): Promise<User> {
    await simulateLatency();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new ApiError('User not found.', 404);
    return user;
  },

  async updateMe(userId: string, payload: Partial<User>): Promise<User> {
    await simulateLatency();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new ApiError('User not found.', 404);
    users[idx] = { ...users[idx], ...payload };
    return users[idx];
  },

  async deleteMe(userId: string): Promise<void> {
    await simulateLatency();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new ApiError('User not found.', 404);
    users.splice(idx, 1);
  },

  async getSavedJobIds(userId: string): Promise<string[]> {
    await simulateLatency(80, 150);
    return Array.from(savedJobsByUser.get(userId) ?? []);
  },

  async toggleSavedJob(userId: string, jobId: string): Promise<boolean> {
    await simulateLatency(80, 150);
    const set = savedJobsByUser.get(userId) ?? new Set<string>();
    let saved: boolean;
    if (set.has(jobId)) {
      set.delete(jobId);
      saved = false;
    } else {
      set.add(jobId);
      saved = true;
    }
    savedJobsByUser.set(userId, set);
    return saved;
  },

  // --- Admin operations -----------------------------------------------
  async getAllUsers(): Promise<User[]> {
    await simulateLatency();
    return [...users];
  },

  async setUserStatus(userId: string, status: UserStatus): Promise<User> {
    await simulateLatency();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new ApiError('User not found.', 404);
    users[idx] = { ...users[idx], status };
    return users[idx];
  },

  async deleteUser(userId: string): Promise<void> {
    await simulateLatency();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new ApiError('User not found.', 404);
    users.splice(idx, 1);
  },
};
