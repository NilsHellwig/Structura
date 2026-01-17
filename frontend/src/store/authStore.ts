import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  username: string | null;
  user: { username: string } | null;
  isAuthenticated: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      user: null, // Add user object or just use username
      isAuthenticated: false,
      login: (token: string, username: string) => {
        localStorage.setItem('token', token);
        set({ token, username, user: { username }, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, username: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
