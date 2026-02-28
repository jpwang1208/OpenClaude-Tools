use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ConfigError {
    #[error("File not found: {0}")]
    FileNotFound(String),
    #[error("Parse error: {0}")]
    ParseError(String),
    #[error("Write error: {0}")]
    WriteError(String),
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
}

impl Serialize for ConfigError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

// ============================================================================
// MCP Types - Simplified: name + raw JSON config
// ============================================================================

/// Single MCP item with name and raw JSON config
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MCPItem {
    pub name: String,
    pub config: String, // Raw JSON string
    pub source: String, // "opencode" or "claude"
    pub enabled: bool,
    pub description: Option<String>,
}

/// MCP list response
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MCPList {
    pub opencode: Vec<MCPItem>,
    pub claude: Vec<MCPItem>,
}

// ============================================================================
// OpenCode Configuration (for internal use only)
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct OpenCodeConfig {
    #[serde(rename = "$schema")]
    pub schema: Option<String>,
    #[serde(default)]
    pub mcp: HashMap<String, serde_json::Value>,
    #[serde(rename = "provider")]
    pub providers: Option<HashMap<String, serde_json::Value>>,
    pub plugin: Option<Vec<String>>,
}

// ============================================================================
// Claude Configuration (for internal use only)
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ClaudeConfig {
    pub env: Option<HashMap<String, String>>,
    pub model: Option<String>,
    #[serde(default, rename = "mcpServers")]
    pub mcp_servers: HashMap<String, serde_json::Value>,
    #[serde(flatten)]
    pub other: HashMap<String, serde_json::Value>,
}

