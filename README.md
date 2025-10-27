# 旅行 AI - React 版本

一个简洁、清爽的 AI 旅行规划网站，使用 React + Vite 构建。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动并自动打开浏览器。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
travel-planning-ai/
├── src/
│   ├── pages/
│   │   ├── HomePage.jsx         # 首页
│   │   └── TripResultPage.jsx   # 旅行结果页面
│   ├── components/
│   │   ├── Navbar.jsx           # 导航栏组件
│   │   ├── Hero.jsx             # 英雄区+表单组件
│   │   ├── Destinations.jsx     # 目的地推荐组件
│   │   ├── Features.jsx         # 功能特点组件
│   │   ├── Testimonials.jsx     # 用户评价组件
│   │   ├── FAQ.jsx              # 常见问题组件
│   │   ├── Footer.jsx           # 页脚组件
│   │   ├── TripResult.jsx       # 旅行结果展示组件
│   │   └── TripResult.css       # 旅行结果样式
│   ├── App.jsx                  # 主应用+路由配置
│   ├── App.css                  # 全局样式
│   └── main.jsx                 # 入口文件
├── index.html                    # HTML 模板
├── package.json                  # 项目配置
└── vite.config.js               # Vite 配置
```

## ✨ 主要特性

- ✅ **React 18** - 使用最新的 React 特性
- ✅ **React Router** - 多页面路由导航
- ✅ **Vite** - 快速的开发服务器和构建工具
- ✅ **组件化设计** - 高度模块化的组件结构
- ✅ **响应式布局** - 完美适配移动端、平板和桌面
- ✅ **流畅动画** - 平滑的页面滚动和元素动画
- ✅ **状态管理** - 使用 React Hooks 管理状态
- ✅ **清爽 UI** - 现代化的渐变色彩和卡片设计
- ✅ **旅行规划结果页** - 独立页面展示详细行程

## 🎨 组件说明

### 页面 (Pages)

#### HomePage
首页，包含所有主要组件：导航栏、英雄区、目的地推荐、功能特点、用户评价、FAQ 和页脚。

#### TripResultPage
旅行规划结果页面，展示详细的旅行行程安排。

### 组件 (Components)

#### Navbar
导航栏组件，包含平滑滚动到各个区域的功能。

#### Hero
首页英雄区，包含 AI 介绍和旅行规划表单。提交后会跳转到结果页面。

#### TripResult
旅行结果展示组件，包含：
- 行程概览（天数、目的地、人数）
- 目的地时间线导航
- 每日详细行程（可展开/折叠）
- 活动详情（时间、地点、描述）
- 精选酒店推荐

### Destinations
展示热门旅行目的地推荐，点击可快速填充表单。

### Features
展示平台的核心功能特点（量身定制、更便宜、隐藏宝藏、没有惊喜）。

### Testimonials
用户评价展示，包含真实案例和评分。

### FAQ
常见问题解答，支持展开/折叠交互。

### Footer
页脚组件，包含网站链接和版权信息。

## 📝 技术栈

- **React** - UI 框架
- **React Router** - 路由管理
- **Vite** - 构建工具
- **CSS3** - 样式（包含动画和渐变）
- **JavaScript (ES6+)** - 编程语言

## 🚀 路由说明

- `/` - 首页（HomePage）
- `/trip-result` - 旅行规划结果页面（TripResultPage）

## 🛠️ 开发说明

所有组件都是纯函数式组件，使用 React Hooks 进行状态管理。样式使用传统的 CSS 类名方式，便于理解和维护。

## 📄 License

MIT
