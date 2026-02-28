# OpenClaude-Tools UI 设计规范

## 1. 设计概述

### 1.1 设计目标
为 OpenClaude-Tools 创建一套专业、现代、科技感十足的 UI 设计，支持深色/浅色模式和中英文切换。

### 1.2 目标平台
- macOS
- Windows  
- Linux

### 1.3 屏幕尺寸
- 最小支持: 1024 x 768
- 推荐尺寸: 1280 x 1024 及以上

---

## 2. 颜色系统

### 2.1 深色模式 (Dark Mode)

```css
/* 主色系 */
--color-primary: #6366F1;        /* Indigo-500 - 主按钮、链接、强调 */
--color-primary-hover: #4F46E5;  /* Indigo-600 - 悬停状态 */
--color-primary-active: #4338CA; /* Indigo-700 - 激活状态 */
--color-secondary: #8B5CF6;      /* Violet-500 - 次要强调 */
--color-accent: #06B6D4;         /* Cyan-500 - 特别强调、标签 */

/* 背景色 */
--color-bg-base: #0F0F23;        /* 最深背景 - 页面主背景 */
--color-bg-elevated: #1A1A2E;    /* 卡片、弹窗背景 */
--color-bg-surface: #16162A;     /* 输入框、下拉菜单背景 */
--color-bg-hover: #252540;       /* 悬停背景 */

/* 边框色 */
--color-border: #2D2D44;         /* 默认边框 */
--color-border-focus: #6366F1;   /* 聚焦边框 */

/* 文字色 */
--color-text-primary: #F8FAFC;   /* 主要文字 */
--color-text-secondary: #94A3B8; /* 次要文字 */
--color-text-tertiary: #64748B;  /* 禁用、提示文字 */

/* 功能色 */
--color-success: #10B981;        /* 成功状态 */
--color-warning: #F59E0B;         /* 警告状态 */
--color-error: #EF4444;          /* 错误状态 */
--color-info: #3B82F6;           /* 信息提示 */

/* 渐变 */
--gradient-primary: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
--gradient-accent: linear-gradient(135deg, #06B6D4 0%, #6366F1 100%);
--gradient-glow: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%);
```

### 2.2 浅色模式 (Light Mode)

```css
/* 主色系 */
--color-primary: #4F46E5;        /* Indigo-600 */
--color-primary-hover: #4338CA;  /* Indigo-700 */
--color-primary-active: #3730A3; /* Indigo-800 */
--color-secondary: #7C3AED;     /* Violet-600 */
--color-accent: #0891B2;         /* Cyan-600 */

/* 背景色 */
--color-bg-base: #F8FAFC;        /* 页面主背景 */
--color-bg-elevated: #FFFFFF;    /* 卡片、弹窗背景 */
--color-bg-surface: #F1F5F9;     /* 输入框、下拉菜单背景 */
--color-bg-hover: #E2E8F0;       /* 悬停背景 */

/* 边框色 */
--color-border: #E2E8F0;         /* 默认边框 */
--color-border-focus: #4F46E5;   /* 聚焦边框 */

/* 文字色 */
--color-text-primary: #0F172A;   /* 主要文字 */
--color-text-secondary: #64748B; /* 次要文字 */
--color-text-tertiary: #94A3B8;  /* 禁用、提示文字 */

/* 功能色 */
--color-success: #059669;
--color-warning: #D97706;
--color-error: #DC2626;
--color-info: #2563EB;
```

---

## 3. 字体系统

### 3.1 字体族

```css
/* 主字体 - 界面文字 */
--font-sans: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* 等宽字体 - 代码、数字 */
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Monaco', monospace;

/* 标题字体 (可选) */
--font-display: 'Space Grotesk', 'SF Pro Display', sans-serif;
```

### 3.2 字号系统

```css
/* 标题 */
--text-h1: 28px;      /* 页面主标题 */
--text-h2: 22px;      /* 区块标题 */
--text-h3: 18px;      /* 卡片标题 */
--text-h4: 16px;      /* 小节标题 */

/* 正文 */
--text-body: 14px;    /* 主要正文 */
--text-body-sm: 13px; /* 次要正文 */
--text-small: 12px;   /* 辅助说明 */
--text-xs: 11px;      /* 标签、小字 */

/* 代码 */
--text-code: 13px;
```

### 3.3 字重

```css
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## 4. 间距系统

### 4.1 基础间距单位

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### 4.2 常用间距

```css
/* 内边距 */
--padding-xs: 8px;
--padding-sm: 12px;
--padding-md: 16px;
--padding-lg: 24px;
--padding-xl: 32px;

/* 外边距 */
--margin-xs: 8px;
--margin-sm: 12px;
--margin-md: 16px;
--margin-lg: 24px;
--margin-xl: 32px;

