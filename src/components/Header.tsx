import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../stores/settingsStore';
import { Sun, Moon, Globe, Settings } from 'lucide-react';

interface HeaderProps {
  activeTab: 'opencode' | 'claude';
  onTabChange: (tab: 'opencode' | 'claude') => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { t } = useTranslation();
  const { theme, language, setTheme, setLanguage } = useSettingsStore();

  return (
    <header 
      className={`
        h-16 border-b flex items-center justify-between px-6 sticky top-0 z-10
        ${theme === 'light' 
          ? 'bg-white/80 backdrop-blur-md border-slate-200/50' 
          : 'bg-slate-900/80 backdrop-blur-md border-slate-700/50'}
      `}
    >
      {/* Tabs */}
      <div 
        className={`flex p-1 rounded-xl ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}
      >
        <button
          onClick={() => onTabChange('opencode')}
          className={`
            px-6 py-1.5 text-sm font-medium rounded-lg transition-all
            ${activeTab === 'opencode'
              ? theme === 'light'
                ? 'bg-white shadow-sm text-indigo-600'
                : 'bg-slate-700 shadow-sm text-indigo-400'
              : theme === 'light'
                ? 'text-slate-500 hover:text-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }
          `}
        >
          OpenCode
        </button>
        <button
          onClick={() => onTabChange('claude')}
          className={`
            px-6 py-1.5 text-sm font-medium rounded-lg transition-all
            ${activeTab === 'claude'
              ? theme === 'light'
                ? 'bg-white shadow-sm text-indigo-600'
                : 'bg-slate-700 shadow-sm text-indigo-400'
              : theme === 'light'
                ? 'text-slate-500 hover:text-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }
          `}
        >
          Claude code
        </button>
      </div>

      {/* Right Side Icons */}
      <div className={`flex items-center gap-5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
          className={`hover:text-indigo-600 transition-colors`}
          title={t('settings.language')}
        >
          <Globe size={20} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`hover:text-indigo-600 transition-colors`}
          title={theme === 'dark' ? t('settings.themeLight') : t('settings.themeDark')}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Settings */}
        <button
          className={`hover:text-indigo-600 transition-colors`}
          title={t('settings.title')}
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}