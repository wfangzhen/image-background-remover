# 图片背景移除工具 Web (Image Background Remover Web)

Next.js + Tailwind CSS 前端，用于调用 Cloudflare Worker API 移除图片背景。

## 技术栈

- **前端框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS 4
- **后端 API**: Cloudflare Worker
- **AI 服务**: Remove.bg API

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物在 `out/` 目录，可直接部署到 Cloudflare Pages。

## 环境变量

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_API_URL` | Cloudflare Worker API 地址 |
