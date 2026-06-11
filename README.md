# MaynorAI Status

MaynorAI public uptime status powered by [Upptime](https://upptime.js.org).

## Live Status

Status website:

https://xianyu110.github.io/maynorai-status/

Repository:

https://github.com/xianyu110/maynorai-status

## Monitored Services

- MaynorAI 主站: https://maynorai.top/
- MaynorAI 体验首页: https://maynorai.top/list/#/home
- MaynorAI 购买兑换: https://maynorai.top/list/#/shop
- MaynorAPI Pro: https://apipro.maynor1024.live/
- Codex 中国站: https://codex.maynorai.top/
- 永不失联发布页: https://link3.cc/maynorai
- MaynorAI 博客资源: https://maynor1024.live/
- 图床上传服务: https://upload.maynor1024.live/

## How It Works

Upptime uses GitHub Actions to check each endpoint on a schedule, record response time history, open incidents as GitHub Issues, and publish a GitHub Pages status website.

Configuration lives in [.upptimerc.yml](./.upptimerc.yml).

## Custom Domain

Current GitHub Pages URL uses:

```yaml
status-website:
  baseUrl: /maynorai-status
```

To use `status.maynorai.top`, add the DNS record in the domain provider, then replace the `baseUrl` line with:

```yaml
status-website:
  cname: status.maynorai.top
```
