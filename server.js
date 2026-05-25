const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname);
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'reviews.json');
const defaultReviews = { bardhe: [], rose: [], trio: [], neuron: [] };

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultReviews, null, 2), 'utf8');
  }
}

function readReviews() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Object.assign({}, defaultReviews, data);
  } catch (err) {
    return Object.assign({}, defaultReviews);
  }
}

function writeReviews(data) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function sendNotFound(res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('Not found');
}

function getMimeType(filePath) {
  const type = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff'
  };
  return map[type] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/reviews') {
    if (req.method === 'OPTIONS') {
      return sendJson(res, 204, {});
    }
    if (req.method === 'GET') {
      return sendJson(res, 200, readReviews());
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const wine = String(payload.wine || '').toLowerCase();
          const stars = parseInt(payload.stars, 10);
          const reviews = readReviews();
          if (!reviews[wine] || ![1,2,3,4,5].includes(stars)) {
            return sendJson(res, 400, { error: 'Invalid wine or rating' });
          }
          reviews[wine].push({ stars });
          writeReviews(reviews);
          return sendJson(res, 200, reviews);
        } catch (err) {
          return sendJson(res, 400, { error: 'Invalid payload' });
        }
      });
      return;
    }
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  let filePath = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  if (filePath !== '/' && filePath.endsWith('/')) {
    filePath = filePath.slice(0, -1);
  }
  if (filePath.includes('..')) {
    return sendNotFound(res);
  }
  const fullPath = path.join(ROOT, filePath);
  fs.stat(fullPath, (err, stats) => {
    if (!err && stats.isFile()) {
      res.writeHead(200, { 'Content-Type': getMimeType(fullPath) });
      return fs.createReadStream(fullPath).pipe(res);
    }

    // If the user requested a route without .html, try the HTML file directly.
    if (!path.extname(fullPath)) {
      const htmlFallback = fullPath + '.html';
      return fs.stat(htmlFallback, (fallbackErr, fallbackStats) => {
        if (!fallbackErr && fallbackStats.isFile()) {
          res.writeHead(200, { 'Content-Type': getMimeType(htmlFallback) });
          return fs.createReadStream(htmlFallback).pipe(res);
        }
        return sendNotFound(res);
      });
    }

    return sendNotFound(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
