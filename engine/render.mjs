// usage: node render.mjs <outdir> <frames: "0-100" | "5,40,90"> [quality]
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
const [,, outDir, spec, qArg] = process.argv;
const q = Number(qArg || 0.93);
fs.mkdirSync(outDir, { recursive: true });
let frames = [];
for (const part of spec.split(',')) { if (part.includes('-')) { const [a, b] = part.split('-').map(Number); for (let i = a; i <= b; i++) frames.push(i); } else frames.push(Number(part)); }
if (process.env.RESUME) frames = frames.filter(f => !fs.existsSync(`${outDir}/f${String(f).padStart(4, '0')}.jpg`));
const srv = spawn('python3', ['-m', 'http.server', process.env.PORT || '8123', '--bind', '127.0.0.1'], { cwd: new URL('./web', import.meta.url).pathname, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
const p = await b.newPage({ viewport: { width: 600, height: 1000 } });
p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text().slice(0, 300)); });
p.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 500)));
await p.goto('http://127.0.0.1:' + (process.env.PORT || '8123') + '/index.html');
await p.waitForFunction(() => window.ready || window.__err, null, { timeout: 120000 });
const err = await p.evaluate(() => window.__err); if (err) { console.log('INIT ERROR', err); await b.close(); srv.kill(); process.exit(1); }
const t0 = Date.now(); let n = 0;
for (const f of frames) {
  const d = await p.evaluate(([f, q]) => { window.renderFrameAt(f); return document.getElementById('c').toDataURL('image/jpeg', q); }, [f, q]);
  fs.writeFileSync(`${outDir}/f${String(f).padStart(4, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
  n++; if (n % 10 === 0 || n === frames.length) console.log(`frame ${f} done ${n}/${frames.length} avg ${((Date.now() - t0) / n / 1000).toFixed(2)}s`);
}
await b.close(); srv.kill();
