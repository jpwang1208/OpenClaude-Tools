import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../stores/configStore';
import { useSettingsStore } from '../stores/settingsStore';
import {
  Plus,
  RefreshCw,
  Download,
  FolderOpen,
  Edit2,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import type { SkillConfig } from '../types';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

export function SkillsMgmtPage() {
  const { t } = useTranslation();
  const { skillsConfig, loading, loadSkillsConfig, addSkill, updateSkill, deleteSkill } = useConfigStore();
  const { theme } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<'global' | 'project'>('global');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillConfig | null>(null);
  const [syncingSkill, setSyncingSkill] = useState<string | null>(null);
  const [projectPath, setProjectPath] = useState('/Users/admin/projects/mcp-demo');

  // Load skills config on mount
  useEffect(() => {
    loadSkillsConfig();
  }, [loadSkillsConfig]);

  // Filter skills by source (global vs project)
  const globalSkills = skillsConfig?.skills?.filter(s => s.source !== 'project') || [];
  const projectSkills = skillsConfig?.skills?.filter(s => s.source === 'project') || [];
  const filteredSkills = activeTab === 'global' ? globalSkills : projectSkills;

  const handleSync = async (skillName: string) => {
    setSyncingSkill(skillName);
    // TODO: Implement actual sync to Claude code
    setTimeout(() => {
      setSyncingSkill(null);
    }, 1500);
  };

  const handleBackup = async () => {
    try {
      const result = await invoke<string>('create_backup');
      alert(`${t('action.backup')} ${t('status.success')}: ${result}`);
    } catch (error) {
      console.error('Backup failed:', error);
      alert(`${t('action.backup')} ${t('status.error')}`);
    }
  };

  const handleChangePath = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: t('skills.selectProjectFolder'),
      });
      if (selected) {
        setProjectPath(selected as string);
      }
    } catch (error) {
      console.error('Failed to open folder picker:', error);
    }
  };

  const handleDelete = async (skill: SkillConfig) => {
    if (confirm(`${t('skills.deleteConfirm')} ${skill.name}?`)) {
      await deleteSkill(skill.name);
    }
  };

  return (
    <div className={`main-content ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'}`}>
      {/* Content Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            {t('skills.title')}
          </h1>
          <p className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>
            {t('skills.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleBackup}
            className={`btn-secondary flex items-center gap-2`}
          >
            <Download size={16} />
            {t('action.backup')} {t('skills.title')}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus size={16} />
            {t('skills.add')}
          </button>
        </div>
      </div>

      {/* Folder Selector Card */}
      <div className={`rounded-2xl p-6 border mb-8 shadow-sm ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={20} className="text-indigo-400" />
          <span className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
            {t('skills.projectFolder')}
          </span>
        </div>
        <div className="flex gap-3">
          <div className={`flex-1 rounded-xl px-4 py-3 flex items-center gap-3 ${theme === 'light' ? 'bg-slate-50 border border-slate-200' : 'bg-slate-700 border border-slate-600'}`}>
            <svg className={`w-4 h-4 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 000-7.5h-.745a5.997 5.997 0 00-11.038 0H6.75a4.5 4.5 0 00-4.5 4.5z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span className={`font-mono text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
              {projectPath}
            </span>
          </div>
          <button 
            onClick={handleChangePath}
            className={`px-6 rounded-xl font-medium transition-all border ${theme === 'light' ? 'border-indigo-400 text-indigo-500 hover:bg-indigo-50' : 'border-indigo-500 text-indigo-400 hover:bg-indigo-900/30'}`}
          >
            {t('skills.changePath')}
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className={`flex gap-8 border-b mb-8 ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'}`}>
        <button 
          onClick={() => setActiveTab('global')}
          className={`
            pb-4 border-b-2 font-bold flex items-center gap-2 transition-all
            ${activeTab === 'global'
              ? 'border-indigo-500 text-indigo-600'
              : theme === 'light'
                ? 'border-transparent text-slate-400 hover:text-slate-600'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }
          `}
        >
          {t('skills.globalTab')}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${theme === 'light' ? 'bg-slate-200 text-slate-600' : 'bg-slate-700 text-slate-400'}`}>
            {globalSkills.length}
          </span>
          <RefreshCw size={14} className={`ml-1 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'} hover:text-indigo-500 transition-colors cursor-pointer`} />
        </button>
        <button 
          onClick={() => setActiveTab('project')}
          className={`
            pb-4 border-b-2 font-medium flex items-center gap-2 transition-all
            ${activeTab === 'project'
              ? 'border-indigo-500 text-indigo-600'
              : theme === 'light'
                ? 'border-transparent text-slate-400 hover:text-slate-600'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }
          `}
        >
          {t('skills.projectTab')}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${theme === 'light' ? 'bg-slate-100 text-slate-400' : 'bg-slate-800 text-slate-500'}`}>
            {projectSkills.length}
          </span>
          <RefreshCw size={14} className={`ml-1 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'} hover:text-indigo-500 transition-colors cursor-pointer`} />
        </button>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className={`py-12 text-center ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
          <Loader2 size={32} className="animate-spin mx-auto mb-4" />
          {t('status.loading')}
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className={`py-12 text-center ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
          {t('skills.noSkills')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <div 
              key={skill.name} 
              className={`card card-hover flex flex-col`}
            >
              <h3 className={`text-xl font-bold mb-2 mt-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                {skill.name}
              </h3>
              <p className={`text-sm leading-relaxed mb-6 flex-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                {skill.description || t('skills.pluginDesc')}
              </p>
              <div className={`flex items-center justify-between pt-4 border-t ${theme === 'light' ? 'border-slate-100' : 'border-slate-700'}`}>
                <div className={`flex gap-3 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                  <button 
                    onClick={() => handleSync(skill.name)}
                    disabled={syncingSkill === skill.name}
                    className={`hover:text-indigo-500 transition-colors flex items-center`}
                  >
                    <RefreshCw size={16} className={syncingSkill === skill.name ? 'animate-spin' : ''} />
                    <span className={`text-xs ml-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {t('skills.syncToClaude')}
                    </span>
                  </button>
                  <button 
                    onClick={() => setEditingSkill(skill)}
                    className={`hover:text-indigo-500 transition-colors flex items-center`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(skill)}
                    className={`hover:text-red-500 transition-colors`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Skill Modal */}
      {(showAddModal || editingSkill) && (
        <SkillEditModal
          skill={editingSkill}
          source={activeTab}
          onClose={() => {
            setShowAddModal(false);
            setEditingSkill(null);
          }}
          onSave={async (name, description, source) => {
            if (editingSkill) {
              await updateSkill(name, description, editingSkill.enabled);
            } else {
              await addSkill(name, description, source);
            }
            setShowAddModal(false);
            setEditingSkill(null);
          }}
        />
      )}
    </div>
  );
}

interface SkillEditModalProps {
  skill: SkillConfig | null;
  source: 'global' | 'project';
  onClose: () => void;
  onSave: (name: string, description: string | undefined, source: 'global' | 'project') => Promise<void>;
}

function SkillEditModal({ skill, source, onClose, onSave }: SkillEditModalProps) {
  const { t } = useTranslation();
  const { theme } = useSettingsStore();
  const [name, setName] = useState(skill?.name || '');
  const [description, setDescription] = useState(skill?.description || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSave(name, description || undefined, source);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`card w-full max-w-md ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
            {skill ? t('skills.editTitle') : t('skills.addTitle')}
          </h3>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <div className={`mb-4 px-3 py-2 rounded-lg text-sm ${theme === 'light' ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-900/30 text-indigo-400'}`}>
          {source === 'global' ? t('skills.globalTab') : t('skills.projectTab')}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
              {t('skills.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('skills.namePlaceholder')}
              className="input w-full"
              required
              disabled={!!skill}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
              {t('skills.description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('skills.descriptionPlaceholder')}
              className="input w-full min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              {t('action.cancel')}
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? t('status.saving') : t('action.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}