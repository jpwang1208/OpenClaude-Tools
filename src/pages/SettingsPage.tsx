import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../stores/settingsStore';
import { 
  Settings, 
  Sun, 
  Moon, 
  Globe, 
  Bell, 
  MonitorDown,
} from 'lucide-react';

export function SettingsPage() {
  const { t } = useTranslation();
  const { 
    theme, 
    language, 
    autoCheckUpdate, 
    minimizeToTray,
    setTheme, 
    setLanguage,
    setAutoCheckUpdate,
    setMinimizeToTray 
  } = useSettingsStore();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-h2 text-white">{t('settings.title')}</h2>
        <p className="text-slate-400 text-sm mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* Theme Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            {theme === 'dark' ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-primary" />}
          </div>
          <div>
            <h3 className="font-semibold text-white">{t('settings.theme')}</h3>
            <p className="text-sm text-slate-400">Choose your preferred theme</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`
              flex-1 p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
              ${theme === 'dark' 
                ? 'border-primary bg-primary/10' 
                : theme === 'light' ? 'border-light-border hover:border-primary/50' : 'border-dark-border hover:border-primary/50'
              }
            `}
          >
            <Moon size={24} className={theme === 'dark' ? 'text-primary' : 'text-slate-400'} />
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>
              {t('settings.themeDark')}
            </span>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`
              flex-1 p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
              ${theme === 'light' 
                ? 'border-primary bg-primary/10' 
                : 'border-slate-200 hover:border-primary/50 dark:border-slate-700 dark:hover:border-primary/50'
              }
            `}
          >
            <Sun size={24} className={theme === 'light' ? 'text-primary' : 'text-slate-400'} />
            <span className={`text-sm font-medium ${theme === 'light' ? 'text-white' : 'text-slate-400'}`}>
              {t('settings.themeLight')}
            </span>
          </button>
        </div>
      </div>

      {/* Language Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
            <Globe size={20} className="text-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{t('settings.language')}</h3>
            <p className="text-sm text-slate-400">Select your preferred language</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setLanguage('zh')}
            className={`
              flex-1 p-4 rounded-lg border-2 transition-all
              ${language === 'zh' 
                ? 'border-secondary bg-secondary/10' 
                : theme === 'light' ? 'border-light-border hover:border-secondary/50' : 'border-dark-border hover:border-secondary/50'
              }
            `}
          >
            <span className={`text-lg font-medium ${language === 'zh' ? 'text-white' : 'text-slate-400'}`}>
              {t('settings.langZh')}
            </span>
          </button>

          <button
            onClick={() => setLanguage('en')}
            className={`
              flex-1 p-4 rounded-lg border-2 transition-all
              ${language === 'en' 
                ? 'border-secondary bg-secondary/10' 
                : theme === 'light' ? 'border-light-border hover:border-secondary/50' : 'border-dark-border hover:border-secondary/50'
              }
            `}
          >
            <span className={`text-lg font-medium ${language === 'en' ? 'text-white' : 'text-slate-400'}`}>
              {t('settings.langEn')}
            </span>
          </button>
        </div>
      </div>

      {/* Behavior Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <Settings size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Behavior</h3>
            <p className="text-sm text-slate-400">Customize application behavior</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`flex items-center justify-between py-3 border-b ${theme === 'light' ? 'border-light-border' : 'border-dark-border'}`}>
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-slate-400" />
              <div>
                <p className="font-medium text-white">{t('settings.autoUpdate')}</p>
                <p className="text-sm text-slate-400">Automatically check for updates</p>
              </div>
            </div>
            <button
              onClick={() => setAutoCheckUpdate(!autoCheckUpdate)}
              className={`toggle ${autoCheckUpdate ? 'active' : ''}`}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <MonitorDown size={18} className="text-slate-400" />
              <div>
                <p className="font-medium text-white">{t('settings.minimizeToTray')}</p>
                <p className="text-sm text-slate-400">Keep running in system tray</p>
              </div>
            </div>
            <button
              onClick={() => setMinimizeToTray(!minimizeToTray)}
              className={`toggle ${minimizeToTray ? 'active' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold">OC</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{t('settings.about')}</h3>
            <p className="text-sm text-slate-400">OpenClaude-Tools</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className={`flex justify-between py-2 border-b ${theme === 'light' ? 'border-light-border' : 'border-dark-border'}`}>
            <span className="text-slate-400">{t('settings.version')}</span>
            <span className="text-white font-mono">1.0.0</span>
          </div>
          <div className={`flex justify-between py-2 border-b ${theme === 'light' ? 'border-light-border' : 'border-dark-border'}`}>
            <span className="text-slate-400">Framework</span>
            <span className="text-white font-mono">Tauri 2.x</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400">Platform</span>
            <span className="text-white font-mono">macOS / Windows / Linux</span>
          </div>
        </div>
      </div>
    </div>
  );
}
