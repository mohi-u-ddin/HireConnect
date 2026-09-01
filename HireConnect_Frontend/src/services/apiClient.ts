// ---------------------------------------------------------------------------
// Central API client. Every mock service is written to look and behave like
// it is already calling a real backend, so that swapping the mock
// implementations below for real `apiClient.get/post/...` calls against the
// Spring Boot API is a drop-in change.
//
// Future usage once the backend exists:
//
//   const res = await apiClient.get<Job[]>('/jobs');
//
// The base URL will come from VITE_API_BASE_URL, e.g.
//   VITE_API_BASE_URL=http://localhost:8080/api
// ---------------------------------------------------------------------------

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** Simulated network latency so loading states are visible in the mock UI. */
export function simulateLatency(min = 250, max = 600): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getAuthToken(): string | null {
  return localStorage.getItem('hireconnect_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.message ?? 'Request failed', response.status);
  }

  return response.json() as Promise<T>;
}

/**
 * apiClient is the single place that will talk HTTP to the Spring Boot
 * backend. Mock services currently do NOT call this (they read from
 * src/data/mock instead) but are shaped so that swapping the body of each
 * service method for a call to `apiClient.get/post/put/patch/delete` is the
 * only change required.
 */
export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
