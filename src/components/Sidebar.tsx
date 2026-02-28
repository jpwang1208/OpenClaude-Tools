import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../stores/settingsStore';
import { 
  LayoutGrid, 
  Wand2, 
  Box,
  Archive
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'mcp', icon: LayoutGrid, labelKey: 'nav.mcp' },
  { id: 'backup', icon: Archive, labelKey: 'nav.backup' },
  { id: 'skills', icon: Wand2, labelKey: 'nav.skills' },
  { id: 'models', icon: Box, labelKey: 'nav.models' },
];

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { t } = useTranslation();
  const { theme } = useSettingsStore();

  return (
    <aside 
      className={`
        h-full border-r flex flex-col flex-shrink-0
        ${theme === 'light' 
          ? 'bg-white/70 backdrop-blur-md border-slate-200/50' 
          : 'bg-slate-900/70 backdrop-blur-md border-slate-700/50'}
      `}
      style={{ width: '240px' }}
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(to bottom right, #10B981, #3B82F6)' }}
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
          </svg>
        </div>
        <span 
          className={`font-bold text-lg tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}
        >
          OpenClaudeSync
        </span>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium
                transition-all duration-200
                ${isActive 
                  ? theme === 'light'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-indigo-900/50 text-indigo-400'
                  : theme === 'light'
                    ? 'text-slate-600 hover:bg-slate-200'
                    : 'text-slate-400 hover:bg-slate-800'
                }
              `}
            >
              <Icon size={20} />
              <span>{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}