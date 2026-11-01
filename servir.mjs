// Servidor local opcional para LEYENDA (sin dependencias).
// Uso: node servir.mjs [puerto]   →   http://127.0.0.1:8124
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const port = Number(process.argv[2] || 8124);
const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = normalize(join(root, p));
    if (!file.startsWith(normalize(root))) { res.writeHead(403).end(); return; }
    const st = await stat(file);
    if (!st.isFile()) { res.writeHead(404).end('404'); return; }
    const body = await readFile(file);
    res.writeHead(200, {
      'content-type': tipos[extname(file).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store'
    });
    res.end(body);
  } catch {
    res.writeHead(404).end('404');
  }
}).listen(port, () => {
  console.log('LEYENDA · http://127.0.0.1:' + port);
});