// ============================================================================
// Skills/Oh-My-OpenCode Configuration
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SkillConfig {
    pub name: String,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub enabled: Option<bool>,
    #[serde(default)]
    pub source: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct OhMyOpenCodeConfig {
    #[serde(rename = "$schema")]
    pub schema: Option<String>,
    #[serde(default)]
    pub skills: Vec<SkillConfig>,
    #[serde(default)]
    pub agents: Vec<SkillConfig>,
    #[serde(default)]
    pub plugins: Vec<String>,
}

// ============================================================================
// Sync Types
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncPreview {
    pub opencode: SyncDirectionPreview,
    pub claude: SyncDirectionPreview,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SyncDirectionPreview {
    pub added: Vec<String>,
    pub updated: Vec<String>,
    pub removed: Vec<String>,
}

// ============================================================================
// Backup Types
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupData {
    pub timestamp: String,
    pub version: String,
    pub opencode_config: Option<serde_json::Value>,
    pub claude_config: Option<serde_json::Value>,
    pub skills_config: Option<OhMyOpenCodeConfig>,
}

// ============================================================================
// MCP Config Format Conversion Functions
// ============================================================================

/// Convert OpenCode MCP config format to Claude Code format
///
/// OpenCode format:
/// {
///   "type": "local" | "remote",
///   "command": ["npx", "-y", "pkg"],  // array format
///   "environment": { "KEY": "value" },
///   "enabled": true,
///   "description": "..."
/// }
///
/// Claude Code format:
/// {
///   "command": "npx",              // string or array
///   "args": ["-y", "pkg"],         // separate args
///   "env": { "KEY": "value" }
///   // no enabled, description, type fields
/// }
fn convert_opencode_to_claude(config: &serde_json::Value) -> serde_json::Value {
    let mut result = serde_json::Map::new();
    
    // Handle command conversion: array -> command + args
    if let Some(cmd) = config.get("command") {
        if let Some(cmd_array) = cmd.as_array() {
            if !cmd_array.is_empty() {
                // First element is the command
                result.insert("command".to_string(), cmd_array[0].clone());
                // Rest are args
                if cmd_array.len() > 1 {
                    result.insert(
                        "args".to_string(),
                        serde_json::Value::Array(cmd_array[1..].to_vec()),
                    );
                }
            }
        } else {
            // Already a string, keep as-is
            result.insert("command".to_string(), cmd.clone());
        }
    }
    
    // Convert environment -> env
    if let Some(env) = config.get("environment") {
        result.insert("env".to_string(), env.clone());
    }
    
    // Copy common fields that both formats support
    for key in ["url", "headers", "transport", "timeout"] {
        if let Some(value) = config.get(key) {
            result.insert(key.to_string(), value.clone());
        }
    }
    
    // Add type field based on config content (Claude Code requires this)
    // - Has "url" -> type: "http" (remote MCP)
    // - Has "command" -> type: "stdio" (local MCP)
    if config.get("url").is_some() {
        result.insert("type".to_string(), serde_json::json!("http"));
    } else if config.get("command").is_some() {
        result.insert("type".to_string(), serde_json::json!("stdio"));
    }
    
    // Note: We intentionally skip "enabled", "description"
    // as they are OpenCode-specific and not supported by Claude Code
    
    serde_json::Value::Object(result)
}

/// Convert Claude Code MCP config format to OpenCode format
///
/// Claude Code format:
/// {
///   "command": "npx",
///   "args": ["-y", "pkg"],
///   "env": { "KEY": "value" }
/// }
///
/// OpenCode format:
/// {
///   "type": "local" | "remote",
///   "command": ["npx", "-y", "pkg"],  // merged array
///   "environment": { "KEY": "value" },
///   "enabled": true
/// }
fn convert_claude_to_opencode(config: &serde_json::Value) -> serde_json::Value {
    let mut result = serde_json::Map::new();
    
    // Infer type from config content
    let mcp_type = if config.get("url").is_some() {
        "remote"
    } else {
        "local"
    };
    result.insert("type".to_string(), serde_json::json!(mcp_type));
    
    // Always set enabled to true when syncing to OpenCode
    result.insert("enabled".to_string(), serde_json::json!(true));
    
    // Merge command + args into single array
    let mut merged_command = Vec::new();
    
    if let Some(cmd) = config.get("command") {
        if let Some(cmd_str) = cmd.as_str() {
            merged_command.push(serde_json::Value::String(cmd_str.to_string()));
        } else if let Some(cmd_array) = cmd.as_array() {
            merged_command.extend(cmd_array.clone());
        }
    }
    
    if let Some(args) = config.get("args").and_then(|a| a.as_array()) {
        merged_command.extend(args.clone());
    }
    
    if !merged_command.is_empty() {
        result.insert("command".to_string(), serde_json::Value::Array(merged_command));
    }
    
    // Convert env -> environment
    if let Some(env) = config.get("env") {
        result.insert("environment".to_string(), env.clone());
    }
    
    // Copy common fields that both formats support
    for key in ["url", "headers", "transport", "timeout", "description"] {
        if let Some(value) = config.get(key) {
            result.insert(key.to_string(), value.clone());
        }
    }
    
    serde_json::Value::Object(result)
}

// ============================================================================
// Path Functions
// ============================================================================

fn get_opencode_config_path() -> PathBuf {
    if cfg!(target_os = "windows") {
        dirs::config_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("opencode")
            .join("opencode.json")
    } else {
        dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join(".config")
            .join("opencode")
            .join("opencode.json")
    }
}

fn get_oh_my_opencode_path() -> PathBuf {
    if cfg!(target_os = "windows") {
        dirs::config_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("opencode")
            .join("oh-my-opencode.json")
    } else {
        dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join(".config")
            .join("opencode")
            .join("oh-my-opencode.json")
    }
}

fn get_claude_config_path() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".claude.json")
}



fn get_backup_directory() -> PathBuf {
    if cfg!(target_os = "windows") {
        dirs::config_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("OpenClaude-Tools")
            .join("backups")
    } else {
        dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join(".config")
            .join("openclaude-tools")
            .join("backups")
    }
}

// ============================================================================
// Internal Config Loaders
// ============================================================================

fn load_opencode_config() -> Result<OpenCodeConfig, String> {
    let path = get_opencode_config_path();
    log::info!("Loading OpenCode config from: {:?}", path);

    if !path.exists() {
        log::warn!("OpenCode config not found: {:?}", path);
        return Ok(OpenCodeConfig::default());
    }

    let content = fs::read_to_string(&path).map_err(|e| format!("Failed to read config: {}", e))?;
    serde_json::from_str(&content).map_err(|e| format!("Failed to parse config: {}", e))
}

fn save_opencode_config_internal(config: &OpenCodeConfig) -> Result<(), String> {
    let path = get_opencode_config_path();
    log::info!("Saving OpenCode config to: {:?}", path);

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    let content = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    fs::write(&path, content).map_err(|e| format!("Failed to write config: {}", e))
}

