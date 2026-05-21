import { create } from 'zustand';

const TOKEN_KEY   = 'access_token';
const REFRESH_KEY = 'refresh_token';
const ROLE_KEY    = 'user_role';

export const useAuthStore = create((set, get) => ({
  token:           localStorage.getItem(TOKEN_KEY)   || null,
  refreshToken:    localStorage.getItem(REFRESH_KEY) || null,
  role:            localStorage.getItem(ROLE_KEY)    || null,
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),

  setTokens: ({ access_token, refresh_token, role }) => {
    localStorage.setItem(TOKEN_KEY,   access_token);
    localStorage.setItem(REFRESH_KEY, refresh_token);
    localStorage.setItem(ROLE_KEY,    role ?? 'parent');
    set({
      token:           access_token,
      refreshToken:    refresh_token,
      role:            role ?? 'parent',
      isAuthenticated: true,
    });
  },

  refreshAccessToken: async () => {
    const refresh_token = get().refreshToken;
    if (!refresh_token) return false;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ refresh_token }),
        }
      );
      if (!res.ok) {
        get().logout();
        return false;
      }
      const data = await res.json();
      localStorage.setItem(TOKEN_KEY,   data.access_token);
      localStorage.setItem(REFRESH_KEY, data.refresh_token);
      set({ token: data.access_token, refreshToken: data.refresh_token });
      return true;
    } catch {
      get().logout();
      return false;
    }
  },

  logout: async () => {
    const refresh_token = get().refreshToken;
    const token         = get().token;
    if (refresh_token && token) {
      fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/logout`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ refresh_token }),
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ROLE_KEY);
    set({ token: null, refreshToken: null, role: null, isAuthenticated: false });
  },

  isAdmin: () => get().role === 'admin',
  isParent: () => get().role === 'parent',
}));