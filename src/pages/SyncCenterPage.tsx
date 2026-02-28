import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../stores/configStore';
import { useSettingsStore } from '../stores/settingsStore';
import {
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function SyncCenterPage() {
  const { t } = useTranslation();
  const { mcpList, loadMCPList, syncMCP, loading } = useConfigStore();
  const { theme } = useSettingsStore();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load MCP list on mount
  useEffect(() => {
    loadMCPList();
  }, [loadMCPList]);

  // Calculate diff for display
  const opencodeMcpNames = new Set(mcpList.opencode.map(m => m.name));
  const claudeMcpNames = new Set(mcpList.claude.map(m => m.name));

  const itemsOnlyInOpencode = [...opencodeMcpNames].filter(n => !claudeMcpNames.has(n));
  const itemsOnlyInClaude = [...claudeMcpNames].filter(n => !opencodeMcpNames.has(n));

  const handleSyncToClaude = async () => {
    if (itemsOnlyInOpencode.length === 0) return;

    setSyncing(true);
    setSyncResult(null);
    try {
      for (const name of itemsOnlyInOpencode) {
        const mcp = mcpList.opencode.find(m => m.name === name);
        if (mcp) {
          await syncMCP(name, 'opencode', 'claude', mcp.config);
        }
      }
      setSyncResult({ success: true, message: t('sync.success') });
    } catch (error) {
      setSyncResult({
        success: false,
        message: error instanceof Error ? error.message : t('sync.failed')
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncToOpenCode = async () => {
    if (itemsOnlyInClaude.length === 0) return;

    setSyncing(true);
    setSyncResult(null);
    try {
      for (const name of itemsOnlyInClaude) {
        const mcp = mcpList.claude.find(m => m.name === name);
        if (mcp) {
          await syncMCP(name, 'claude', 'opencode', mcp.config);
        }
      }
      setSyncResult({ success: true, message: t('sync.success') });
    } catch (error) {
      setSyncResult({
        success: false,
        message: error instanceof Error ? error.message : t('sync.failed')
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-h2 text-white">{t('sync.title')}</h2>
        <p className="text-slate-400 text-sm mt-1">{t('sync.subtitle')}</p>
      </div>

      {/* Sync Direction */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4">{t('sync.direction')}</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSyncToClaude}
            disabled={loading || syncing || itemsOnlyInOpencode.length === 0}
            className={`
              flex-1 p-4 rounded-lg border-2 transition-all text-left
              ${theme === 'light' ? 'border-light-border hover:border-primary/50' : 'border-dark-border hover:border-primary/50'}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">OpenCode</span>
              <ArrowRight size={20} className="text-primary" />
              <span className="font-semibold text-white">Claude Code</span>
            </div>
            <p className="text-sm text-slate-400">
              {itemsOnlyInOpencode.length} items to sync
            </p>
          </button>

          <button
            onClick={handleSyncToOpenCode}
            disabled={loading || syncing || itemsOnlyInClaude.length === 0}
            className={`
              flex-1 p-4 rounded-lg border-2 transition-all text-left
              ${theme === 'light' ? 'border-light-border hover:border-secondary/50' : 'border-dark-border hover:border-secondary/50'}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">Claude Code</span>
              <ArrowRight size={20} className="text-secondary" />
              <span className="font-semibold text-white">OpenCode</span>
            </div>
            <p className="text-sm text-slate-400">
              {itemsOnlyInClaude.length} items to sync
            </p>
          </button>
        </div>
      </div>

      {/* Result */}
      {syncResult && (
        <div className={`card ${syncResult.success ? 'border-success' : 'border-error'}`}>
          <div className="flex items-center gap-3">
            {syncResult.success ? (
              <CheckCircle size={20} className="text-success" />
            ) : (
              <AlertCircle size={20} className="text-error" />
            )}
            <span className={syncResult.success ? 'text-success' : 'text-error'}>
              {syncResult.message}
            </span>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="card">
        <h3 className="font-semibold text-white mb-4">{t('sync.previewTitle')}</h3>

        {/* OpenCode Only */}
        {itemsOnlyInOpencode.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-success mb-2">
              Only in OpenCode ({itemsOnlyInOpencode.length})
            </h4>
            <div className="space-y-1">
              {itemsOnlyInOpencode.map((item, i) => (
                <div key={i} className="text-sm text-slate-400 pl-3 border-l-2 border-success">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claude Only */}
        {itemsOnlyInClaude.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-warning mb-2">
              Only in Claude Code ({itemsOnlyInClaude.length})
            </h4>
            <div className="space-y-1">
              {itemsOnlyInClaude.map((item, i) => (
                <div key={i} className="text-sm text-slate-400 pl-3 border-l-2 border-warning">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {itemsOnlyInOpencode.length === 0 && itemsOnlyInClaude.length === 0 && (
          <p className="text-slate-400 text-sm">All MCPs are synchronized.</p>
        )}
      </div>
    </div>
  );
}