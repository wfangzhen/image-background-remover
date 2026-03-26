# 图片背景移除工具 (Image Background Remover)

基于 Next.js + Tailwind CSS + Vercel 的图片背景移除工具。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Next.js 15 (App Router) |
| 样式 | Tailwind CSS |
| API | Vercel Serverless Functions |
| AI 服务 | Remove.bg API |
| 部署 | Vercel |

## 开发

```bash
npm install
npm run dev
```

## 部署

推送到 GitHub 后，Vercel 会自动部署。

## 环境变量

| 变量 | 说明 |
|------|------|
| `REMOVE_BG_API_KEY` | Remove.bg API Key（需在 Vercel 后台设置）|
