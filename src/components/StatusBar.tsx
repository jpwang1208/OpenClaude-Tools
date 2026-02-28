import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../stores/settingsStore';
import { RefreshCw } from 'lucide-react';

const APP_VERSION = 'V1.0.4';

export function StatusBar() {
  const { t } = useTranslation();
  const { theme } = useSettingsStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    // Simulate update check
    setTimeout(() => {
      setCheckingUpdate(false);
      // In a real app, this would check for updates via Tauri
    }, 1000);
  };

  return (
    <footer 
      className={`
        h-8 border-t flex items-center justify-between px-6 text-[11px] uppercase tracking-wider flex-shrink-0
        ${theme === 'light' 
          ? 'bg-white/50 backdrop-blur-sm border-slate-200/50 text-slate-400' 
          : 'bg-slate-900/50 backdrop-blur-sm border-slate-700/50 text-slate-500'}
      `}
    >
      <div className="flex items-center gap-4">
        <span className="font-medium">VERSION {APP_VERSION}</span>
        <button 
          onClick={handleCheckUpdate}
          className={`flex items-center gap-1 hover:text-indigo-600 transition-colors ${checkingUpdate ? 'animate-spin' : ''}`}
          disabled={checkingUpdate}
        >
          <RefreshCw size={12} className={checkingUpdate ? 'animate-spin' : ''} />
          <span>{checkingUpdate ? t('status.loading') : t('settings.checkUpdate')}</span>
        </button>
      </div>
      <div className="flex items-center gap-4">
        {/* Status indicators can go here */}
      </div>
    </footer>
  );
}