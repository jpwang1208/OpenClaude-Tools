import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.mcp': 'MCP List',
      'nav.skills': 'Skills Management',
      'nav.models': 'Third-party Models',
      'nav.backup': 'MCP Backup List',
      // MCP Management
      'mcp.title': 'MCP List',
      'mcp.subtitle': 'Manage Model Context Protocol configurations',
      'mcp.add': 'Add New MCP',
      'mcp.search': 'Search MCP...',
      'mcp.type': 'Type',
      'mcp.remote': 'Remote',
      'mcp.local': 'Local',
      'mcp.enabled': 'Enabled',
      'mcp.disabled': 'Disabled',
      'mcp.edit': 'Edit',
      'mcp.delete': 'Delete',
      'mcp.noMcp': 'No MCP configurations found',
      'mcp.noOpenCodeMcp': 'No OpenCode MCP configurations. Click the button above to add one.',
      'mcp.noClaudeMcp': 'No Claude Code MCP configurations found. MCPs will be loaded from Claude Code plugins.',
      'mcp.addTitle': 'Add New MCP',
      'mcp.editTitle': 'Edit MCP',
      'mcp.name': 'Name',
      'mcp.namePlaceholder': 'Enter MCP name',
      'mcp.description': 'Description',
      'mcp.descriptionPlaceholder': 'Enter MCP description',
      'mcp.url': 'URL',
      'mcp.urlPlaceholder': 'https://example.com/mcp',
      'mcp.command': 'Command',
      'mcp.commandPlaceholder': 'node, mcp-server.js',
      'mcp.syncToClaude': 'Sync to Claude code',
      'mcp.syncToOpenCode': 'Sync to OpenCode',
      'mcp.viewLog': 'View Log',

      // Skills Management
      'skills.title': 'Skills Management',
      'skills.subtitle': 'Extend your AI assistant capabilities with custom scripts and automation',
      'skills.add': 'Add New Skill',
      'skills.addTitle': 'Add New Skill',
      'skills.editTitle': 'Edit Skill',
      'skills.noSkills': 'No skills configurations found',
      'skills.globalTab': 'Global Skills',
      'skills.projectTab': 'Project Skills',
      'skills.projectFolder': 'Project Folder Configuration',
      'skills.changePath': 'Change Path',
      'skills.syncToClaude': 'Sync to Claude code',
      'skills.pluginDesc': 'Plugin extension for enhanced AI capabilities',
      'skills.name': 'Name',
      'skills.namePlaceholder': 'Enter skill name',
      'skills.description': 'Description',
      'skills.descriptionPlaceholder': 'Enter skill description',
      'skills.deleteConfirm': 'Delete',
      'skills.selectProjectFolder': 'Select Project Folder',
      
      // Models Management
      'models.title': 'Third-party Model Management',
      'models.subtitle': 'Configure and manage external AI model providers',
      'models.add': 'Add Model',
      'models.refresh': 'Refresh',
      'models.all': 'All',
      'models.local': 'Local',
      'models.remote': 'Remote',
      'models.noModels': 'No models configured',
      'models.configure': 'Configure',
      
      // Settings
      'settings.title': 'Settings',
      'settings.subtitle': 'Customize your experience',
      'settings.theme': 'Theme',
      'settings.themeDark': 'Dark',
      'settings.themeLight': 'Light',
      'settings.language': 'Language',
      'settings.langZh': '中文',
      'settings.langEn': 'English',
      'settings.autoUpdate': 'Auto Check Update',
      'settings.minimizeToTray': 'Minimize to System Tray',
      'settings.about': 'About',
      'settings.version': 'Version',
      'settings.checkUpdate': 'Check Update',
      
      // Actions
      'action.save': 'Save',
      'action.cancel': 'Cancel',
      'action.confirm': 'Confirm',
      'action.close': 'Close',
      'action.refresh': 'Refresh',
      'action.backup': 'Backup',
      'action.export': 'Export',
      'action.import': 'Import',
      
      // Status
      'status.loading': 'Loading...',
      'status.saving': 'Saving...',
      'status.success': 'Success',
      'status.error': 'Error',
      'status.noData': 'No Data',
      'status.backupSuccess': 'MCP backup completed successfully',
      'status.backupError': 'MCP backup failed',
      'status.restoring': 'Restoring...',
      // Errors
      'error.configNotFound': 'Configuration file not found',
      'error.parseFailed': 'Failed to parse configuration',
      'error.saveFailed': 'Failed to save configuration',
      'error.syncFailed': 'Synchronization failed',
      
      // Backup
      'backup.title': 'MCP Backup',
      'backup.backups': 'backups',
      'backup.noBackup': 'No backup found',
      'backup.noBackupHint': 'Click the Backup button in MCP Management to create a backup',
      'backup.restore': 'Restore',
      'backup.restoreAll': 'Restore All',
      'backup.restoreAllConfirm': 'Restore all MCPs from backup? This will overwrite current MCP configurations.',
      'backup.restoreMcpConfirm': 'Restore MCP',
      'backup.restoreError': 'Restore failed',
      'backup.noMcps': 'No MCPs in this backup',
    }
  },
  zh: {
    translation: {
      // Navigation
      'nav.mcp': 'MCP 管理',
      'nav.skills': 'Skills 管理',
      'nav.models': '第三方模型管理',
      'nav.backup': 'MCP 备份列表',
      
      // MCP Management
      'mcp.title': 'MCP 列表',
      'mcp.subtitle': '管理模型上下文协议配置',
      'mcp.add': '添加新MCP配置',
      'mcp.search': '搜索 MCP...',
      'mcp.type': '类型',
      'mcp.remote': '远程',
      'mcp.local': '本地',
      'mcp.enabled': '已启用',
      'mcp.disabled': '已禁用',
      'mcp.edit': '编辑',
      'mcp.delete': '删除',
      'mcp.noMcp': '未找到 MCP 配置',
      'mcp.noOpenCodeMcp': '未找到 OpenCode MCP 配置。点击上方按钮添加。',
      'mcp.noClaudeMcp': '未找到 Claude Code MCP 配置。MCP 将从 Claude Code 插件加载。',
      'mcp.addTitle': '添加新 MCP',
      'mcp.editTitle': '编辑 MCP',
      'mcp.name': '名称',
      'mcp.namePlaceholder': '请输入 MCP 名称',
      'mcp.description': '描述',
      'mcp.descriptionPlaceholder': '请输入 MCP 描述',
      'mcp.url': 'URL 地址',
      'mcp.urlPlaceholder': 'https://example.com/mcp',
      'mcp.command': '命令',
      'mcp.commandPlaceholder': 'node, mcp-server.js',
      'mcp.syncToClaude': '同步到 Claude code',
      'mcp.syncToOpenCode': '同步到 OpenCode',
      'mcp.viewLog': '查看日志',

      // Skills Management
      'skills.title': 'Skills 管理',
      'skills.subtitle': '扩展您的 AI 助手能力，支持自定义脚本与自动化流程',
      'skills.add': '添加新Skills',
      'skills.addTitle': '添加新技能',
      'skills.editTitle': '编辑技能',
      'skills.noSkills': '未找到 Skills 配置',
      'skills.globalTab': '全局技能',
      'skills.projectTab': '项目技能',
      'skills.projectFolder': '项目文件夹配置',
      'skills.changePath': '更改路径',
      'skills.syncToClaude': '同步到 Claude code',
      'skills.pluginDesc': '扩展 AI 助手能力的插件',
      'skills.name': '名称',
      'skills.namePlaceholder': '请输入技能名称',
      'skills.description': '描述',
      'skills.descriptionPlaceholder': '请输入技能描述',
      'skills.deleteConfirm': '删除',
      'skills.selectProjectFolder': '选择项目文件夹',
      
      // Models Management
      'models.title': '第三方模型管理',
      'models.subtitle': '配置和管理外部 AI 模型提供商',
      'models.add': '添加模型',
      'models.refresh': '刷新',
      'models.all': '全部',
      'models.local': '本地',
      'models.remote': '远程',
      'models.noModels': '未配置模型',
      'models.configure': '配置',
      
      // Settings
      'settings.title': '设置',
      'settings.subtitle': '自定义您的体验',
      'settings.theme': '主题',
      'settings.themeDark': '深色',
      'settings.themeLight': '浅色',
      'settings.language': '语言',
      'settings.langZh': '中文',
      'settings.langEn': 'English',
      'settings.autoUpdate': '自动检查更新',
      'settings.minimizeToTray': '最小化到系统托盘',
      'settings.about': '关于',
      'settings.version': '版本',
      'settings.checkUpdate': '检查更新',
      
      // Actions
      'action.save': '保存',
      'action.cancel': '取消',
      'action.confirm': '确认',
      'action.close': '关闭',
      'action.refresh': '刷新',
      'action.backup': '备份',
      'action.export': '导出',
      'action.import': '导入',
      
      // Status
      'status.loading': '加载中...',
      'status.saving': '保存中...',
      'status.success': '成功',
      'status.error': '错误',
      'status.noData': '暂无数据',
      'status.backupSuccess': 'MCP 备份成功',
      'status.backupError': 'MCP 备份失败',
      'status.restoring': '恢复中...',
      
      // Errors
      'error.configNotFound': '未找到配置文件',
      'error.parseFailed': '解析配置文件失败',
      'error.saveFailed': '保存配置文件失败',
      'error.syncFailed': '同步失败',
      
      // Backup
      'backup.title': 'MCP 备份',
      'backup.backups': '个备份',
      'backup.noBackup': '未找到备份',
      'backup.noBackupHint': '在 MCP 管理页面点击备份按钮创建备份',
      'backup.restore': '恢复',
      'backup.restoreAll': '全部恢复',
      'backup.restoreAllConfirm': '从备份恢复所有 MCP？这将覆盖当前的 MCP 配置。',
      'backup.restoreMcpConfirm': '恢复 MCP',
      'backup.restoreError': '恢复失败',
      'backup.noMcps': '此备份中没有 MCP',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;