fn load_claude_config() -> Result<ClaudeConfig, String> {
    let path = get_claude_config_path();
    log::info!("Loading Claude config from: {:?}", path);

    if !path.exists() {
        log::warn!("Claude config not found: {:?}", path);
        return Ok(ClaudeConfig::default());
    }

    let content = fs::read_to_string(&path).map_err(|e| format!("Failed to read config: {}", e))?;
    serde_json::from_str(&content).map_err(|e| format!("Failed to parse config: {}", e))
}

fn save_claude_config_internal(config: &ClaudeConfig) -> Result<(), String> {
    let path = get_claude_config_path();
    log::info!("Saving Claude config to: {:?}", path);

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    let content = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    fs::write(&path, content).map_err(|e| format!("Failed to write config: {}", e))
}



// ============================================================================
// MCP Commands - Simplified API
// ============================================================================

#[tauri::command]
fn get_mcp_list() -> Result<MCPList, String> {
    log::info!("Getting MCP list");
    let mut list = MCPList::default();

    // Load OpenCode MCPs
    let opencode_config = load_opencode_config()?;
    for (name, config_value) in opencode_config.mcp {
        let config_str = serde_json::to_string_pretty(&config_value)
            .unwrap_or_else(|_| config_value.to_string());

        // Extract enabled status from config
        let enabled = config_value
            .get("enabled")
            .and_then(|v| v.as_bool())
            .unwrap_or(true);

        let description = config_value
            .get("description")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string());

        list.opencode.push(MCPItem {
            name,
            config: config_str,
            source: "opencode".to_string(),
            enabled,
            description,
        });
    }

    // Load Claude MCPs from .claude.json
    let claude_config = load_claude_config();
    if let Ok(config) = claude_config {
        // From mcpServers
        for (name, config_value) in config.mcp_servers {
            let config_str = serde_json::to_string_pretty(&config_value)
                .unwrap_or_else(|_| config_value.to_string());

            list.claude.push(MCPItem {
                name,
                config: config_str,
                source: "claude".to_string(),
                enabled: true,
                description: None,
            });
        }
    }


    log::info!(
        "Found {} OpenCode MCPs, {} Claude MCPs",
        list.opencode.len(),
        list.claude.len()
    );

    Ok(list)
}

#[tauri::command]
fn add_mcp(
    name: String,
    config_json: String,
    source: String,
    description: Option<String>,
) -> Result<(), String> {
    log::info!("Adding MCP: {} to {}", name, source);

    // Parse the config JSON to validate it
    let config_value: serde_json::Value =
        serde_json::from_str(&config_json).map_err(|e| format!("Invalid JSON config: {}", e))?;

    if source == "opencode" {
        let mut opencode_config = load_opencode_config()?;

        // Add enabled and description if provided
        let mut final_config = config_value.clone();
        if let Some(obj) = final_config.as_object_mut() {
            if !obj.contains_key("enabled") {
                obj.insert("enabled".to_string(), serde_json::json!(true));
            }
            if let Some(desc) = description {
                obj.insert("description".to_string(), serde_json::json!(desc));
            }
        }

        opencode_config.mcp.insert(name, final_config);
        save_opencode_config_internal(&opencode_config)?;
    } else {
        let mut claude_config = load_claude_config()?;

        // Add to mcpServers in .claude.json
        claude_config.mcp_servers.insert(name, config_value);
        save_claude_config_internal(&claude_config)?;
    }

    Ok(())
}

#[tauri::command]
fn update_mcp(
    name: String,
    config_json: String,
    source: String,
    description: Option<String>,
) -> Result<(), String> {
    log::info!("Updating MCP: {} in {}", name, source);

    // Parse the config JSON to validate it
    let config_value: serde_json::Value =
        serde_json::from_str(&config_json).map_err(|e| format!("Invalid JSON config: {}", e))?;

    if source == "opencode" {
        let mut opencode_config = load_opencode_config()?;

        if !opencode_config.mcp.contains_key(&name) {
            return Err(format!("MCP '{}' not found in OpenCode config", name));
        }

        // Add description if provided
        let mut final_config = config_value.clone();
        if let (Some(obj), Some(desc)) = (final_config.as_object_mut(), description) {
            obj.insert("description".to_string(), serde_json::json!(desc));
        }

        opencode_config.mcp.insert(name, final_config);
        save_opencode_config_internal(&opencode_config)?;
    } else {
        let mut claude_config = load_claude_config()?;

        if !claude_config.mcp_servers.contains_key(&name) {
            return Err(format!("MCP '{}' not found in Claude config", name));
        }

        claude_config.mcp_servers.insert(name, config_value);
        save_claude_config_internal(&claude_config)?;
    }

    Ok(())
}

