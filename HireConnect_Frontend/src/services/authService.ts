import type { AuthCredentials, RegisterPayload, User } from '../types';
import { mockUsers, DEMO_ACCOUNTS } from '../data/mock/users';
import { apiClient, simulateLatency, ApiError } from './apiClient';
import { mapBackendUserToUser } from './adapters';

// In-memory mutable copy so registrations persist for mock fallback session.
const fallbackUsers: User[] = [...mockUsers];

const TOKEN_KEY = 'hireconnect_token';
const USER_KEY = 'hireconnect_user';

function issueMockToken(user: User): string {
  return btoa(`${user.id}:${user.role}:${Date.now()}`);
}

interface BackendAuthResponse {
  accessToken: string;
  tokenType?: string;
  user: any;
}

export const authService = {
  async login({ email, password }: AuthCredentials): Promise<User> {
    // 1. Try real backend first
    try {
      const res = await apiClient.post<BackendAuthResponse>('/auth/login', {
        email: email.trim(),
        password,
      });

      if (res && res.accessToken && res.user) {
        const token = res.accessToken;
        const user = mapBackendUserToUser(res.user);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
    } catch (backendError) {
      console.warn('[authService.login] Real backend login failed, attempting mock fallback:', backendError);

      // Check if we can fallback to mock demo accounts or mock users
      const demoMatch = DEMO_ACCOUNTS.find(
        (d) => d.email.toLowerCase() === email.trim().toLowerCase() && d.password === password
      );
      const mockUser = fallbackUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

      if (mockUser && (demoMatch || password.length >= 6)) {
        await simulateLatency();
        if (mockUser.status === 'BLOCKED') {
          throw new ApiError('This account has been blocked. Contact support.', 403);
        }
        const token = issueMockToken(mockUser);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
        return mockUser;
      }

      // If neither backend nor mock succeeded, rethrow the real backend error
      if (backendError instanceof ApiError) {
        throw backendError;
      }
      throw new ApiError(
        (backendError as Error)?.message || 'Invalid email or password.',
        401
      );
    }

    throw new ApiError('Invalid response from server.', 500);
  },

  async register(payload: RegisterPayload): Promise<User> {
    // 1. Try real backend first
    try {
      const res = await apiClient.post<BackendAuthResponse>('/auth/register', {
        name: payload.fullName.trim(),
        email: payload.email.trim(),
        password: payload.password,
        role: payload.role,
      });

      if (res && res.accessToken && res.user) {
        const token = res.accessToken;
        const user = mapBackendUserToUser(res.user);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
    } catch (backendError) {
      console.warn('[authService.register] Real backend registration failed, falling back to mock:', backendError);

      await simulateLatency();

      if (fallbackUsers.some((u) => u.email.toLowerCase() === payload.email.trim().toLowerCase())) {
        throw new ApiError('An account with this email already exists.', 409);
      }

      const newUser: User = {
        id: `u${fallbackUsers.length + 1}`,
        fullName: payload.fullName.trim(),
        email: payload.email.trim(),
        role: payload.role,
        status: 'ACTIVE',
        profileCompletion: 20,
        createdAt: new Date().toISOString(),
      };
      fallbackUsers.push(newUser);

      const token = issueMockToken(newUser);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return newUser;
    }

    throw new ApiError('Invalid registration response from server.', 500);
  },

  async logout(): Promise<void> {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
};
