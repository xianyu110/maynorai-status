const ALLOWED_ORIGINS = new Set([
  "https://status.maynorai.top",
  "http://localhost:3000",
  "http://localhost:4173",
]);

const GITHUB_API = "https://api.github.com";
const OWNER = "xianyu110";
const REPO = "maynorai-status";
const CACHE_TTL_SECONDS = 300;

function corsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://status.maynorai.top";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, Authorization, Content-Type, User-Agent",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function isAllowedPath(pathname) {
  return pathname === `/repos/${OWNER}/${REPO}/issues`
    || pathname.startsWith(`/repos/${OWNER}/${REPO}/issues/`)
    || pathname === `/repos/${OWNER}/${REPO}`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return jsonResponse({ message: "Method not allowed" }, 405, origin);
    }

    if (!isAllowedPath(url.pathname)) {
      return jsonResponse({ message: "Not found" }, 404, origin);
    }

    const upstreamUrl = new URL(`${GITHUB_API}${url.pathname}`);
    upstreamUrl.search = url.search;

    const cache = caches.default;
    const cacheKey = new Request(upstreamUrl.toString(), {
      method: request.method,
      headers: { Accept: request.headers.get("Accept") || "application/vnd.github.v3+json" },
    });

    const cached = await cache.match(cacheKey);
    if (cached) {
      const response = new Response(cached.body, cached);
      response.headers.set("X-Worker-Cache", "HIT");
      Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    const upstreamHeaders = {
      Accept: request.headers.get("Accept") || "application/vnd.github.v3+json",
      "User-Agent": "momoAI-status-worker",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (env.GITHUB_TOKEN) {
      upstreamHeaders.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: upstreamHeaders,
    });

    const response = new Response(upstreamResponse.body, upstreamResponse);
    response.headers.delete("Set-Cookie");
    response.headers.set("Cache-Control", `public, max-age=${CACHE_TTL_SECONDS}`);
    response.headers.set("X-Worker-Cache", "MISS");
    Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));

    if (upstreamResponse.ok) {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  },
};
