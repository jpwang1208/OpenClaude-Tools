import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../stores/configStore';
import { useSettingsStore } from '../stores/settingsStore';
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Download,
  Server,
  Globe,
  X,
  AlertCircle
} from 'lucide-react';
import type { MCPItem } from '../types';
import { parseMCPConfig, getMCPDisplayType, getMCPDescription } from '../types';
import { invoke } from '@tauri-apps/api/core';

// MCP Backup Info type matching Rust struct
interface MCPBackupInfo {
  filename: string;
  timestamp: string;
  source: string;
  mcp_count: number;
  path: string;
  created_at: string;
}

interface MCPMgmtPageProps {
  source: 'opencode' | 'claude';
}

export function MCPMgmtPage({ source }: MCPMgmtPageProps) {
  const { t } = useTranslation();
  const { mcpList, loading, error, loadMCPList, deleteMCP, syncMCP } = useConfigStore();
  const { theme } = useSettingsStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMcp, setEditingMcp] = useState<MCPItem | null>(null);
  const [syncingMcp, setSyncingMcp] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewingLogMcp, setViewingLogMcp] = useState<MCPItem | null>(null);
  const [backuping, setBackuping] = useState(false);
  const backupingRef = useRef(false);

  // Load configs when source changes
  useEffect(() => {
    loadMCPList();
  }, [loadMCPList, source]);

  // Filter MCP list by source
  const filteredMcpList = source === 'opencode' ? mcpList.opencode : mcpList.claude;

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMCPList();
    setRefreshing(false);
  };

  const handleDelete = async (mcp: MCPItem) => {
    if (confirm(`${t('mcp.delete')} ${mcp.name}?`)) {
      await deleteMCP(mcp.name, mcp.source);
    }
  };

  const handleSync = async (mcp: MCPItem) => {
    const targetSource = source === 'opencode' ? 'claude' : 'opencode';
    setSyncingMcp(mcp.name);
    try {
      await syncMCP(mcp.name, mcp.source, targetSource, mcp.config);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncingMcp(null);
    }
  };

  const handleBackup = async () => {
    // Prevent double-click using ref (synchronous check)
    if (backupingRef.current) return;
    backupingRef.current = true;
    setBackuping(true);
    
    try {
      const command = source === 'opencode' ? 'backup_opencode_mcps' : 'backup_claude_mcps';
      const result = await invoke<MCPBackupInfo>(command);
      alert(`${t('action.backup')} ${t('status.success')}\n\n${result.mcp_count} MCPs backed up`);
    } catch (error) {
      console.error('Backup failed:', error);
      alert(`${t('action.backup')} ${t('status.error')}: ${error}`);
    } finally {
      backupingRef.current = false;
      setBackuping(false);
    }
  };


  const handleViewLog = (mcp: MCPItem) => {
    setViewingLogMcp(mcp);
  };

  return (
    <div className={`main-content ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
            {t('mcp.title')}
          </h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className={`text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-50`}
            title={t('action.refresh')}
          >
            <RefreshCw size={16} className={refreshing || loading ? 'animate-spin' : ''} />
          </button>
          <span className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            {filteredMcpList.length} {source === 'opencode' ? 'OpenCode' : 'Claude Code'} MCPs
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackup}
            disabled={backuping}
            className={`btn-secondary flex items-center gap-2 ${backuping ? 'opacity-50' : ''}`}
          >
            <Download size={18} className={backuping ? 'animate-bounce' : ''} />
            {backuping ? t('status.saving') : `${t('action.backup')}`}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus size={18} />
            {t('mcp.add')}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${theme === 'light' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading || refreshing ? (
        <div className={`py-12 text-center ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
          <Server size={48} className={`mx-auto mb-4 opacity-50`} />
          <p className="text-lg mb-2">{t('status.loading')}</p>
        </div>
      ) : filteredMcpList.length === 0 ? (
        <div className={`py-12 text-center ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
          <Server size={48} className={`mx-auto mb-4 opacity-50`} />
          <p className="text-lg mb-2">{t('mcp.noMcp')}</p>
          <p className={`text-sm ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
            {source === 'opencode'
              ? t('mcp.noOpenCodeMcp')
              : t('mcp.noClaudeMcp')}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary mt-4"
          >
            <Plus size={16} />
            {t('mcp.add')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMcpList.map((mcp) => {
            const config = parseMCPConfig(mcp.config);
            const displayType = getMCPDisplayType(config);
            const description = getMCPDescription(mcp, config);

            return (
              <div
                key={`${mcp.source}-${mcp.name}`}
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
                  <span
                    className={`
                      tag font-bold
                      ${mcp.enabled ? 'tag-success' : 'tag-warning'}
                    `}
                  >
                    <span className={`status-dot ${mcp.enabled ? 'status-active' : 'status-paused'}`}></span>
                    {mcp.enabled ? 'ACTIVE' : 'PAUSED'}
                  </span>
                </div>

                <h3 className={`font-bold text-lg mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                  {mcp.name}
                </h3>
                <p className={`text-sm leading-relaxed mb-8 h-10 overflow-hidden ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {description || `(${displayType})`}
                </p>

                <div className={`flex items-center justify-between pt-4 border-t ${theme === 'light' ? 'border-slate-100' : 'border-slate-700'}`}>
                  <div className={`flex items-center gap-3 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                    <button
                      onClick={() => handleSync(mcp)}
                      className={`hover:text-indigo-600 transition-colors flex items-center gap-1.5`}
                      disabled={syncingMcp === mcp.name}
                    >
                      <RefreshCw size={16} className={syncingMcp === mcp.name ? 'animate-spin' : ''} />
                      <span className="text-[11px] font-medium">
                        {source === 'opencode' ? t('mcp.syncToClaude') : t('mcp.syncToOpenCode')}
                      </span>
                    </button>
                    <button
                      onClick={() => setEditingMcp(mcp)}
                      className={`hover:text-indigo-600 transition-colors`}
                      title={t('mcp.edit')}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(mcp)}
                      className={`hover:text-red-500 transition-colors`}
                      title={t('mcp.delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleViewLog(mcp)}
                    className={`text-indigo-600 hover:text-indigo-700 font-medium transition-colors text-sm`}
                  >
                    {t('mcp.viewLog')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingMcp) && (
        <MCPEditModal
          mcp={editingMcp}
          source={source}
          onClose={() => {
            setShowAddModal(false);
            setEditingMcp(null);
          }}
          onSave={async (name, configJson, description) => {
            if (editingMcp) {
              const { updateMCP } = useConfigStore.getState();
              await updateMCP(name, configJson, editingMcp.source, description);
            } else {
              const { addMCP } = useConfigStore.getState();
              await addMCP(name, configJson, source, description);
            }
            setShowAddModal(false);
            setEditingMcp(null);
          }}
        />
      )}

      {/* Log Viewer Modal */}
      {viewingLogMcp && (
        <MCPLogModal
          mcp={viewingLogMcp}
          onClose={() => setViewingLogMcp(null)}
        />
      )}
    </div>
  );
}

interface MCPEditModalProps {
  mcp: MCPItem | null;
  source: 'opencode' | 'claude';
  onClose: () => void;
  onSave: (name: string, configJson: string, description?: string) => Promise<void>;
}

function MCPEditModal({ mcp, source, onClose, onSave }: MCPEditModalProps) {
  const { t } = useTranslation();
  const { theme } = useSettingsStore();
  const [name, setName] = useState(mcp?.name || '');
  const [configJson, setConfigJson] = useState(
    mcp?.config || JSON.stringify({ type: 'remote', url: '', enabled: true }, null, 2)
  );
  const [description, setDescription] = useState(mcp?.description || '');
  const [saving, setSaving] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const validateJson = (json: string): boolean => {
    try {
      JSON.parse(json);
      setJsonError(null);
      return true;
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON');
      return false;
    }
  };

  const handleConfigChange = (value: string) => {
    setConfigJson(value);
    validateJson(value);
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(configJson);
      setConfigJson(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (e) {
      // Keep as is if invalid
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !validateJson(configJson)) return;

    setSaving(true);
    try {
      await onSave(name.trim(), configJson, description.trim() || undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`card w-full max-w-2xl ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
            {mcp ? t('mcp.editTitle') : t('mcp.addTitle')}
          </h3>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <div className={`mb-4 px-3 py-2 rounded-lg text-sm ${theme === 'light' ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-900/30 text-indigo-400'}`}>
          {source === 'opencode' ? 'OpenCode' : 'Claude Code'} MCP
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
              {t('mcp.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('mcp.namePlaceholder')}
              className="input w-full"
              required
              disabled={!!mcp} // Disable name editing for existing MCP
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
              {t('mcp.description')}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('mcp.descriptionPlaceholder')}
              className="input w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                MCP JSON Config <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={formatJson}
                className={`text-xs px-2 py-1 rounded ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
              >
                Format
              </button>
            </div>
            <textarea
              value={configJson}
              onChange={(e) => handleConfigChange(e.target.value)}
              placeholder={`{
  "type": "remote",
  "url": "https://example.com/mcp",
  "enabled": true
}`}
              className={`input w-full font-mono text-sm h-64 resize-none ${jsonError ? 'border-red-500' : ''}`}
              required
            />
            {jsonError && (
              <p className="text-red-500 text-xs mt-1">{jsonError}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              {t('action.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving || !!jsonError}
              className="btn-primary flex-1"
            >
              {saving ? t('status.saving') : t('action.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// MCP Log Modal Component
interface MCPLogModalProps {
  mcp: MCPItem;
  onClose: () => void;
}

function MCPLogModal({ mcp, onClose }: MCPLogModalProps) {
  const { t } = useTranslation();
  const { theme } = useSettingsStore();
  const config = parseMCPConfig(mcp.config);
  const displayType = getMCPDisplayType(config);

  // Mock log data - in production this would come from backend
  const mockLogs = [
    { timestamp: '2025-02-27 09:15:23', level: 'INFO', message: `MCP ${mcp.name} started successfully` },
    { timestamp: '2025-02-27 09:15:24', level: 'INFO', message: 'Connection established' },
    { timestamp: '2025-02-27 09:16:01', level: 'DEBUG', message: 'Processing request...' },
    { timestamp: '2025-02-27 09:16:02', level: 'INFO', message: 'Request completed in 1.2s' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`card w-full max-w-2xl ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
            {t('mcp.viewLog')} - {mcp.name}
          </h3>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <div className={`mb-4 flex gap-2 text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
          <span className={`px-2 py-1 rounded ${mcp.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {mcp.enabled ? 'ACTIVE' : 'PAUSED'}
          </span>
          <span className={`px-2 py-1 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'}`}>
            {displayType.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'}`}>
            {mcp.source === 'opencode' ? 'OpenCode' : 'Claude Code'}
          </span>
        </div>

        <div className={`rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm ${theme === 'light' ? 'bg-slate-900 text-slate-100' : 'bg-slate-950 text-slate-200'}`}>
          {mockLogs.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-slate-500">[{log.timestamp}]</span>{' '}
              <span className={
                log.level === 'ERROR' ? 'text-red-400' :
                log.level === 'WARN' ? 'text-yellow-400' :
                log.level === 'DEBUG' ? 'text-blue-400' :
                'text-green-400'
              }>
                [{log.level}]
              </span>{' '}
              <span>{log.message}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="btn-secondary">
            {t('action.close')}
          </button>
        </div>
      </div>
    </div>
  );
}