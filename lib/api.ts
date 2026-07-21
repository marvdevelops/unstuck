import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const KEYS = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
};

// ── Token storage ────────────────────────────────────────────────────────────

export async function saveTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync(KEYS.accessToken, access);
  await SecureStore.setItemAsync(KEYS.refreshToken, refresh);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(KEYS.accessToken);
  await SecureStore.deleteItemAsync(KEYS.refreshToken);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(KEYS.accessToken);
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    // Try refresh
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, false);
    throw new ApiError(401, 'Session expired');
  }

  const data = await res.json();
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Request failed');
  return data as T;
}

// Fired when a refresh token that existed on-device gets rejected by the
// server — i.e. the session was revoked (most commonly: the account was
// logged into elsewhere, which signs out every other device). Not fired
// for a plain "never logged in" or offline state.
type Listener = () => void;
let sessionKickedListeners: Listener[] = [];
export function onSessionKicked(cb: Listener): () => void {
  sessionKickedListeners.push(cb);
  return () => { sessionKickedListeners = sessionKickedListeners.filter((l) => l !== cb); };
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = await SecureStore.getItemAsync(KEYS.refreshToken);
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      await clearTokens();
      sessionKickedListeners.forEach((cb) => cb());
      return false;
    }
    const { accessToken, refreshToken: newRefresh } = await res.json();
    await saveTokens(accessToken, newRefresh);
    return true;
  } catch {
    // Network error (e.g. offline) — don't treat as a kicked session
    return false;
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// ── Auth endpoints ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  stuckPattern: string | null;
  goal: string | null;
  accountabilityStyle: string | null;
  tier: 'free' | 'basic' | 'cohort' | 'vip' | 'alumni';
  isAlumni: boolean;
  cohortId: string | null;
  vipFlag: boolean;
  coreValues: string[] | null;
  createdAt: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export const api = {
  auth: {
    register: (email: string, password: string, firstName?: string) =>
      request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, firstName }),
      }),

    login: (email: string, password: string) =>
      request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    logout: async () => {
      const refreshToken = await SecureStore.getItemAsync(KEYS.refreshToken);
      await request('/api/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) });
      await clearTokens();
    },

    me: () => request<UserProfile>('/api/auth/me'),

    saveOnboarding: (data: {
      stuck_pattern?: string;
      goal?: string;
      accountability_style?: string;
      first_name?: string;
    }) => request<UserProfile>('/api/auth/onboarding', { method: 'PATCH', body: JSON.stringify(data) }),

    saveCoreValues: (core_values: string[]) =>
      request<UserProfile>('/api/auth/core-values', { method: 'PATCH', body: JSON.stringify({ core_values }) }),
  },

  progress: {
    getAll: () => request<any[]>('/api/progress'),
    upsertDay: (day: number, payload: {
      video_watched?: boolean;
      tasks_complete?: any;
      journal?: string;
      celebrated?: boolean;
    }) => request(`/api/progress/${day}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  },

  iap: {
    verify: (platform: 'ios' | 'android', receipt: string, productId: string) =>
      request<{ ok: boolean; user: UserProfile }>('/api/iap/verify', {
        method: 'POST',
        body: JSON.stringify({ platform, receipt, productId }),
      }),
  },
};
