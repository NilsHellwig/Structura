import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  darkMode: boolean;
  showParameters: boolean;
  sidebarCollapsed: boolean;
  showIntro: boolean;
  toggleDarkMode: () => void;
  setShowParameters: (show: boolean) => void;
  toggleSidebar: () => void;
  setShowIntro: (show: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      darkMode: false,
      showParameters: false,
      sidebarCollapsed: false,
      showIntro: false,
      toggleDarkMode: () =>
        set((state) => {
          const newMode = !state.darkMode;
          // Update body class for dark mode
          if (newMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          return { darkMode: newMode };
        }),
      setShowParameters: (show) => set({ showParameters: show }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setShowIntro: (show) => set({ showIntro: show }),
    }),
    {
      name: 'ui-storage',
      onRehydrateStorage: () => (state) => {
        // Apply dark mode on initial load
        if (state?.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }
  )
);