#[tauri::command]
fn delete_mcp(name: String, source: String) -> Result<(), String> {
    log::info!("Deleting MCP: {} from {}", name, source);

    if source == "opencode" {
        let mut opencode_config = load_opencode_config()?;

        if opencode_config.mcp.remove(&name).is_none() {
            return Err(format!("MCP '{}' not found in OpenCode config", name));
        }

        save_opencode_config_internal(&opencode_config)?;
    } else {
        let mut claude_config = load_claude_config()?;

        if claude_config.mcp_servers.remove(&name).is_none() {
            return Err(format!("MCP '{}' not found in Claude config", name));
        }

        save_claude_config_internal(&claude_config)?;
    }

    Ok(())
}

#[tauri::command]
fn sync_mcp(
    name: String,
    from_source: String,
    to_source: String,
    config_json: String,
) -> Result<(), String> {
    log::info!(
        "Syncing MCP '{}' from {} to {}",
        name,
        from_source,
        to_source
    );

    // Parse the config JSON
    let config_value: serde_json::Value =
        serde_json::from_str(&config_json).map_err(|e| format!("Invalid JSON config: {}", e))?;

    // Convert config format based on target source
    let converted_config = if from_source != to_source {
        // Need format conversion when syncing between different sources
        if to_source == "opencode" {
            log::info!("Converting Claude format to OpenCode format");
            convert_claude_to_opencode(&config_value)
        } else {
            log::info!("Converting OpenCode format to Claude format");
            convert_opencode_to_claude(&config_value)
        }
    } else {
        // Same source, no conversion needed
        config_value.clone()
    };

    log::debug!("Converted config: {}", serde_json::to_string_pretty(&converted_config).unwrap_or_default());

    if to_source == "opencode" {
        let mut opencode_config = load_opencode_config()?;
        opencode_config.mcp.insert(name, converted_config);
        save_opencode_config_internal(&opencode_config)?;
    } else if to_source == "claude" {
        let mut claude_config = load_claude_config()?;
        claude_config.mcp_servers.insert(name, converted_config);
        save_claude_config_internal(&claude_config)?;
    }

    Ok(())
}

// ============================================================================
// Skills Commands
// ============================================================================

#[tauri::command]
fn get_skills_config() -> Result<OhMyOpenCodeConfig, String> {
    let path = get_oh_my_opencode_path();
    log::info!("Loading Skills config from: {:?}", path);

    if !path.exists() {
        log::warn!("Skills config not found: {:?}", path);
        return Ok(OhMyOpenCodeConfig::default());
    }

    let content =
        fs::read_to_string(&path).map_err(|e| format!("Failed to read skills config: {}", e))?;

    serde_json::from_str(&content).map_err(|e| format!("Failed to parse skills config: {}", e))
}

#[tauri::command]
fn save_skills_config(config: OhMyOpenCodeConfig) -> Result<(), String> {
    let path = get_oh_my_opencode_path();
    log::info!("Saving Skills config to: {:?}", path);

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    let content = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize skills config: {}", e))?;

    fs::write(&path, content).map_err(|e| format!("Failed to write skills config: {}", e))?;

    Ok(())
}

#[tauri::command]
fn add_skill(name: String, description: Option<String>, source: String) -> Result<(), String> {
    let mut config = get_skills_config()?;

    let skill = SkillConfig {
        name,
        description,
        enabled: Some(true),
        source: Some(source),
    };

    config.skills.push(skill);
    save_skills_config(config)
}

#[tauri::command]
fn remove_skill(name: String) -> Result<(), String> {
    let mut config = get_skills_config()?;
    config.skills.retain(|s| s.name != name);
    save_skills_config(config)
}

#[tauri::command]
fn toggle_skill(name: String, enabled: bool) -> Result<(), String> {
    let mut config = get_skills_config()?;

    if let Some(skill) = config.skills.iter_mut().find(|s| s.name == name) {
        skill.enabled = Some(enabled);
    }

    save_skills_config(config)
}

// ============================================================================
// Path Commands
// ============================================================================

