import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../stores/settingsStore';
import { invoke } from '@tauri-apps/api/core';
import {
  Archive,
  RotateCcw,
  Server,
  Globe
} from 'lucide-react';

// MCP Backup Info type matching Rust struct
interface MCPBackupInfo {
  filename: string;
  timestamp: string;
  source: string;
  mcp_count: number;
  path: string;
  created_at: string;
}

// MCP config from backup file
interface MCPConfig {
  name: string;
  config: Record<string, unknown>;
}

// Backup detail with MCP configs
interface BackupDetail extends MCPBackupInfo {
  mcps: MCPConfig[];
}

interface BackupListPageProps {
  source: 'opencode' | 'claude';
}

export function BackupListPage({ source }: BackupListPageProps) {
  const { t } = useTranslation();
  const { theme } = useSettingsStore();
  
  const [backup, setBackup] = useState<BackupDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoringMcp, setRestoringMcp] = useState<string | null>(null);
  
  // Load backup on mount or source change
  useEffect(() => {
    loadBackup();
  }, [source]);
  
  const loadBackup = async () => {
    setLoading(true);
    try {
      const result = await invoke<MCPBackupInfo | null>('get_mcp_backup', { source });
      
      if (result) {
        // Load MCP details
        try {
          const content = await invoke<string>('read_backup_content', { source });
          const data = JSON.parse(content);
          const mcps: MCPConfig[] = Object.entries(data.mcps || {}).map(([name, config]) => ({
            name,
            config: config as Record<string, unknown>
          }));
          setBackup({ ...result, mcps });
        } catch {
          setBackup({ ...result, mcps: [] });
        }
      } else {
        setBackup(null);
      }
    } catch (error) {
      console.error('Failed to load backup:', error);
      setBackup(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRestoreAll = async () => {
    if (!backup) return;
    
    if (!confirm(t('backup.restoreAllConfirm'))) {
      return;
    }
    
    setRestoring(true);
    try {
      const result = await invoke<string>('restore_mcp_backup', { source });
      alert(result);
      // Reload to show updated state
      await loadBackup();
    } catch (error) {
      console.error('Restore failed:', error);
      alert(`${t('backup.restoreError')}: ${error}`);
    } finally {
      setRestoring(false);
    }
  };
  
  const handleRestoreMcp = async (mcpName: string) => {
    if (!confirm(`${t('backup.restoreMcpConfirm')} ${mcpName}?`)) {
      return;
    }
    
    setRestoringMcp(mcpName);
    try {
      const result = await invoke<string>('restore_single_mcp', { source, mcpName });
      alert(result);
    } catch (error) {
      console.error('Restore MCP failed:', error);
      alert(`${t('backup.restoreError')}: ${error}`);
    } finally {
      setRestoringMcp(null);
    }
  };
  
  // Get MCP display type
  const getMCPDisplayType = (config: Record<string, unknown>): string => {
    if (config.url) return 'remote';
    if (config.command) return 'local';
    return 'unknown';
  };
  
  // Get MCP command display string
  const getMCPCommandDisplay = (config: Record<string, unknown>): string => {
    if (config.url) {
      return config.url as string;
    }
    if (config.command) {
      const cmd = config.command;
      if (Array.isArray(cmd)) {
        return cmd.join(' ');
      }
      // If command is string and has args
      const args = config.args as string[] | undefined;
      if (args) {
        return `${cmd} ${args.join(' ')}`;
      }
      return cmd as string;
    }
    return '';
  };

  return (
    <div className={`main-content ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
            {source === 'opencode' ? 'OpenCode' : 'Claude Code'} {t('backup.title')}
          </h1>
        </div>
        {backup && (
          <button
            onClick={handleRestoreAll}
            disabled={restoring}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              theme === 'light'
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                : 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-900'
            } ${restoring ? 'opacity-50' : ''}`}
          >
            <RotateCcw size={18} className={restoring ? 'animate-spin' : ''} />
            {restoring ? t('status.restoring') : t('backup.restoreAll')}
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className={`py-12 text-center ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
          <Archive size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">{t('status.loading')}</p>
        </div>
      ) : !backup ? (
        <div className={`py-12 text-center ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
          <Archive size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">{t('backup.noBackup')}</p>
          <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
            {t('backup.noBackupHint')}
          </p>
        </div>
      ) : (
        <div className={`rounded-lg border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
          {/* Backup Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'}`}>
            <div className="flex items-center gap-3">
              <Archive size={18} className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'} />
              <div>
                <div className={`font-medium ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                  {backup.created_at}
                </div>
                <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {backup.mcp_count} MCPs • {backup.filename}
                </div>
              </div>
            </div>
          </div>
          
          {/* MCP Cards Grid */}
          <div className="p-4">
            {backup.mcps.length === 0 ? (
              <div className={`text-center py-4 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('backup.noMcps')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {backup.mcps.map((mcp) => {
                  const displayType = getMCPDisplayType(mcp.config);
                  const commandDisplay = getMCPCommandDisplay(mcp.config);
                  const isRestoring = restoringMcp === mcp.name;
                  
                  return (
                    <div
                      key={mcp.name}
                      className={`card group relative overflow-hidden`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`mcp-icon-container`}>
                          {displayType === 'remote' ? (
                            <Globe size={24} />
                          ) : (
                            <Server size={24} />
                          )}
                        </div>
                      </div>

                      <h3 className={`font-bold text-lg mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                        {mcp.name}
                      </h3>
                      <p className={`text-sm leading-relaxed mb-6 h-10 overflow-hidden ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {commandDisplay || (mcp.config.description as string) || `(${displayType})`}
                      </p>
                      
                      {/* Restore Single MCP Button */}
                      <button
                        onClick={() => handleRestoreMcp(mcp.name)}
                        disabled={isRestoring || restoring}
                        className={`w-full py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          theme === 'light'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900'
                        } ${(isRestoring || restoring) ? 'opacity-50' : ''}`}
                      >
                        <RotateCcw size={16} className={isRestoring ? 'animate-spin' : ''} />
                        {isRestoring ? t('status.restoring') : t('backup.restore')}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}