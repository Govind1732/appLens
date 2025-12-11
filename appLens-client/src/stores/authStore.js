import { create } from 'zustand';

const TOKEN_KEY = 'applens_token';
const USER_KEY = 'applens_user';

export const useAuthStore = create((set) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false, // Track if we've loaded from localStorage

  // Actions
  login: (user, token) => {
    // Persist to localStorage
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // Update state
    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    // Clear localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Clear state
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  hydrateFromStorage: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
          isHydrated: true,
        });
        return;
      } catch {
        // Invalid JSON in localStorage, clear it
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    // Mark as hydrated even if no valid session found
    set({ isHydrated: true });
  },
}));

export default useAuthStore;
