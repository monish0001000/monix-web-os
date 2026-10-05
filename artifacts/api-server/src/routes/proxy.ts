import { Router, type Request, type Response } from "express";
import { fetchLiveGoogleResults, renderGoogleSearchHtml } from "./googleSearchService";

const proxyRouter = Router();

// Standard desktop browser User-Agent
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 MonixOS/2.0";

// Google Consent bypass cookie
const GOOGLE_CONSENT_COOKIE =
  "CONSENT=YES+cb.20210720-07-p0.en+FX+410; SOCS=CAESHAgBEhJnd3NfMjAyMzA4MTAtMF9SQzIaAmVuIAEaBgiAo_CmBg";

/**
 * Strips dangerous/blocking headers from remote site responses
 * so it can be rendered securely within the Web-OS iframe.
 */
function sanitizeResponseHeaders(res: Response, remoteHeaders: Headers) {
  const skipHeaders = new Set([
    "x-frame-options",
    "content-security-policy",
    "content-security-policy-report-only",
    "frame-options",
    "strict-transport-security",
    "content-encoding", // fetch decompresses automatically
    "content-length",
    "transfer-encoding",
  ]);

  remoteHeaders.forEach((val, key) => {
    const lower = key.toLowerCase();
    if (!skipHeaders.has(lower)) {
      try {
        res.setHeader(key, val);
      } catch {
        // Ignore invalid headers
      }
    }
  });

  // Ensure iframe embedding is completely permitted in Monix OS
  res.setHeader("X-Frame-Options", "ALLOWALL");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
}

/**
 * Injects <base href="...">, frame-busting neutralizers, and the Monix OS iframe navigation bridge
 */
function injectBrowserBridge(html: string, originalUrl: string): string {
  const urlObj = new URL(originalUrl);
  const baseUrl = urlObj.origin + urlObj.pathname;

  const bridgeScript = `
<!-- Monix Web-OS Browser Navigation Bridge -->
<base href="${baseUrl}">
<script>
(function() {
  // Neutralize common top-level frame-busting scripts
  try {
    Object.defineProperty(window, 'top', { get: function() { return window.self; } });
  } catch(e) {}

  function notifyParent() {
    try {
      window.parent.postMessage({
        type: 'monix-browser-title',
        title: document.title || '${urlObj.hostname}',
        url: '${originalUrl}'
      }, '*');
      window.parent.postMessage({
        type: 'monix-browser-ready',
        url: '${originalUrl}'
      }, '*');
    } catch(e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', notifyParent);
  } else {
    notifyParent();
  }
  window.addEventListener('load', notifyParent);

  // Capture all link clicks so internal navigation stays inside Monix Browser
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (a && a.href && !a.href.startsWith('javascript:') && !a.href.startsWith('#')) {
      var dest = a.href;

      // Handle Google redirect URLs: /url?q=https://... or /url?url=https://...
      try {
        var parsed = new URL(dest);
        if (parsed.pathname === '/url') {
          if (parsed.searchParams.has('q')) {
            dest = parsed.searchParams.get('q');
          } else if (parsed.searchParams.has('url')) {
            dest = parsed.searchParams.get('url');
          }
        }
      } catch(err) {}

      var isDownload = a.hasAttribute('download') ||
        /\.(pdf|zip|tar|gz|7z|rar|mp4|webm|mp3|wav|ogg|png|jpg|jpeg|gif|webp|svg|csv|json|txt|md|docx|xlsx|pptx|apk|exe|dmg|iso)(\?.*)?$/i.test(dest);

      if (isDownload) {
        e.preventDefault();
        e.stopPropagation();
        var fname = a.getAttribute('download') || '';
        if (!fname) {
          try {
            fname = new URL(dest).pathname.split('/').filter(Boolean).pop() || 'download';
          } catch(e) {
            fname = 'download';
          }
        }
        window.parent.postMessage({
          type: 'monix-browser-download',
          url: dest,
          filename: fname
        }, '*');
        return;
      }

      if (dest && (dest.startsWith('http://') || dest.startsWith('https://'))) {
        e.preventDefault();
        e.stopPropagation();
        window.parent.postMessage({
          type: 'monix-browser-navigate',
          url: dest
        }, '*');
        window.location.href = '/api/proxy?url=' + encodeURIComponent(dest);
      }
    }
  }, true);

  // Capture form submissions (e.g. Google search box, search forms) to route through Monix Proxy
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form) return;
    var action = form.getAttribute('action') || window.location.pathname;
    var formUrl = new URL(action, window.location.href);
    var method = (form.method || 'GET').toUpperCase();

    if (method === 'GET') {
      e.preventDefault();
      e.stopPropagation();
      var formData = new FormData(form);
      for (var pair of formData.entries()) {
        formUrl.searchParams.set(pair[0], pair[1]);
      }
      if (formUrl.hostname.includes('google.') && !formUrl.searchParams.has('igu')) {
        formUrl.searchParams.set('igu', '1');
      }
      var dest = formUrl.toString();
      window.parent.postMessage({
        type: 'monix-browser-navigate',
        url: dest
      }, '*');
      window.location.href = '/api/proxy?url=' + encodeURIComponent(dest);
    }
  }, true);
})();
</script>
`;

  // Inject right after <head> or at beginning of HTML
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/(<head[^>]*>)/i, `$1\n${bridgeScript}`);
  } else if (/<html[^>]*>/i.test(html)) {
    return html.replace(/(<html[^>]*>)/i, `$1\n<head>${bridgeScript}</head>`);
  }
  return `<head>${bridgeScript}</head>\n${html}`;
}

