// ============================================================================
// MCP Types - Simplified: name + raw JSON config
// ============================================================================

/// Single MCP item from backend
export interface MCPItem {
  name: string;
  config: string;  // Raw JSON string
  source: 'opencode' | 'claude';
  enabled: boolean;
  description?: string;
}

/// MCP list response from backend
export interface MCPList {
  opencode: MCPItem[];
  claude: MCPItem[];
}

/// Parsed MCP config for UI display
export interface ParsedMCPConfig {
  type?: 'remote' | 'local' | 'http' | 'sse' | 'stdio';
  url?: string;
  command?: string | string[];
  args?: string[];
  env?: Record<string, string>;
  headers?: Record<string, string>;
  enabled?: boolean;
  description?: string;
  [key: string]: any;  // Allow additional fields
}

/// Helper to parse MCP config JSON string
export function parseMCPConfig(configStr: string): ParsedMCPConfig {
  try {
    const parsed = JSON.parse(configStr);
    
    // Normalize type field
    let type: ParsedMCPConfig['type'] = parsed.type || parsed.mcp_type || 'remote';
    if (type === 'http' || type === 'sse') {
      type = 'remote';
    }
    
    return {
      ...parsed,
      type,
    };
  } catch {
    return { type: 'remote' };
  }
}

/// Helper to determine MCP display type
export function getMCPDisplayType(config: ParsedMCPConfig): 'remote' | 'local' {
  if (config.type === 'stdio' || config.type === 'local' || config.command) {
    return 'local';
  }
  return 'remote';
}

/// Helper to get MCP description for display
export function getMCPDescription(item: MCPItem, config: ParsedMCPConfig): string {
  if (item.description) return item.description;
  
  if (config.url) return config.url;
  if (config.command) {
    if (Array.isArray(config.command)) {
      return config.command.join(' ');
    }
    const args = config.args || [];
    return [config.command, ...args].join(' ');
  }
  
  return '';
}

// ============================================================================
// Skills Types
// ============================================================================

export interface SkillConfig {
  name: string;
  description?: string;
  enabled?: boolean;
  source?: 'global' | 'project';
}

export interface OhMyOpenCodeConfig {
  $schema?: string;
  skills: SkillConfig[];
  agents?: SkillConfig[];
  plugins?: string[];
}

// ============================================================================
// Sync Types
// ============================================================================

export type SyncDirection = 'opencode_to_claude' | 'claude_to_opencode';

export interface SyncPreview {
  opencode: {
    added: string[];
    updated: string[];
    removed: string[];
  };
  claude: {
    added: string[];
    updated: string[];
    removed: string[];
  };
}

// ============================================================================
// Settings Types
// ============================================================================

export type Theme = 'dark' | 'light';
export type Language = 'zh' | 'en';

export interface AppSettings {
  theme: Theme;
  language: Language;
  autoCheckUpdate: boolean;
  minimizeToTray: boolean;
}

// ============================================================================
// Path Types
// ============================================================================

export interface ConfigPaths {
  opencode: string;
  skills: string;
  claude: string;
  backup: string;
}

// ============================================================================
// Legacy Types (kept for backwards compatibility)
// ============================================================================

// These are kept for any existing code that might reference them
// but should be migrated to the new simplified types

export interface OpenCodeMCPConfig extends ParsedMCPConfig {}
export interface ClaudeMCPConfig extends ParsedMCPConfig {}