const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  const target = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  console.log('[setupProxy] Setting up proxy for /api/* to', target);

  // Proxy all /api requests to the backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      ws: false, // Disable websocket proxying
      onProxyReq: function(proxyReq, req, res) {
        console.log('[Proxy] Proxying', req.method, req.url, 'to', target + req.url);
      },
      onError: function(err, req, res) {
        console.error('[Proxy Error]', err.message);
        console.error('[Proxy Error] Request was:', req.method, req.url);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Proxy error: ' + err.message });
        }
      },
      onProxyRes: function(proxyRes, req, res) {
        console.log('[Proxy] Response', proxyRes.statusCode, 'for', req.url);
      }
    })
  );
};

