import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../stores/configStore';
import { useSettingsStore } from '../stores/settingsStore';
import {
  LayoutDashboard,
  Network,
  CheckCircle,
  XCircle,
  FolderOpen
} from 'lucide-react';
import { parseMCPConfig, getMCPDisplayType } from '../types';

export function DashboardPage() {
  const { t } = useTranslation();
  const { mcpList, loading, loadMCPList, getConfigPaths } = useConfigStore();
  const { theme } = useSettingsStore();
  const [configPaths, setConfigPaths] = useState({ opencode: '', claude: '' });

  useEffect(() => {
    loadMCPList();
    getConfigPaths().then(paths => {
      setConfigPaths({
        opencode: paths.opencode,
        claude: paths.claude
      });
    });
  }, [loadMCPList, getConfigPaths]);

  const opencodeMcpCount = mcpList.opencode.length;
  const claudeMcpCount = mcpList.claude.length;
  const totalMcpCount = opencodeMcpCount + claudeMcpCount;

  // Get all MCPs for overview
  const allMcps = [...mcpList.opencode, ...mcpList.claude];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="card-glow bg-gradient-to-r dark:from-primary/20 dark:to-accent/20 from-primary/10 to-accent/10 dark:border-primary/30 border-primary/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/30 flex items-center justify-center">
            <LayoutDashboard size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t('dashboard.welcome')}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {t('dashboard.welcomeDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OpenCode Card */}
        <div className="card group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold">OC</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{t('dashboard.opencode')}</h3>
                <p className="text-sm text-slate-400">{t('dashboard.mcpCount')}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 ${opencodeMcpCount > 0 ? 'text-success' : 'text-warning'}`}>
              {opencodeMcpCount > 0 ? <CheckCircle size={16} /> : <XCircle size={16} />}
              <span className="text-sm font-medium">
                {opencodeMcpCount > 0 ? t('dashboard.connected') : t('dashboard.disconnected')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className={`flex items-center justify-between py-2 border-b ${theme === 'light' ? 'border-light-border' : 'border-dark-border'}`}>
              <span className="text-sm text-slate-400">{t('dashboard.mcpCount')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{opencodeMcpCount}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <FolderOpen size={14} />
              <span className="truncate font-mono text-xs">{configPaths.opencode}</span>
            </div>
          </div>

          <button className="mt-4 w-full btn-secondary text-sm">
            {t('dashboard.viewDetails')}
          </button>
        </div>

        {/* Claude Code Card */}
        <div className="card group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <span className="text-secondary font-bold">CC</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{t('dashboard.claude')}</h3>
                <p className="text-sm text-slate-400">{t('dashboard.mcpCount')}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 ${claudeMcpCount > 0 ? 'text-success' : 'text-warning'}`}>
              {claudeMcpCount > 0 ? <CheckCircle size={16} /> : <XCircle size={16} />}
              <span className="text-sm font-medium">
                {claudeMcpCount > 0 ? t('dashboard.connected') : t('dashboard.disconnected')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className={`flex items-center justify-between py-2 border-b ${theme === 'light' ? 'border-light-border' : 'border-dark-border'}`}>
              <span className="text-sm text-slate-400">{t('dashboard.mcpCount')}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{claudeMcpCount}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <FolderOpen size={14} />
              <span className="truncate font-mono text-xs">{configPaths.claude}</span>
            </div>
          </div>

          <button className="mt-4 w-full btn-secondary text-sm">
            {t('dashboard.viewDetails')}
          </button>
        </div>
      </div>

      {/* MCP Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Network size={20} className="text-primary" />
            <h3 className="font-semibold text-slate-900 dark:text-white">MCP Overview</h3>
          </div>
          <span className="text-sm text-slate-400">
            Total: {totalMcpCount} MCPs
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400">
            {t('status.loading')}
          </div>
        ) : allMcps.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            {t('mcp.noMcp')}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {allMcps.slice(0, 10).map((mcp) => {
              const config = parseMCPConfig(mcp.config);
              const displayType = getMCPDisplayType(config);

              return (
                <div
                  key={`${mcp.source}-${mcp.name}`}
                  className={`
                    p-3 rounded-lg border transition-all duration-fast
                    ${mcp.enabled
                      ? 'bg-success/10 border-success/30'
                      : theme === 'light' ? 'bg-light-surface border-light-border' : 'bg-dark-surface border-dark-border'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      displayType === 'remote' ? 'bg-accent/20 text-accent' : 'bg-secondary/20 text-secondary'
                    }`}>
                      {displayType}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${mcp.enabled ? 'bg-success' : 'bg-slate-500'}`} />
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{mcp.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{mcp.source === 'opencode' ? 'OpenCode' : 'Claude'}</p>
                </div>
              );
            })}
            {allMcps.length > 10 && (
              <div className={`p-3 rounded-lg border border-dashed flex items-center justify-center ${theme === 'light' ? 'border-light-border' : 'border-dark-border'}`}>
                <span className="text-sm text-slate-400">+{allMcps.length - 10} more</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}