const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'dist');
const host = '127.0.0.1';
const port = 3001;

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const sendFile = (res, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': contentTypes[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  fs.createReadStream(filePath).pipe(res);
};

const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const normalizedPath = requestPath === '/' ? '/index.html' : requestPath;
  const candidatePath = path.normalize(path.join(root, normalizedPath));

  if (!candidatePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const tryPaths = [candidatePath];

  if (!path.extname(candidatePath)) {
    tryPaths.push(path.join(candidatePath, 'index.html'));
  }

  for (const filePath of tryPaths) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      sendFile(res, filePath);
      return;
    }
  }

  sendFile(res, path.join(root, 'index.html'));
});

server.listen(port, host, () => {
  console.log(`Local preview server running at http://${host}:${port}`);
});
