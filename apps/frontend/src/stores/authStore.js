import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../lib/authApi.js";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Computed
      get isAuthenticated() {
        return !!get().token;
      },
      get isAdmin() {
        return get().user?.role === "admin";
      },

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          const { user, token } = response.data;
          set({ user, token, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(name, email, password);
          const { user, token } = response.data;
          set({ user, token, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) return false;

        try {
          const response = await authApi.getProfile(token);
          set({ user: response.data });
          return true;
        } catch (error) {
          // Token is invalid, clear auth state
          set({ user: null, token: null });
          return false;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