#[tauri::command]
fn get_config_paths() -> HashMap<String, String> {
    let mut paths = HashMap::new();
    paths.insert(
        "opencode".to_string(),
        get_opencode_config_path().to_string_lossy().to_string(),
    );
    paths.insert(
        "skills".to_string(),
        get_oh_my_opencode_path().to_string_lossy().to_string(),
    );
    paths.insert(
        "claude".to_string(),
        get_claude_config_path().to_string_lossy().to_string(),
    );
    paths.insert(
        "backup".to_string(),
        get_backup_directory().to_string_lossy().to_string(),
    );
    paths
}

// ============================================================================
// Backup Commands
// ============================================================================

#[tauri::command]
fn create_backup() -> Result<String, String> {
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S").to_string();
    let backup_dir = get_backup_directory();

    fs::create_dir_all(&backup_dir)
        .map_err(|e| format!("Failed to create backup directory: {}", e))?;

    // Load raw configs as JSON values
    let opencode_config = load_opencode_config()
        .ok()
        .map(|c| serde_json::to_value(c).unwrap_or(serde_json::json!({})));
    let claude_config = load_claude_config()
        .ok()
        .map(|c| serde_json::to_value(c).unwrap_or(serde_json::json!({})));
    let skills_config = get_skills_config().ok();

    let backup_data = BackupData {
        timestamp: timestamp.clone(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        opencode_config,
        claude_config,
        skills_config,
    };

    let backup_path = backup_dir.join(format!("backup_{}.json", timestamp));
    let content = serde_json::to_string_pretty(&backup_data)
        .map_err(|e| format!("Failed to serialize backup: {}", e))?;

    fs::write(&backup_path, content).map_err(|e| format!("Failed to write backup: {}", e))?;

    Ok(backup_path.to_string_lossy().to_string())
}

#[tauri::command]
fn list_backups() -> Result<Vec<String>, String> {
    let backup_dir = get_backup_directory();

    if !backup_dir.exists() {
        return Ok(Vec::new());
    }

    let mut backups = Vec::new();
    let entries =
        fs::read_dir(&backup_dir).map_err(|e| format!("Failed to read backup directory: {}", e))?;

    for entry in entries.flatten() {
        if let Some(name) = entry.file_name().to_str() {
            if name.starts_with("backup_") && name.ends_with(".json") {
                backups.push(entry.path().to_string_lossy().to_string());
            }
        }
    }

    backups.sort_by(|a, b| b.cmp(a)); // Sort descending (newest first)
    Ok(backups)
}

#[tauri::command]
fn restore_backup(backup_path: String) -> Result<(), String> {
    let content =
        fs::read_to_string(&backup_path).map_err(|e| format!("Failed to read backup: {}", e))?;
    let backup: BackupData =
        serde_json::from_str(&content).map_err(|e| format!("Failed to parse backup: {}", e))?;

    if let Some(opencode_value) = backup.opencode_config {
        if let Ok(opencode_config) = serde_json::from_value::<OpenCodeConfig>(opencode_value) {
            save_opencode_config_internal(&opencode_config)?;
        }
    }

    if let Some(claude_value) = backup.claude_config {
        if let Ok(claude_config) = serde_json::from_value::<ClaudeConfig>(claude_value) {
            save_claude_config_internal(&claude_config)?;
        }
    }

    if let Some(skills_config) = backup.skills_config {
        save_skills_config(skills_config)?;
    }

    Ok(())
}

// ============================================================================
// Export Commands
// ============================================================================

#[tauri::command]
fn export_mcp_config(export_path: String) -> Result<(), String> {
    let mcp_list = get_mcp_list()?;

    let export_data = serde_json::json!({
        "opencode": mcp_list.opencode,
        "claude": mcp_list.claude
    });

    let content = serde_json::to_string_pretty(&export_data)
        .map_err(|e| format!("Failed to serialize export: {}", e))?;

    fs::write(&export_path, content).map_err(|e| format!("Failed to write export: {}", e))?;

    Ok(())
}

#[tauri::command]
fn export_skills_config(export_path: String) -> Result<(), String> {
    let skills_config = get_skills_config()?;

    let content = serde_json::to_string_pretty(&skills_config)
        .map_err(|e| format!("Failed to serialize export: {}", e))?;

    fs::write(&export_path, content).map_err(|e| format!("Failed to write export: {}", e))?;

    Ok(())
}

// ============================================================================
// MCP Backup Commands - Single file per source (simplified)
// ============================================================================

/// Get the MCP backup directory path: ~/.config/openclaude-tools/.openclaudesync
fn get_mcp_backup_directory() -> PathBuf {
    if cfg!(target_os = "windows") {
        dirs::config_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("OpenClaude-Tools")
            .join(".openclaudesync")
    } else {
        dirs::home_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join(".config")
            .join("openclaude-tools")
            .join(".openclaudesync")
    }
}

/// MCP Backup Info
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MCPBackupInfo {
    pub filename: String,
    pub timestamp: String,
    pub source: String, // "opencode" or "claude"
    pub mcp_count: usize,
    pub path: String,
    pub created_at: String, // Human readable date
}

/// Backup OpenCode MCP configurations (overwrites single file)
#[tauri::command]
fn backup_opencode_mcps() -> Result<MCPBackupInfo, String> {
    log::info!("Starting OpenCode MCP backup...");
    backup_mcp_by_source("opencode")
}

/// Backup Claude Code MCP configurations (overwrites single file)
#[tauri::command]
fn backup_claude_mcps() -> Result<MCPBackupInfo, String> {
    log::info!("Starting Claude Code MCP backup...");
    backup_mcp_by_source("claude")
}

/// Internal function to backup MCP by source (single file per source)
fn backup_mcp_by_source(source: &str) -> Result<MCPBackupInfo, String> {
    let backup_dir = get_mcp_backup_directory();
    fs::create_dir_all(&backup_dir)
        .map_err(|e| format!("Failed to create backup directory: {}", e))?;
    
    // Use fixed filename for each source (overwrite mode)
    let filename = format!("{}_mcps.json", source);
    
    // Get MCP list
    let mcp_list = get_mcp_list()?;
    
    // Filter MCPs by source
    let mcps_to_backup = if source == "opencode" {
        mcp_list.opencode
    } else {
        mcp_list.claude
    };
    
    // Create backup data with MCP name as key
    let mut mcps: HashMap<String, serde_json::Value> = HashMap::new();
    for mcp in mcps_to_backup {
        let config: serde_json::Value = serde_json::from_str(&mcp.config)
            .unwrap_or_else(|_| serde_json::json!({"raw": mcp.config}));
        mcps.insert(mcp.name, config);
    }
    
    // Create backup data - only source and mcps
    let backup_data = serde_json::json!({
        "source": source,
        "mcps": mcps
    });
    
    let backup_path = backup_dir.join(&filename);
    let content = serde_json::to_string_pretty(&backup_data)
        .map_err(|e| format!("Failed to serialize backup: {}", e))?;
    
    fs::write(&backup_path, &content)
        .map_err(|e| format!("Failed to write backup: {}", e))?;
    
    log::info!("MCP backup saved: {:?}", backup_path);
    
    // Get current timestamp for display
    let created_at = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    Ok(MCPBackupInfo {
        filename,
        timestamp: chrono::Local::now().format("%Y%m%d_%H%M%S").to_string(),
        source: source.to_string(),
        mcp_count: mcps.len(),
        path: backup_path.to_string_lossy().to_string(),
        created_at,
    })
}

/// Get single MCP backup info by source
#[tauri::command]
fn get_mcp_backup(source: String) -> Result<Option<MCPBackupInfo>, String> {
    let backup_dir = get_mcp_backup_directory();
    let filename = format!("{}_mcps.json", source);
    let backup_path = backup_dir.join(&filename);
    
    if !backup_path.exists() {
        return Ok(None);
    }
    
    // Read backup file to get MCP count
    let content = fs::read_to_string(&backup_path)
        .map_err(|e| format!("Failed to read backup: {}", e))?;
    
    let backup_data: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse backup: {}", e))?;
    
    let mcp_count = backup_data["mcps"].as_object()
        .map(|m| m.len())
        .unwrap_or(0);
    
    // Get file metadata for timestamp
    let metadata = fs::metadata(&backup_path)
        .map_err(|e| format!("Failed to get file metadata: {}", e))?;
    let modified = metadata.modified()
        .map_err(|e| format!("Failed to get modified time: {}", e))?;
    let created_at = chrono::DateTime::<chrono::Local>::from(modified)
        .format("%Y-%m-%d %H:%M:%S")
        .to_string();
    
    Ok(Some(MCPBackupInfo {
        filename,
        timestamp: String::new(),
        source,
        mcp_count,
        path: backup_path.to_string_lossy().to_string(),
        created_at,
    }))
}

/// Restore all MCPs from backup
#[tauri::command]
fn restore_mcp_backup(source: String) -> Result<String, String> {
    log::info!("Restoring MCP backup for: {}", source);
    
    let backup_dir = get_mcp_backup_directory();
    let filename = format!("{}_mcps.json", source);
    let backup_path = backup_dir.join(&filename);
    
    if !backup_path.exists() {
        return Err(format!("Backup file not found for {}", source));
    }
    
    let content = fs::read_to_string(&backup_path)
        .map_err(|e| format!("Failed to read backup: {}", e))?;
    
    let backup_data: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse backup: {}", e))?;
    
    let backup_source = backup_data["source"].as_str().unwrap_or("");
    let mcps = backup_data["mcps"].as_object()
        .ok_or("Invalid backup format: missing mcps object")?;
    
    let mut restored_count = 0;
    
    if backup_source == "opencode" {
        let mut opencode_config = load_opencode_config()?;
        for (name, config) in mcps {
            opencode_config.mcp.insert(name.clone(), config.clone());
            restored_count += 1;
        }
        save_opencode_config_internal(&opencode_config)?;
    } else if backup_source == "claude" {
        let mut claude_config = load_claude_config()?;
        for (name, config) in mcps {
            claude_config.mcp_servers.insert(name.clone(), config.clone());
            restored_count += 1;
        }
        save_claude_config_internal(&claude_config)?;
    } else {
        return Err(format!("Unknown backup source: {}", backup_source));
    }
    
    log::info!("Restored {} MCPs from backup", restored_count);
    Ok(format!("Successfully restored {} MCPs to {}", restored_count, 
        if backup_source == "opencode" { "OpenCode" } else { "Claude Code" }))
}

/// Read backup file content by source
#[tauri::command]
fn read_backup_content(source: String) -> Result<String, String> {
    let backup_dir = get_mcp_backup_directory();
    let filename = format!("{}_mcps.json", source);
    let backup_path = backup_dir.join(&filename);
    
    if !backup_path.exists() {
        return Err(format!("Backup file not found for {}", source));
    }
    
    fs::read_to_string(&backup_path)
        .map_err(|e| format!("Failed to read backup: {}", e))
}

/// Restore a single MCP from backup
#[tauri::command]
fn restore_single_mcp(source: String, mcp_name: String) -> Result<String, String> {
    log::info!("Restoring single MCP '{}' from backup", mcp_name);
    
    let backup_dir = get_mcp_backup_directory();
    let filename = format!("{}_mcps.json", source);
    let backup_path = backup_dir.join(&filename);
    
    if !backup_path.exists() {
        return Err(format!("Backup file not found for {}", source));
    }
    
    let content = fs::read_to_string(&backup_path)
        .map_err(|e| format!("Failed to read backup: {}", e))?;
    
    let backup_data: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse backup: {}", e))?;
    
    let backup_source = backup_data["source"].as_str().unwrap_or("");
    let mcps = backup_data["mcps"].as_object()
        .ok_or("Invalid backup format: missing mcps object")?;
    
    let config = mcps.get(&mcp_name)
        .ok_or_else(|| format!("MCP '{}' not found in backup", mcp_name))?;
    
    if backup_source == "opencode" {
        let mut opencode_config = load_opencode_config()?;
        opencode_config.mcp.insert(mcp_name.clone(), config.clone());
        save_opencode_config_internal(&opencode_config)?;
    } else if backup_source == "claude" {
        let mut claude_config = load_claude_config()?;
        claude_config.mcp_servers.insert(mcp_name.clone(), config.clone());
        save_claude_config_internal(&claude_config)?;
    } else {
        return Err(format!("Unknown backup source: {}", backup_source));
    }
    
    log::info!("Restored MCP '{}' from backup", mcp_name);
    Ok(format!("Successfully restored '{}' to {}", mcp_name, 
        if backup_source == "opencode" { "OpenCode" } else { "Claude Code" }))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    log::info!("Starting OpenClaude-Tools v{}", env!("CARGO_PKG_VERSION"));

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            // MCP - Simplified API
            get_mcp_list,
            add_mcp,
            update_mcp,
            delete_mcp,
            sync_mcp,
            // Skills
            get_skills_config,
            save_skills_config,
            add_skill,
            remove_skill,
            toggle_skill,
            // Paths
            get_config_paths,
            // Backup
            create_backup,
            list_backups,
            restore_backup,
            // Export
            export_mcp_config,
            export_skills_config,
            // MCP Backup (simplified)
            backup_opencode_mcps,
            backup_claude_mcps,
            get_mcp_backup,
            restore_mcp_backup,
            read_backup_content,
            restore_single_mcp,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// ============================================================================
// Unit Tests for Format Conversion
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_opencode_to_claude_local_server() {
        let opencode_config = serde_json::json!({
            "type": "local",
            "command": ["npx", "-y", "@anthropic/mcp-server"],
            "environment": {
                "API_KEY": "test-key"
            },
            "enabled": true,
            "description": "Test server"
        });

        let claude_config = convert_opencode_to_claude(&opencode_config);

        // Command should be split
        assert_eq!(claude_config["command"], "npx");
        assert_eq!(claude_config["args"], serde_json::json!(["-y", "@anthropic/mcp-server"]));
        
        // environment -> env
        assert_eq!(claude_config["env"]["API_KEY"], "test-key");
        
        // OpenCode-specific fields should NOT be present
        assert!(!claude_config.as_object().unwrap().contains_key("enabled"));
        assert!(!claude_config.as_object().unwrap().contains_key("description"));
        
        // type SHOULD be present for Claude (converted from OpenCode)
        assert_eq!(claude_config["type"], "stdio");
        
        // environment should NOT be present (renamed to env)
        assert!(!claude_config.as_object().unwrap().contains_key("environment"));
    }

    #[test]
    fn test_opencode_to_claude_remote_server() {
        let opencode_config = serde_json::json!({
            "type": "remote",
            "url": "https://api.example.com/mcp",
            "headers": {
                "Authorization": "Bearer token"
            },
            "enabled": true
        });

        let claude_config = convert_opencode_to_claude(&opencode_config);

        // URL should be preserved
        assert_eq!(claude_config["url"], "https://api.example.com/mcp");
        
        // Headers should be preserved
        assert_eq!(claude_config["headers"]["Authorization"], "Bearer token");
        
        // OpenCode-specific fields should NOT be present
        assert!(!claude_config.as_object().unwrap().contains_key("enabled"));
        
        // type SHOULD be present for Claude (http for remote)
        assert_eq!(claude_config["type"], "http");
    }

    #[test]
    fn test_claude_to_opencode_local_server() {
        let claude_config = serde_json::json!({
            "command": "npx",
            "args": ["-y", "@anthropic/mcp-server"],
            "env": {
                "API_KEY": "test-key"
            }
        });

        let opencode_config = convert_claude_to_opencode(&claude_config);

        // Type should be inferred as local
        assert_eq!(opencode_config["type"], "local");
        
        // enabled should be set to true
        assert_eq!(opencode_config["enabled"], true);
        
        // Command + args should be merged
        assert_eq!(
            opencode_config["command"],
            serde_json::json!(["npx", "-y", "@anthropic/mcp-server"])
        );
        
        // env -> environment
        assert_eq!(opencode_config["environment"]["API_KEY"], "test-key");
    }

    #[test]
    fn test_claude_to_opencode_remote_server() {
        let claude_config = serde_json::json!({
            "url": "https://api.example.com/mcp",
            "headers": {
                "Authorization": "Bearer token"
            }
        });

        let opencode_config = convert_claude_to_opencode(&claude_config);

        // Type should be inferred as remote due to url presence
        assert_eq!(opencode_config["type"], "remote");
        
        // enabled should be set to true
        assert_eq!(opencode_config["enabled"], true);
        
        // URL should be preserved
        assert_eq!(opencode_config["url"], "https://api.example.com/mcp");
    }

    #[test]
    fn test_roundtrip_conversion() {
        // Start with OpenCode config
        let original = serde_json::json!({
            "type": "local",
            "command": ["npx", "-y", "test-server"],
            "environment": {
                "KEY": "value"
            },
            "enabled": true
        });

        // Convert to Claude
        let claude = convert_opencode_to_claude(&original);
        
        // Convert back to OpenCode
        let back_to_opencode = convert_claude_to_opencode(&claude);

        // Key fields should be preserved
        assert_eq!(back_to_opencode["type"], "local");
        assert_eq!(back_to_opencode["enabled"], true);
        assert_eq!(
            back_to_opencode["command"],
            serde_json::json!(["npx", "-y", "test-server"])
        );
        assert_eq!(back_to_opencode["environment"]["KEY"], "value");
    }
}