/**
 * Generate a friendly fallback error page if remote site is unreachable
 */
function generateErrorPage(targetUrl: string, errorMsg: string): string {
  let hostname = targetUrl;
  try {
    hostname = new URL(targetUrl).hostname;
  } catch {
    // fallback
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cannot Reach ${hostname} — Monix OS Browser</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0d0e12;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      max-width: 540px;
      width: 100%;
      background: #161821;
      border: 1px solid rgba(0, 240, 255, 0.2);
      border-radius: 14px;
      padding: 32px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.6);
      text-align: center;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 16px;
      color: #00f0ff;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
    }
    p {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
      margin-bottom: 20px;
      word-break: break-all;
    }
    .badge {
      display: inline-block;
      background: rgba(244, 63, 94, 0.15);
      color: #f43f5e;
      border: 1px solid rgba(244, 63, 94, 0.3);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-family: monospace;
      margin-bottom: 24px;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .btn {
      display: inline-block;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }
    .btn-primary {
      background: #00f0ff;
      color: #000;
      font-weight: 600;
    }
    .btn-primary:hover {
      background: #38bdf8;
      box-shadow: 0 0 15px rgba(0,240,255,0.4);
    }
    .btn-secondary {
      background: rgba(255,255,255,0.06);
      color: #cbd5e1;
      border: 1px solid rgba(255,255,255,0.12);
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,0.12);
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🌐</div>
    <h1>Site Unreachable in Web-OS Sandbox</h1>
    <p>Target: <strong>${targetUrl}</strong></p>
    <div class="badge">${errorMsg}</div>
    <div class="actions">
      <button class="btn btn-primary" onclick="window.open('${targetUrl}', '_blank')">
        Open in Real Host Browser ↗
      </button>
      <button class="btn btn-secondary" onclick="window.location.reload()">
        Retry Connection
      </button>
      <button class="btn btn-secondary" onclick="window.parent.postMessage({ type: 'monix-browser-navigate', url: 'chrome://newtab' }, '*')">
        Return to Home Page
      </button>
    </div>
  </div>
</body>
</html>`;
}

// ── GET /api/proxy?url=... ──────────────────────────────────────────────────
proxyRouter.get("/proxy", async (req: Request, res: Response): Promise<void> => {
  const targetUrl = req.query.url as string;

  if (!targetUrl) {
    res.status(400).send("Missing 'url' query parameter.");
    return;
  }

  // Handle internal special chrome schemes
  if (targetUrl.startsWith("chrome://") || targetUrl.startsWith("about:")) {
    res.status(400).send("Internal chrome URL should be rendered by the Web-OS client.");
    return;
  }

  // Validate and normalize URL
  let parsedUrl: URL;
  try {
    let urlToParse = targetUrl;
    if (!/^https?:\/\//i.test(urlToParse)) {
      urlToParse = `https://${urlToParse}`;
    }
    parsedUrl = new URL(urlToParse);
  } catch {
    res.status(400).send(generateErrorPage(targetUrl, "Invalid URL format"));
    return;
  }

  const isGoogle = parsedUrl.hostname.includes("google.");
  const isGoogleSearch =
    isGoogle &&
    (parsedUrl.pathname === "/search" ||
      parsedUrl.pathname.startsWith("/search") ||
      parsedUrl.searchParams.has("q"));

  // If this is a Google Search query, serve authentic live Google search results
  // completely bypassing Google's 429 bot block / captcha
  if (isGoogleSearch && parsedUrl.searchParams.has("q")) {
    const query = parsedUrl.searchParams.get("q") || "";
    if (query.trim()) {
      const page = Math.floor(parseInt(parsedUrl.searchParams.get("start") || "0", 10) / 10) + 1;
      try {
        const searchData = await fetchLiveGoogleResults(query.trim(), page);
        const searchHtml = renderGoogleSearchHtml(searchData, targetUrl);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("X-Frame-Options", "ALLOWALL");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
        res.send(searchHtml);
        return;
      } catch (searchErr) {
        console.error("[Proxy] Live search error, falling back to direct fetch:", searchErr);
      }
    }
  }

  // Build headers with Google consent bypass
  const reqHeaders: Record<string, string> = {
    "User-Agent": BROWSER_UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
  };

  if (isGoogle) {
    reqHeaders["Cookie"] = GOOGLE_CONSENT_COOKIE;
    // Ensure English language parameter
    if (!parsedUrl.searchParams.has("hl")) {
      parsedUrl.searchParams.set("hl", "en");
    }
    // igu=1 allows Google search and homepage to be embedded cleanly in Web-OS
    if (!parsedUrl.searchParams.has("igu")) {
      parsedUrl.searchParams.set("igu", "1");
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const remoteRes = await fetch(parsedUrl.toString(), {
      method: "GET",
      headers: reqHeaders,
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);

    // Sanitize headers to strip frame blockers
    sanitizeResponseHeaders(res, remoteRes.headers);
    res.status(remoteRes.status);

    const contentType = remoteRes.headers.get("content-type") || "";

    if (contentType.includes("text/html")) {
      const htmlText = await remoteRes.text();
      const injectedHtml = injectBrowserBridge(htmlText, remoteRes.url || parsedUrl.toString());
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(injectedHtml);
    } else {
      // Stream binary/media content directly
      const arrayBuffer = await remoteRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    }
  } catch (err: any) {
    const isAbort = err.name === "AbortError";
    const errorMsg = isAbort ? "Request timed out after 12 seconds" : (err?.message || "Failed to fetch remote page");
    res.status(502).setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(generateErrorPage(parsedUrl.toString(), errorMsg));
  }
});

