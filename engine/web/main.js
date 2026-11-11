import { renderFrame, renderer } from './engine.js';
import { buildAll } from './world.js';
import { setFrame, TOTAL } from './story.js';
window.__err = null;
try {
  buildAll();
  window.renderFrameAt = (f) => { setFrame(f); renderFrame(); };
  window.TOTAL = TOTAL;
  window.ready = true;
} catch (e) { window.__err = String(e && e.stack || e); }
