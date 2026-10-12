import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('./fixtures/dashboard.html', import.meta.url));
const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1:44261');
  if (url.pathname !== '/dashboard.html') { response.writeHead(404); response.end('Not found'); return; }
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  response.end(html);
});
server.listen(44261, '127.0.0.1');
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