// ── GET /api/search?q=... (JSON Search API for Monix Browser) ───────────────
proxyRouter.get("/search", async (req: Request, res: Response): Promise<void> => {
  const query = (req.query.q as string) || "";
  if (!query.trim()) {
    res.status(400).json({ error: "Missing search query parameter 'q'" });
    return;
  }
  const page = parseInt((req.query.page as string) || "1", 10);
  try {
    const searchData = await fetchLiveGoogleResults(query.trim(), page);
    res.setHeader("Cache-Control", "public, max-age=180, stale-while-revalidate=600");
    res.json(searchData);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Search failed" });
  }
});

// ── GET /api/proxy/search?q=... ─────────────────────────────────────────────
proxyRouter.get("/proxy/search", async (req: Request, res: Response): Promise<void> => {
  const query = req.query.q as string;
  if (!query) {
    res.redirect("/api/proxy?url=" + encodeURIComponent("https://www.google.com/?igu=1&hl=en"));
    return;
  }
  // Route seamlessly to Google Search with igu=1 and English locale
  const searchUrl = `https://www.google.com/search?igu=1&hl=en&q=${encodeURIComponent(query)}`;
  res.redirect(`/api/proxy?url=${encodeURIComponent(searchUrl)}`);
});

export default proxyRouter;
