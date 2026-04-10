import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  username: string;
  token: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setCredentials: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setCredentials: (user) => set({ user, token: user.token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'nexa-auth-storage',
    }
  )
);