/* 组件间距 */
--gap-xs: 8px;
--gap-sm: 12px;
--gap-md: 16px;
--gap-lg: 24px;
```

---

## 5. 布局规范

### 5.1 页面布局

```
┌─────────────────────────────────────────────────────────┐
│  Header (64px)                                          │
├────────────┬────────────────────────────────────────────┤
│            │                                             │
│  Sidebar   │  Content Area                               │
│  (240px)   │  (flex: 1)                                 │
│            │                                             │
│            │                                             │
├────────────┴────────────────────────────────────────────┤
│  Status Bar (32px)                                      │
└─────────────────────────────────────────────────────────┘
```

### 5.2 侧边栏

- 宽度: 240px (可折叠至 64px)
- 背景: `--color-bg-elevated`
- 边框: 右侧 1px `--color-border`
- 菜单项高度: 44px
- 菜单项内边距: 12px 16px
- 图标大小: 20px
- 图标与文字间距: 12px

### 5.3 顶部导航栏

- 高度: 64px
- 背景: `--color-bg-elevated`
- 边框: 底部 1px `--color-border`
- Logo 区域: 左侧 240px
- 右侧操作区: 用户设置、主题、语言切换

### 5.4 内容区域

- 内边距: 24px
- 最大宽度: 1400px (居中显示)
- 卡片网格: CSS Grid, `repeat(auto-fill, minmax(320px, 1fr))`
- 卡片间距: 16px

---

## 6. 组件规范

### 6.1 按钮

```css
/* 主按钮 */
.btn-primary {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  background: var(--color-primary);
  color: white;
  font-weight: 500;
  transition: all 0.15s ease;
}
.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
.btn-primary:active {
  transform: scale(0.98);
}

/* 次按钮 */
.btn-secondary {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}
.btn-secondary:hover {
  background: var(--color-bg-hover);
  border-color: var(--color-primary);
}

/* 文字按钮 */
.btn-ghost {
  height: 32px;
  padding: 0 12px;
  background: transparent;
  color: var(--color-primary);
}
.btn-ghost:hover {
  background: var(--color-bg-hover);
}

/* 图标按钮 */
.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 6.2 输入框

```css
.input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all 0.15s ease;
}
.input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}
.input::placeholder {
  color: var(--color-text-tertiary);
}
```

### 6.3 卡片

```css
.card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}
.card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);
}
.card-glow {
  position: relative;
}
.card-glow::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 12px;
  padding: 1px;
  background: var(--gradient-accent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.card-glow:hover::before {
  opacity: 1;
}
```

### 6.4 开关

```css
.toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: var(--color-border);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}
.toggle::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: all 0.2s ease;
}
.toggle.active {
  background: var(--color-primary);
}
.toggle.active::after {
  transform: translateX(20px);
}
```

### 6.5 标签

```css
.tag {
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}
.tag-primary {
  background: rgba(99, 102, 241, 0.15);
  color: var(--color-primary);
}
.tag-success {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}
.tag-warning {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
}
.tag-error {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-error);
}
```

---

## 7. 动画规范

### 7.1 过渡时长

```css
--transition-fast: 0.1s ease;
--transition-base: 0.15s ease;
--transition-slow: 0.3s ease;
```

### 7.2 缓动函数

```css
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### 7.3 常用动画

```css
/* 悬停上浮 */
.hover-lift {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 脉冲发光 */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  50% {
    box-shadow: 0 0 20px 4px rgba(99, 102, 241, 0.2);
  }
}
.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* 淡入 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* 加载旋转 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
```

---

## 8. 响应式断点

```css
/* 小屏幕 */
@media (max-width: 768px) {
  --sidebar-width: 0px;
  --header-height: 56px;
}

/* 中等屏幕 */
@media (min-width: 769px) and (max-width: 1024px) {
  --sidebar-width: 200px;
}

/* 大屏幕 */
@media (min-width: 1025px) {
  --sidebar-width: 240px;
}

/* 超大屏幕 */
@media (min-width: 1440px) {
  --content-max-width: 1400px;
}
```

---

## 9. 国际化

### 9.1 文字方向

- 中文 (zh-CN): LTR, 无特殊处理
- 英文 (en-US): LTR, 无特殊处理

### 9.2 翻译占位符

所有用户可见文本使用 i18n key:

```typescript
// 示例
{
  "nav.dashboard": "仪表盘 | Dashboard",
  "nav.mcp": "MCP 管理 | MCP Management",
  "nav.skills": "Skills 管理 | Skills Management",
  "nav.sync": "同步中心 | Sync Center",
  "nav.settings": "设置 | Settings",
  "action.add": "添加 | Add",
  "action.edit": "编辑 | Edit",
  "action.delete": "删除 | Delete",
  "action.sync": "同步 | Sync",
  "status.enabled": "已启用 | Enabled",
  "status.disabled": "已禁用 | Disabled"
}
```

---

## 10. 无障碍规范

### 10.1 颜色对比度

- 主要文字与背景: ≥ 4.5:1
- 次要文字与背景: ≥ 3:1
- 按钮文字与按钮背景: ≥ 4.5:1

### 10.2 焦点状态

- 所有可交互元素可见焦点样式
- 焦点轮廓: 2px solid var(--color-primary)
- 焦点偏移: 2px

### 10.3 键盘导航

- 支持 Tab 键导航
- 支持 Enter/Space 激活
- 支持 Escape 关闭弹窗

---

*文档版本: 1.0.0*
*最后更新: 2026-02-26*
