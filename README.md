# OpenClaude-Tools

OpenCode 与 Claude Code 配置同步与管理工具 - 跨平台桌面应用程序（Tauri + React + TypeScript）

## 核心功能

- **配置文件检测与解析**: 自动检测 OpenCode 和 Claude Code 的配置文件路径
- **MCP 配置管理**: 可视化查看、编辑、添加、删除 MCP 配置
- **Skills 配置管理**: 查看和管理已安装的 Skills
- **配置同步**: 单向/双向同步两软件的配置差异
- **深色/浅色模式**: 支持深色和浅色主题切换
- **中英文切换**: 支持中文和英文界面

## 技术栈

- **前端框架**: React 18 + TypeScript
- **UI 组件库**: Tailwind CSS + 自定义组件
- **状态管理**: Zustand
- **桌面框架**: Tauri 2.x
- **构建工具**: Vite

## 版本历史

### v1.0.0 (当前版本)

- 配置文件检测与解析
- MCP 配置同步基础功能
- 基础可视化编辑
- 深色/浅色模式
- 中英文支持
- GitHub Actions 自动构建脚本

### v1.1.0 (规划中)

- Skills 配置同步
- 同步历史记录
- 配置导入/导出

### v1.2.0 (规划中)

- 系统托盘支持
- 自动更新检测

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri dev
```

### 构建发布

```bash
npm run tauri build
```

## 项目结构

```
openClaude-tools/
├── src/                    # React 前端源码
│   ├── components/         # UI 组件
│   ├── pages/              # 页面组件
│   ├── stores/             # Zustand 状态管理
│   ├── i18n/               # 国际化
│   └── types/              # TypeScript 类型定义
├── src-tauri/              # Tauri 后端源码
│   ├── src/                # Rust 源码
│   └── Cargo.toml          # Rust 依赖
├── public/                  # 静态资源
├── Doc/                    # 文档目录
└── package.json            # Node 依赖
```

## 配置文件路径

### OpenCode
- 主配置: `~/.config/opencode/opencode.json`
- Skills/Agents: `~/.config/opencode/oh-my-opencode.json`

### Claude Code
- 主配置: `~/.claude/settings.json`
- MCP: `~/.claude/plugins/` (各插件目录下的 .mcp.json)

## 支持平台

- macOS (Apple Silicon + Intel)
- Windows
- Linux

## 许可证

MIT License
