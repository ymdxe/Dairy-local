# 留白日记

一个本地优先的个人日记网站，适合长期记录、回顾和温和整理自己的日常状态。前端可以单独部署到 GitHub Pages；AI 分析通过可选的本地 Express 代理提供，在后端缺失时会自动降级，不影响写作和回顾。

## 功能概览

- 新增、查看、编辑、删除日记
- 记录心情 Emoji、天气、今日收获、进步值、今日问题、明日重点、标签
- 自动保存编辑草稿到 IndexedDB
- 搜索标题和正文，按心情、天气、标签筛选
- 回顾页展示本月数量、连续写作、心情统计、进步趋势、最近 7 天心情变化、高频标签
- 导出全部日记为 JSON，支持导入恢复
- 本地 AI 代理支持情绪总结、压力来源、积极信号、鼓励和明日建议
- GitHub Pages 上仅部署前端，AI 功能会优雅显示为未启用

## 技术栈

- 前端：React + TypeScript + Vite + Tailwind CSS + Zustand + IndexedDB
- 图表：Recharts
- 后端：Node.js + Express
- 部署：GitHub Pages（前端） + 本地可选 AI 代理

## 目录结构

```text
.
├─ apps
│  ├─ web
│  │  ├─ src
│  │  │  ├─ components
│  │  │  ├─ pages
│  │  │  ├─ repositories
│  │  │  ├─ services
│  │  │  ├─ store
│  │  │  ├─ db
│  │  │  └─ types
│  │  └─ public
│  └─ server
│     ├─ src
│     └─ .env.example
├─ .github/workflows/deploy-pages.yml
└─ package.json
```

## 安装依赖

```bash
npm install
```

## 启动前端

```bash
npm run dev:web
```

默认地址通常是 [http://localhost:5173](http://localhost:5173)。

## 启动后端

先复制环境变量模板：

```bash
copy apps\\server\\.env.example apps\\server\\.env
```

然后填写：

```env
PORT=8787
AI_API_KEY=你的密钥
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=你的兼容模型名
```

再启动后端：

```bash
npm run dev:server
```

本地联调时也可以一起启动：

```bash
npm run dev
```

## AI 环境变量说明

- `AI_API_KEY`：后端读取的大模型 API key，只能放在服务端
- `AI_BASE_URL`：OpenAI 兼容接口地址，默认可填 `https://api.openai.com/v1`
- `AI_MODEL`：要调用的模型名称
- `PORT`：本地代理端口，默认 `8787`

前端不会保存或暴露 API key。只有在你手动点击“分析今天状态”时，才会通过本地代理调用模型。

## 构建与检查

```bash
npm run lint
npm run build
```

## GitHub Pages 部署

1. 将仓库推送到 GitHub。
2. 在仓库 `Settings -> Pages` 中选择 `GitHub Actions` 作为部署来源。
3. 保留仓库中的 `.github/workflows/deploy-pages.yml`。
4. 之后每次推送到默认分支，GitHub Actions 会自动构建并发布 `apps/web/dist`。

注意：

- 前端使用 `HashRouter`，适合 GitHub Pages。
- 构建使用相对资源路径，部署到子路径也能正常加载。
- GitHub Pages 只部署静态前端，不会部署 `apps/server`。
- 因此前端上线后若没有单独的 AI 代理，页面会显示 “AI 未启用/不可用”，但所有本地记录功能仍可正常使用。

## 如果想让 Pages 前端连接本地 AI 代理

1. 本地启动 `npm run dev:server`
2. 打开网站的“设置”页
3. 将 `AI 服务地址` 改为 `http://127.0.0.1:8787/api`

这样即使前端来自 GitHub Pages，仍可访问你的本地代理。

## 数据存储说明

- 日记、草稿、设置都保存在浏览器的 IndexedDB 中
- 导出 JSON 可用于备份和迁移
- 导入时会做基础清洗，尽量兼容旧字段和额外字段

## 后续可迭代方向

- 月报 / 周报生成
- Markdown 编辑体验
- 更多统计维度，例如天气与心情关联
- 附件或图片支持
- 导出 PDF
- 更细的 AI 缓存与分析历史
