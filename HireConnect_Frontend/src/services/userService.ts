import type { User, UserStatus } from '../types';
import { mockUsers } from '../data/mock/users';
import { adminDashboardStats } from '../data/mock/dashboard';
import { apiClient, simulateLatency, ApiError } from './apiClient';
import { mapBackendUserToUser } from './adapters';

const fallbackUsers: User[] = [...mockUsers];

function getSavedJobKey(userId: string): string {
  return `hireconnect_saved_jobs_${userId}`;
}

export const userService = {
  async getMe(userId: string): Promise<User> {
    // 1. Try real backend
    try {
      const res = await apiClient.get<any>('/users/me');
      if (res && res.id) {
        return mapBackendUserToUser(res);
      }
    } catch (err) {
      console.warn('[userService.getMe] Backend request failed, falling back to mock:', err);
    }

    // 2. Fallback
    await simulateLatency();
    const user = fallbackUsers.find((u) => String(u.id) === String(userId));
    if (!user) throw new ApiError('User not found.', 404);
    return user;
  },

  async updateMe(userId: string, payload: Partial<User>): Promise<User> {
    // 1. Try real backend
    try {
      const body = {
        name: payload.fullName,
        phone: payload.phone,
        location: payload.location,
        profileImage: payload.avatarUrl,
        headline: payload.headline,
        about: payload.about,
        resumeUrl: payload.resume?.fileName,
      };

      const res = await apiClient.put<any>('/users/me', body);
      if (res && res.id) {
        const updated = mapBackendUserToUser(res);
        localStorage.setItem('hireconnect_user', JSON.stringify(updated));
        return updated;
      }
    } catch (err) {
      console.warn('[userService.updateMe] Backend update failed, falling back to mock:', err);
    }

    // 2. Fallback
    await simulateLatency();
    const idx = fallbackUsers.findIndex((u) => String(u.id) === String(userId));
    if (idx === -1) throw new ApiError('User not found.', 404);
    fallbackUsers[idx] = { ...fallbackUsers[idx], ...payload };
    localStorage.setItem('hireconnect_user', JSON.stringify(fallbackUsers[idx]));
    return fallbackUsers[idx];
  },

  async deleteMe(userId: string): Promise<void> {
    await simulateLatency();
    const idx = fallbackUsers.findIndex((u) => String(u.id) === String(userId));
    if (idx === -1) throw new ApiError('User not found.', 404);
    fallbackUsers.splice(idx, 1);
  },

  async getSavedJobIds(userId: string): Promise<string[]> {
    try {
      const stored = localStorage.getItem(getSavedJobKey(userId));
      if (stored) {
        return JSON.parse(stored) as string[];
      }
    } catch {
      // fallback
    }

    // Initial mock defaults if nothing saved yet
    if (userId === 'u1') {
      return ['j5', 'j10', 'j16', 'j18'];
    }
    return [];
  },

  async toggleSavedJob(userId: string, jobId: string): Promise<boolean> {
    const ids = await this.getSavedJobIds(userId);
    const set = new Set(ids);
    let saved: boolean;
    if (set.has(jobId)) {
      set.delete(jobId);
      saved = false;
    } else {
      set.add(jobId);
      saved = true;
    }
    localStorage.setItem(getSavedJobKey(userId), JSON.stringify(Array.from(set)));
    return saved;
  },

  // --- Admin operations -----------------------------------------------
  async getAllUsers(): Promise<User[]> {
    // 1. Try real backend
    try {
      const res = await apiClient.get<any>('/admin/users?page=0&size=100');
      if (res && Array.isArray(res.content)) {
        return res.content.map(mapBackendUserToUser);
      }
      if (Array.isArray(res)) {
        return res.map(mapBackendUserToUser);
      }
    } catch (err) {
      console.warn('[userService.getAllUsers] Backend request failed, falling back to mock:', err);
    }

    // 2. Fallback
    await simulateLatency();
    return [...fallbackUsers];
  },

  async setUserStatus(userId: string, status: UserStatus): Promise<User> {
    // 1. Try real backend
    try {
      const idNumeric = Number(userId.replace(/\D/g, '')) || Number(userId);
      const res = await apiClient.patch<any>(`/admin/users/${idNumeric}/status`, {
        enabled: status === 'ACTIVE',
      });
      if (res && res.id) {
        return mapBackendUserToUser(res);
      }
    } catch (err) {
      console.warn(`[userService.setUserStatus] Backend request for user ${userId} failed, falling back to mock:`, err);
    }

    // 2. Fallback
    await simulateLatency();
    const idx = fallbackUsers.findIndex((u) => String(u.id) === String(userId));
    if (idx === -1) throw new ApiError('User not found.', 404);
    fallbackUsers[idx] = { ...fallbackUsers[idx], status };
    return fallbackUsers[idx];
  },

  async deleteUser(userId: string): Promise<void> {
    await simulateLatency();
    const idx = fallbackUsers.findIndex((u) => String(u.id) === String(userId));
    if (idx === -1) throw new ApiError('User not found.', 404);
    fallbackUsers.splice(idx, 1);
  },

  async getAdminStats(): Promise<{
    totalUsers: number;
    totalCompanies: number;
    totalJobs: number;
    totalApplications: number;
    totalJobSeekers: number;
    totalEmployers: number;
  }> {
    try {
      const res = await apiClient.get<Record<string, any>>('/admin/stats');
      if (res) {
        const totalUsers = Number(res.totalUsers ?? 0);
        const totalCompanies = Number(res.totalCompanies ?? 0);
        const totalJobs = Number(res.totalJobs ?? 0);
        const totalApplications = Number(res.totalApplications ?? 0);
        const totalJobSeekers = res.totalJobSeekers != null ? Number(res.totalJobSeekers) : Math.max(0, totalUsers - totalCompanies);
        const totalEmployers = res.totalEmployers != null ? Number(res.totalEmployers) : totalCompanies;

        return {
          totalUsers,
          totalCompanies,
          totalJobs,
          totalApplications,
          totalJobSeekers,
          totalEmployers,
        };
      }
    } catch (err) {
      console.warn('[userService.getAdminStats] Backend request failed, falling back to mock:', err);
    }
    return {
      totalUsers: adminDashboardStats.totalUsers,
      totalCompanies: adminDashboardStats.totalEmployers,
      totalJobs: adminDashboardStats.activeJobs,
      totalApplications: adminDashboardStats.totalApplications,
      totalJobSeekers: adminDashboardStats.totalJobSeekers,
      totalEmployers: adminDashboardStats.totalEmployers,
    };
  },
};
