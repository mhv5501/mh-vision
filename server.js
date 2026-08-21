import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const CLOUDINARY_CONFIG = {
  cloudName: 'ljjwa6sr',
  apiKey: '533336682954658',
  apiSecret: '7y4dEy4WDY_QVGwJ5sT4dSS-GYw'
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // API Proxy Route: /api/cloudinary/resources
  if (reqPath === '/api/cloudinary/resources') {
    const authHeader = 'Basic ' + Buffer.from(`${CLOUDINARY_CONFIG.apiKey}:${CLOUDINARY_CONFIG.apiSecret}`).toString('base64');
    const types = ['image', 'raw'];
    const results = [];
    let completed = 0;

    types.forEach(type => {
      const options = {
        hostname: 'api.cloudinary.com',
        path: `/v1_1/${CLOUDINARY_CONFIG.cloudName}/resources/${type}?max_results=500`,
        method: 'GET',
        headers: { 'Authorization': authHeader }
      };

      const cReq = https.request(options, (cRes) => {
        let body = '';
        cRes.on('data', chunk => body += chunk);
        cRes.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data && Array.isArray(data.resources)) {
              results.push(...data.resources);
            }
          } catch (e) {}
          completed++;
          if (completed === types.length) {
            res.writeHead(200, {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ resources: results }));
          }
        });
      });

      cReq.on('error', (err) => {
        completed++;
        if (completed === types.length) {
          res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ resources: results }));
        }
      });

      cReq.end();
    });

    return;
  }

  if (reqPath === '/') reqPath = '/index.html';

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`TEST PDF Platform server running:`);
  console.log(`- Local Access: http://localhost:${PORT}`);
  console.log(`- Mobile / Network Access: http://<your-laptop-ip>:${PORT}`);
});
