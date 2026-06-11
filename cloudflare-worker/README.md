# momoAI Status GitHub API Proxy

这个 Worker 用来解决 Upptime 状态页的 GitHub API 匿名限流问题。

不要把 GitHub Personal Access Token 写进 `.upptimerc.yml`、HTML 或前端 JS。状态页是公开静态页面，前端内置 token 会被任何访问者看到。

## 部署

```bash
cd cloudflare-worker
npx wrangler login
npx wrangler secret put GITHUB_TOKEN
npx wrangler deploy
```

`GITHUB_TOKEN` 建议使用 fine-grained token，只授予 `xianyu110/maynorai-status` 这个公开仓库所需的只读权限。

部署完成后，把 Worker 地址填到根目录 `.upptimerc.yml`：

```yaml
status-website:
  apiBaseUrl: https://你的-worker域名
```

然后提交推送，等 Upptime 的 Setup CI 重新生成 GitHub Pages。

## 验证

```bash
curl -i "https://你的-worker域名/repos/xianyu110/maynorai-status/issues?state=open&labels=status"
```

如果响应头里出现 `X-Worker-Cache: MISS` 或 `X-Worker-Cache: HIT`，说明代理生效。
