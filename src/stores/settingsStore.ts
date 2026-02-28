import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, Language, AppSettings } from '../types';
import i18n from '../i18n';

interface SettingsStore extends AppSettings {
  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setAutoCheckUpdate: (enabled: boolean) => void;
  setMinimizeToTray: (enabled: boolean) => void;
  initializeTheme: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      language: 'zh',
      autoCheckUpdate: true,
      minimizeToTray: false,

      setTheme: (theme: Theme) => {
        set({ theme });
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setLanguage: (language: Language) => {
        set({ language });
        i18n.changeLanguage(language);
      },

      setAutoCheckUpdate: (enabled: boolean) => {
        set({ autoCheckUpdate: enabled });
      },

      setMinimizeToTray: (enabled: boolean) => {
        set({ minimizeToTray: enabled });
      },

      initializeTheme: () => {
        const { theme, language } = get();
        
        // Apply theme
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Apply language
        i18n.changeLanguage(language);
      },
    }),
    {
      name: 'openclaude-tools-settings',
    }
  )
);
