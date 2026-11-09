/**
 * Next.js server that also proxies Hub WebSocket upgrades.
 * Rewrites cover HTTP /api, but a remote page cannot open :8005 directly.
 */
const http = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.argv.includes("--dev");
process.env.NODE_ENV = dev ? "development" : "production";

const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

function backendOrigin() {
  if (process.env.HUB_BACKEND_URL) {
    return process.env.HUB_BACKEND_URL.replace(/\/$/, "");
  }
  if (process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL.replace(/\/api\/:path\*$/, "").replace(/\/$/, "");
  }
  return "http://127.0.0.1:8000";
}

function proxyUpgrade(req, socket, head) {
  let target;
  try {
    target = new URL(backendOrigin());
  } catch (err) {
    socket.destroy();
    return;
  }
  const headers = { ...req.headers, host: target.host };
  const proxyReq = http.request({
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port || (target.protocol === "https:" ? 443 : 80),
    path: req.url,
    method: "GET",
    headers,
  });

  const fail = () => {
    if (!socket.destroyed) {
      socket.write("HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\n\r\n");
      socket.destroy();
    }
  };

  proxyReq.on("upgrade", (proxyRes, proxySocket, proxyHead) => {
    const lines = [`HTTP/1.1 ${proxyRes.statusCode} ${proxyRes.statusMessage}`];
    for (const [key, value] of Object.entries(proxyRes.headers)) {
      if (Array.isArray(value)) {
        value.forEach((item) => lines.push(`${key}: ${item}`));
      } else if (value != null) {
        lines.push(`${key}: ${value}`);
      }
    }
    socket.write(`${lines.join("\r\n")}\r\n\r\n`);
    if (proxyHead && proxyHead.length) socket.write(proxyHead);
    if (head && head.length) proxySocket.write(head);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
    proxySocket.on("error", () => socket.destroy());
    socket.on("error", () => proxySocket.destroy());
  });
  proxyReq.on("error", fail);
  proxyReq.on("response", (res) => {
    if (!socket.destroyed) {
      socket.write(`HTTP/1.1 ${res.statusCode || 502} ${res.statusMessage || "Bad Gateway"}\r\nConnection: close\r\n\r\n`);
    }
    res.resume();
    socket.destroy();
  });
  proxyReq.end();
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  });

  server.on("upgrade", (req, socket, head) => {
    const path = (req.url || "/").split("?")[0];
    if (path.startsWith("/ws/") || path.startsWith("/api/v1/ws")) {
      proxyUpgrade(req, socket, head);
      return;
    }
    try {
      const upgrade = typeof app.getUpgradeHandler === "function" ? app.getUpgradeHandler() : null;
      Promise.resolve(upgrade)
        .then((handler) => {
          if (typeof handler === "function") handler(req, socket, head);
          else socket.destroy();
        })
        .catch(() => socket.destroy());
    } catch {
      socket.destroy();
    }
  });

  server.listen(port, hostname, () => {
    console.log(`> Hub frontend ${dev ? "dev" : "prod"} on http://${hostname}:${port}`);
    console.log(`> WebSocket proxy /ws/* -> ${backendOrigin()}`);
  });
});
