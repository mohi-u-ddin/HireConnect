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

const envApiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
export const API_BASE_URL = envApiBase ? envApiBase.replace(/\/+$/, '') : '';

/** Simulated network latency for mock fallback so UI feedback remains smooth. */
export function simulateLatency(min = 100, max = 300): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(message: string, status = 400, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getAuthToken(): string | null {
  return localStorage.getItem('hireconnect_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    let message = body.message || body.error;
    if (!message && body.validationErrors && typeof body.validationErrors === 'object') {
      message = Object.values(body.validationErrors).join(', ');
    }
    throw new ApiError(message ?? `Request failed with status ${response.status}`, response.status, body);
  }

  // Handle empty bodies (e.g. 204 No Content)
  if (response.status === 204) {
    return {} as T;
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
