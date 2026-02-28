import { create } from 'zustand';
import {
  MCPItem,
  MCPList,
  OhMyOpenCodeConfig,
  ConfigPaths,
} from '../types';
import { invoke } from '@tauri-apps/api/core';

interface ConfigStore {
  // State
  mcpList: MCPList;
  skillsConfig: OhMyOpenCodeConfig | null;
  loading: boolean;
  error: string | null;

  // MCP Actions
  loadMCPList: () => Promise<void>;
  addMCP: (name: string, configJson: string, source: 'opencode' | 'claude', description?: string) => Promise<void>;
  updateMCP: (name: string, configJson: string, source: 'opencode' | 'claude', description?: string) => Promise<void>;
  deleteMCP: (name: string, source: 'opencode' | 'claude') => Promise<void>;
  syncMCP: (name: string, fromSource: 'opencode' | 'claude', toSource: 'opencode' | 'claude', configJson: string) => Promise<void>;

  // Skills Actions
  loadSkillsConfig: () => Promise<void>;
  saveSkillsConfig: (config: OhMyOpenCodeConfig) => Promise<void>;
  addSkill: (name: string, description?: string, source?: 'global' | 'project') => Promise<void>;
  updateSkill: (name: string, description?: string, enabled?: boolean) => Promise<void>;
  deleteSkill: (name: string) => Promise<void>;
  toggleSkill: (name: string, enabled: boolean) => Promise<void>;

  // Utility
  getFilteredMCPList: (source: 'opencode' | 'claude') => MCPItem[];
  getConfigPaths: () => Promise<ConfigPaths>;
  clearError: () => void;
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  mcpList: { opencode: [], claude: [] },
  skillsConfig: null,
  loading: false,
  error: null,

  // ============================================================================
  // MCP Actions
  // ============================================================================

  loadMCPList: async () => {
    set({ loading: true, error: null });
    try {
      console.log('[ConfigStore] Loading MCP list...');
      const mcpList = await invoke<MCPList>('get_mcp_list');
      console.log('[ConfigStore] MCP list loaded:', mcpList);
      set({ mcpList, loading: false });
    } catch (error) {
      console.error('[ConfigStore] Failed to load MCP list:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load MCP list'
      });
    }
  },

  addMCP: async (name: string, configJson: string, source: 'opencode' | 'claude', description?: string) => {
    set({ loading: true, error: null });
    try {
      console.log('[ConfigStore] Adding MCP:', name, 'to', source);
      await invoke('add_mcp', {
        name,
        configJson,
        source,
        description: description || null
      });
      await get().loadMCPList();
    } catch (error) {
      console.error('[ConfigStore] Failed to add MCP:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to add MCP'
      });
      throw error;
    }
  },

  updateMCP: async (name: string, configJson: string, source: 'opencode' | 'claude', description?: string) => {
    set({ loading: true, error: null });
    try {
      console.log('[ConfigStore] Updating MCP:', name, 'in', source);
      await invoke('update_mcp', {
        name,
        configJson,
        source,
        description: description || null
      });
      await get().loadMCPList();
    } catch (error) {
      console.error('[ConfigStore] Failed to update MCP:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update MCP'
      });
      throw error;
    }
  },

  deleteMCP: async (name: string, source: 'opencode' | 'claude') => {
    set({ loading: true, error: null });
    try {
      console.log('[ConfigStore] Deleting MCP:', name, 'from', source);
      await invoke('delete_mcp', { name, source });
      await get().loadMCPList();
    } catch (error) {
      console.error('[ConfigStore] Failed to delete MCP:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete MCP'
      });
      throw error;
    }
  },

  syncMCP: async (name: string, fromSource: 'opencode' | 'claude', toSource: 'opencode' | 'claude', configJson: string) => {
    set({ loading: true, error: null });
    try {
      console.log('[ConfigStore] Syncing MCP:', name, 'from', fromSource, 'to', toSource);
      await invoke('sync_mcp', {
        name,
        fromSource,
        toSource,
        configJson
      });
      await get().loadMCPList();
    } catch (error) {
      console.error('[ConfigStore] Failed to sync MCP:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to sync MCP'
      });
      throw error;
    }
  },

  getFilteredMCPList: (source: 'opencode' | 'claude') => {
    const { mcpList } = get();
    return source === 'opencode' ? mcpList.opencode : mcpList.claude;
  },

  // ============================================================================
  // Skills Actions
  // ============================================================================

  loadSkillsConfig: async () => {
    try {
      console.log('[ConfigStore] Loading skills config...');
      const skillsConfig = await invoke<OhMyOpenCodeConfig>('get_skills_config');
      console.log('[ConfigStore] Skills config loaded:', skillsConfig);
      set({ skillsConfig });
    } catch (error) {
      console.error('[ConfigStore] Failed to load skills config:', error);
      set({ skillsConfig: { skills: [], agents: [], plugins: [] } });
    }
  },

  saveSkillsConfig: async (config: OhMyOpenCodeConfig) => {
    try {
      await invoke('save_skills_config', { config });
      set({ skillsConfig: config });
    } catch (error) {
      console.error('[ConfigStore] Failed to save skills config:', error);
      throw error;
    }
  },

  addSkill: async (name: string, description?: string, source?: 'global' | 'project') => {
    try {
      await invoke('add_skill', {
        name,
        description: description || null,
        source: source || 'global'
      });
      await get().loadSkillsConfig();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add skill'
      });
      throw error;
    }
  },

  updateSkill: async (name: string, description?: string, enabled?: boolean) => {
    const { skillsConfig } = get();
    if (!skillsConfig) return;

    const updatedSkills = skillsConfig.skills.map(skill => {
      if (skill.name === name) {
        return {
          ...skill,
          description: description !== undefined ? description : skill.description,
          enabled: enabled !== undefined ? enabled : skill.enabled,
        };
      }
      return skill;
    });

    const newConfig = { ...skillsConfig, skills: updatedSkills };

    try {
      await invoke('save_skills_config', { config: newConfig });
      set({ skillsConfig: newConfig });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update skill'
      });
      throw error;
    }
  },

  deleteSkill: async (name: string) => {
    try {
      await invoke('remove_skill', { name });
      await get().loadSkillsConfig();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete skill'
      });
      throw error;
    }
  },

  toggleSkill: async (name: string, enabled: boolean) => {
    try {
      await invoke('toggle_skill', { name, enabled });
      await get().loadSkillsConfig();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to toggle skill'
      });
      throw error;
    }
  },

  // ============================================================================
  // Utility
  // ============================================================================

  getConfigPaths: async () => {
    return await invoke<ConfigPaths>('get_config_paths');
  },

  clearError: () => set({ error: null }),
}));