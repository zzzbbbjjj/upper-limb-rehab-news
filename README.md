# 🦾 上肢康复机器人 · 研究前沿

> Weekly automated research paper aggregation for upper limb rehabilitation robotics — bilingual (Chinese/English), news-style, auto-deployed.

[![Weekly Update](https://github.com/YOUR_USERNAME/upper-limb-rehab-news/actions/workflows/weekly-update.yml/badge.svg)](https://github.com/YOUR_USERNAME/upper-limb-rehab-news/actions/workflows/weekly-update.yml)

## ✨ 功能特性

- 📰 **新闻式论文展示** — 卡片布局、时间线归档、分页浏览
- 🌐 **中英双语** — UI 可切换中英文，每篇论文同时提供中英文摘要
- 🏷️ **智能标签** — 自动分类（外骨骼、软体机器人、脑卒中、绳索驱动等）
- 🔍 **全文搜索** — 支持中英文关键词搜索
- 📱 **响应式设计** — 桌面双列、平板/手机单列，支持暗色模式
- 🤖 **全自动更新** — GitHub Actions 每周一自动抓取新论文并部署

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 本地预览生产版本
npm run start
```

## 📂 项目结构

```
├── content/papers/          # MDX 论文文件（自动生成 + 手动编写）
├── scripts/
│   ├── fetch_papers.py      # 论文抓取脚本
│   └── requirements.txt
├── src/
│   ├── app/                 # Next.js App Router 页面
│   │   ├── page.tsx         # 首页
│   │   ├── papers/[slug]/   # 论文详情页
│   │   ├── tags/[tag]/      # 标签筛选页
│   │   ├── search/          # 搜索页
│   │   └── archive/         # 归档页（按周分组）
│   ├── components/          # UI 组件
│   ├── lib/
│   │   ├── papers.ts        # MDX 解析 & 搜索
│   │   ├── i18n.tsx          # 国际化 Context
│   │   ├── dictionaries.ts   # 中英文字典
│   │   └── types.ts          # TypeScript 类型
│   └── app/globals.css      # Tailwind + 自定义样式
└── .github/workflows/
    └── weekly-update.yml    # 每周自动更新
```

## 🤖 自动更新机制

```
星期一 UTC 8:00
    ↓
GitHub Actions 触发
    ↓
Python 脚本查询 Semantic Scholar + arXiv API
    ↓
生成新论文 MDX 文件 → git commit & push
    ↓
Vercel 检测到 push → 自动重新部署
```

### 手动触发更新

1. 打开 GitHub 仓库的 **Actions** 标签
2. 选择 **Weekly Paper Fetch** workflow
3. 点击 **Run workflow** → **Run workflow**

### 本地运行抓取脚本

```bash
pip install -r scripts/requirements.txt
python scripts/fetch_papers.py             # 实际抓取并生成 MDX
python scripts/fetch_papers.py --dry-run   # 预览模式（不写文件）
```

## 📝 MDX 论文格式

```yaml
---
title: "中文标题"
title_en: "English Title"
authors: ["Author A.", "Author B."]
date: "2025-07-14"
source: "Journal Name"
source_url: "https://doi.org/..."
doi: "10.xxx/..."
tags: ["标签1", "标签2"]
tags_en: ["tag1", "tag2"]
keywords: ["关键词1"]
keywords_en: ["keyword1"]
---

## 中文摘要
中文摘要内容...

## English Summary
English summary content...
```

## 🚢 部署到 Vercel

1. Push 代码到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 框架自动检测为 Next.js，无需额外配置
4. 部署完成后，每次 `git push` 自动重新部署

## 🔧 技术栈

| 层 | 技术 |
|---|------|
| 框架 | Next.js 14 (App Router) |
| 样式 | Tailwind CSS |
| 内容 | MDX |
| 多语言 | React Context |
| 内容管道 | Python + Semantic Scholar API + arXiv API |
| 自动化 | GitHub Actions (cron) |
| 部署 | Vercel |

## 📄 开源协议

MIT License — 自由使用、修改和分发。
