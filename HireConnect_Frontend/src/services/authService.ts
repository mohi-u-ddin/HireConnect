import type { AuthCredentials, RegisterPayload, User } from '../types';
import { mockUsers, DEMO_ACCOUNTS } from '../data/mock/users';
import { simulateLatency, ApiError } from './apiClient';

// In-memory mutable copy so registrations persist for the session.
const users: User[] = [...mockUsers];

const TOKEN_KEY = 'hireflow_token';
const USER_KEY = 'hireflow_user';

function issueMockToken(user: User): string {
  // NOT a real JWT. This is only a placeholder so the rest of the app can
  // treat "having a token" the same way it will once Spring Security JWT
  // issues real bearer tokens.
  return btoa(`${user.id}:${user.role}:${Date.now()}`);
}

export const authService = {
  async login({ email, password }: AuthCredentials): Promise<User> {
    await simulateLatency();

    const demoMatch = DEMO_ACCOUNTS.find(
      (d) => d.email.toLowerCase() === email.toLowerCase() && d.password === password
    );
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || (!demoMatch && password.length < 6)) {
      throw new ApiError('Invalid email or password.', 401);
    }
    if (user.status === 'BLOCKED') {
      throw new ApiError('This account has been blocked. Contact support.', 403);
    }

    const token = issueMockToken(user);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  async register(payload: RegisterPayload): Promise<User> {
    await simulateLatency();

    if (users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
      throw new ApiError('An account with this email already exists.', 409);
    }

    const newUser: User = {
      id: `u${users.length + 1}`,
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role,
      status: 'ACTIVE',
      profileCompletion: 20,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);

    const token = issueMockToken(newUser);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return newUser;
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
