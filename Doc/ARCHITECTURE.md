# OpenClaude-Tools 架构文档

## 1. 系统架构概述

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐    │
│  │Dashboard│ │MCP Page │ │Skills   │ │Settings    │    │
│  └────┬────┘ └────┬────┘ └────┬────┘ └──────┬──────┘    │
│       └──────────┬┴───────────┴─────────────┘           │
│                  │                                       │
│           ┌──────▼──────┐                                 │
│           │   Zustand  │  State Management               │
│           │   Stores   │                                 │
│           └──────┬──────┘                                 │
│                  │                                       │
│           ┌──────▼──────┐                                 │
│           │  Tauri IPC  │  Invoke Commands               │
│           └──────┬──────┘                                 │
└──────────────────┼───────────────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────────────┐
│                    Backend (Rust/Tauri)                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │Config Read  │ │Config Write │ │Sync Engine  │       │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘       │
│         └───────────────┼───────────────┘               │
│                         │                                 │
│                  ┌──────▼──────┐                         │
│                  │ File System │                         │
│                  └─────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

### 1.2 技术架构

- **前端框架**: React 18 + TypeScript
- **桌面框架**: Tauri 2.x
- **状态管理**: Zustand
- **样式方案**: Tailwind CSS
- **国际化**: react-i18next
- **构建工具**: Vite

---

## 2. 模块设计

### 2.1 前端模块

#### 2.1.1 页面组件

| 模块 | 职责 | 导出 |
|------|------|------|
| Dashboard | 首页，展示总览和状态 | `DashboardPage` |
| MCPMgmt | MCP 配置管理 | `MCPMgmtPage` |
| SkillsMgmt | Skills 配置管理 | `SkillsMgmtPage` |
| SyncCenter | 同步中心 | `SyncCenterPage` |
| Settings | 设置页面 | `SettingsPage` |

#### 2.1.2 通用组件

| 组件 | 描述 |
|------|------|
| Layout | 主布局（Header + Sidebar + Content） |
| Sidebar | 侧边栏导航 |
| Header | 顶部导航栏 |
| Card | 卡片组件 |
| Button | 按钮组件 |
| Input | 输入框组件 |
| Toggle | 开关组件 |
| Modal | 弹窗组件 |
| Tag | 标签组件 |

#### 2.1.3 状态管理 (Zustand)

```typescript
// stores/configStore.ts
interface ConfigStore {
  // State
  opencodeConfig: OpenCodeConfig | null;
  claudeConfig: ClaudeConfig | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadConfigs: () => Promise<void>;
  updateOpenCodeConfig: (config: Partial<OpenCodeConfig>) => Promise<void>;
  updateClaudeConfig: (config: Partial<ClaudeConfig>) => Promise<void>;
}

// stores/settingsStore.ts
interface SettingsStore {
  theme: 'dark' | 'light';
  language: 'zh' | 'en';
  setTheme: (theme: 'dark' | 'light') => void;
  setLanguage: (lang: 'zh' | 'en') => void;
}
```

### 2.2 后端模块 (Rust)

#### 2.2.1 命令模块

| 命令 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `get_opencode_config` | 获取 OpenCode 配置 | - | `OpenCodeConfig` |
| `get_claude_config` | 获取 Claude Code 配置 | - | `ClaudeConfig` |
| `save_opencode_config` | 保存 OpenCode 配置 | `OpenCodeConfig` | `Result<(), Error>` |
| `save_claude_config` | 保存 Claude Code 配置 | `ClaudeConfig` | `Result<(), Error>` |
| `sync_mcp` | 同步 MCP 配置 | `SyncRequest` | `SyncResult` |
| `get_config_diff` | 获取配置差异 | `DiffRequest` | `DiffResult` |

#### 2.2.2 配置解析模块

```rust
// 结构体定义
pub struct OpenCodeConfig {
    pub mcp: HashMap<String, MCPConfig>,
    pub provider: HashMap<String, ProviderConfig>,
    pub plugin: Vec<String>,
}

pub struct ClaudeConfig {
    pub settings: ClaudeSettings,
    pub plugins: Vec<PluginConfig>,
}

pub struct MCPConfig {
    pub mcp_type: String,  // "remote" | "local"
    pub url: Option<String>,
    pub command: Option<Vec<String>>,
    pub headers: Option<HashMap<String, String>>,
    pub environment: Option<HashMap<String, String>>,
    pub enabled: bool,
}
```

#### 2.2.3 同步引擎

```rust
pub struct SyncEngine;

impl SyncEngine {
    /// 计算两个配置之间的差异
    pub fn diff(&self, source: &Config, target: &Config) -> DiffResult;
    
    /// 执行单向同步
    pub fn sync_one_way(&self, request: SyncRequest) -> SyncResult;
    
    /// 执行双向同步
    pub fn sync_bidirectional(&self, request: SyncRequest) -> SyncResult;
}
```

---

## 3. 数据流设计

### 3.1 配置加载流程

```
User Action (Page Load)
        │
        ▼
┌───────────────────┐
│  Frontend: Page   │
│  Component        │
└────────┬──────────┘
         │ useEffect / onMount
         ▼
┌───────────────────┐
│  Zustand Store    │
│  loadConfigs()    │
└────────┬──────────┘
         │ dispatch
         ▼
┌───────────────────┐
│  Tauri Invoke     │
│  "get_config"     │
└────────┬──────────┘
         │ IPC
         ▼
┌───────────────────┐
│  Rust Backend     │
│  File Read        │
└────────┬──────────┘
         │ parse
         ▼
┌───────────────────┐
│  Return JSON      │
│  to Frontend      │
└────────┬──────────┘
         │ update state
         ▼
┌───────────────────┐
│  React Re-render  │
│  Show Data        │
└───────────────────┘
```

### 3.2 配置同步流程

```
User clicks "Sync"
        │
        ▼
┌───────────────────┐
│  Show Preview     │
│  Modal            │
└────────┬──────────┘
         │ user confirms
         ▼
┌───────────────────┐
│  Backend:         │
│  sync_mcp()       │
└────────┬──────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│Read   │ │Write  │
│Source │ │Target │
└───┬───┘ └───┬───┘
    │         │
    └────┬────┘
         │
         ▼
┌───────────────────┐
│  Return Result    │
│  to Frontend      │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Show Success     │
│  Message          │
└───────────────────┘
```

---

## 4. 错误处理

### 4.1 前端错误处理

```typescript
// 使用 Try-Catch 和错误边界
try {
  await configStore.loadConfigs();
} catch (error) {
  if (error instanceof FileNotFoundError) {
    // 配置不存在，引导用户
  } else if (error instanceof PermissionError) {
    // 权限错误，提示用户
  } else {
    // 未知错误，显示通用消息
  }
}
```

### 4.2 后端错误类型

```rust
pub enum ConfigError {
    FileNotFound(String),
    ParseError(String),
    WriteError(String),
    PermissionDenied(String),
    InvalidFormat(String),
}
```

---

## 5. 安全考虑

### 5.1 文件访问

- 仅访问特定配置文件目录
- 不访问用户其他敏感文件
- 配置文件修改前自动备份

### 5.2 数据安全

- 所有操作本地执行，不上传任何数据
- 敏感信息（如 API Key）显示时脱敏
- 修改配置前创建备份

---

## 6. 性能优化

### 6.1 前端优化

- 使用 React.memo 缓存组件
- 虚拟列表处理大量配置项
- 懒加载非首屏组件

### 6.2 后端优化

- 配置文件缓存
- 增量同步（仅同步差异）
- 异步文件操作

---

*文档版本: 1.0.0*
*最后更新: 2026-02-26*
