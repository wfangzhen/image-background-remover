# 图片背景移除工具 (Image Background Remover)

基于 Cloudflare Worker + Remove.bg API 的无服务器图片背景移除工具。

## 功能特性

- ✅ 拖拽/点击上传图片
- ✅ 调用 Remove.bg API 移除背景
- ✅ 原图/结果对比预览
- ✅ 一键下载透明 PNG
- ✅ 零存储（图片全程内存处理）
- ✅ 无服务器成本（Cloudflare Workers 免费额度）

## 项目结构

```
image-bg-remover/
├── index.html      # 前端页面
├── worker.js       # Cloudflare Worker
├── wrangler.toml   # 部署配置
└── README.md       # 本文件
```

## 部署步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 设置 API Key

```bash
# 设置 Remove.bg API Key（会加密存储）
wrangler secret put REMOVE_BG_API_KEY
# 输入你的 Remove.bg API Key
```

> 获取 Remove.bg API Key: https://www.remove.bg/api

### 4. 部署 Worker

```bash
cd image-bg-remover
wrangler deploy
```

部署成功后会返回 Worker URL，例如：
```
https://image-bg-remover.your-subdomain.workers.dev
```

### 5. 更新前端 API 地址

部署后，编辑 `index.html`，将 `API_URL` 改为你的 Worker 地址：

```javascript
const API_URL = 'https://image-bg-remover.your-subdomain.workers.dev';
```

然后部署到 Cloudflare Pages 或任何静态托管。

## 本地测试

### 测试 Worker（可选）

```bash
wrangler dev
```

### 测试前端

直接双击打开 `index.html` 即可（需修改 API_URL 指向你的本地 Worker）。

## Remove.bg API 额度

| 套餐 | 价格 | 说明 |
|------|------|------|
| 免费 | 50张/月 | 需注册获取 API Key |
| Pay-as-you-go | $0.012/张 | 按需付费 |

官网: https://www.remove.bg/api

## 成本

| 服务 | 费用 |
|------|------|
| Cloudflare Worker | 免费（每天 100,000 请求） |
| Cloudflare Pages | 免费（无限流量） |
| Remove.bg | 见上方套餐 |

## 注意事项

1. **API Key 安全**: Remove.bg API Key 仅存储在 Worker 环境变量中，不会暴露给前端
2. **文件大小限制**: 前端限制 10MB，建议进一步在 Worker 中限制
3. **CORS**: Worker 已配置允许跨域访问

## 后续可扩展功能

- [ ] 批量处理
- [ ] 用户登录/配额管理
- [ ] 历史记录
- [ ] 自部署 RMBG 模型（零 API 成本）
