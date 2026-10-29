(function () {
'use strict';
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rand = (a, b) => a + Math.random() * (b - a);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SEAT_COLORS = ['#ff5d8f', '#4fe3f0', '#ffd45c', '#9b7bff', '#5ff0a0', '#ff9a4a', '#ff7ad9', '#7fb6ff'];
const BOT_NAMES = ['coral', 'finn', 'nori', 'marlin', 'pebble', 'kelp', 'squid', 'tide'];
const BOT_SKILL = { 'bot-easy': 0.3, 'bot-normal': 0.6, 'bot-hard': 0.9 };
const MAX_HEARTS = 5, METER_FULL = 4;

/* ---------- storage ---------- */
const KEY = 'puffpass.v1';
function loadStore() {
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s === 'object') return Object.assign({ custom: [], overrides: {}, enabled: null, players: null, opts: null, muted: false }, s); } catch (e) {}
  return { custom: [], overrides: {}, enabled: null, players: null, opts: null, muted: false };
}
let store = loadStore();
function saveStore() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }

/* =================== SOUND (all synthesized) =================== */
const SFX = (() => {
  let ctx = null, master = null, noiseBuf = null;
  let muted = !!store.muted;
  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = muted ? 0 : 0.55; master.connect(ctx.destination);
      } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  }
  const ok = () => ctx && !muted;
  function tone(f, d, o = {}) {
    if (!ok()) return;
    const t = ctx.currentTime + (o.at || 0);
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
    const v = o.v ?? 0.12;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + (o.attack || 0.004));
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + d + 0.03);
  }
  function noise(d, o = {}) {
    if (!ok()) return;
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const ch = noiseBuf.getChannelData(0);
      for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    }
    const t = ctx.currentTime + (o.at || 0);
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const fl = ctx.createBiquadFilter(); fl.type = o.type || 'lowpass';
    fl.frequency.setValueAtTime(o.f || 2000, t);
    if (o.to) fl.frequency.exponentialRampToValueAtTime(o.to, t + d);
    fl.Q.value = o.q ?? 0.7;
    const g = ctx.createGain();
    g.gain.setValueAtTime(o.v ?? 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl); fl.connect(g); g.connect(master);
    s.start(t, Math.random() * 0.5); s.stop(t + d + 0.03);
  }
  const N = n => 440 * Math.pow(2, (n - 69) / 12);
  return {
    ensure,
    get muted() { return muted; },
    setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.55; },
    ui() { tone(N(84), 0.05, { v: 0.05 }); },
    key(quiet) { noise(0.025, { v: quiet ? 0.025 : 0.05, f: 3500, type: 'highpass' }); },
    blip(i) { tone(N([76, 79, 83][i % 3]), 0.035, { v: 0.045 }); },
    reveal() {
      noise(0.45, { v: 0.09, f: 500, to: 3200, type: 'bandpass', q: 1.4 });
      [72, 76, 79, 84].forEach((n, i) => tone(N(n), 0.1, { v: 0.08, at: 0.05 + i * 0.07 }));
    },
    count(go) { tone(N(go ? 84 : 72), go ? 0.4 : 0.14, { v: 0.12 }); if (go) tone(N(91), 0.4, { type: 'triangle', v: 0.08 }); },
    pass() { noise(0.2, { v: 0.07, f: 700, to: 2600, type: 'bandpass', q: 1.6 }); tone(N(64), 0.08, { type: 'triangle', v: 0.05, to: N(71) }); },
    yourTurn() { tone(N(81), 0.09, { type: 'triangle', v: 0.16 }); tone(N(88), 0.14, { type: 'triangle', v: 0.16, at: 0.09 }); },
    correct(tier) {
      const seqs = [[76, 83], [76, 83, 88], [76, 81, 85, 88, 93], [72, 76, 79, 84, 88, 91, 96]];
      seqs[tier].forEach((n, i) => tone(N(n), 0.09, { type: i % 2 ? 'triangle' : 'square', v: 0.1, at: i * 0.055 }));
      if (tier >= 2) { tone(N(100), 0.5, { type: 'sine', v: 0.05, at: seqs[tier].length * 0.055 }); noise(0.4, { v: 0.04, f: 6000, type: 'highpass', at: 0.1 }); }
    },
    wrong() { tone(160, 0.24, { type: 'sawtooth', v: 0.11, to: 80 }); tone(164, 0.24, { v: 0.05, to: 82 }); },
    used() { tone(N(60), 0.07, { v: 0.1 }); tone(N(60), 0.09, { v: 0.1, at: 0.1 }); },
    hmm() { tone(N(74), 0.1, { type: 'triangle', v: 0.13 }); tone(N(71), 0.18, { type: 'triangle', v: 0.13, at: 0.11 }); },
    tick(p) { tone(1100 + p * 1000, 0.028, { v: 0.045 + p * 0.03 }); },
    inflate(p) { tone(300 + p * 500, 0.06, { type: 'triangle', v: 0.03, to: 380 + p * 560 }); },
    pop() { noise(0.55, { v: 0.55, f: 5000, to: 140 }); tone(150, 0.5, { type: 'sine', v: 0.45, to: 32 }); tone(700, 0.09, { v: 0.12, to: 180 }); },
    heart() { [79, 84, 88, 91, 96].forEach((n, i) => tone(N(n), 0.09, { type: 'triangle', v: 0.13, at: i * 0.065 })); },
    out() { [67, 63, 60, 55].forEach((n, i) => tone(N(n), 0.22, { v: 0.08, at: 0.35 + i * 0.18 })); },
    win() { [72, 76, 79, 84].forEach((n, i) => tone(N(n), 0.15, { v: 0.1, at: i * 0.12 })); [84, 88, 91].forEach(n => tone(N(n), 0.9, { type: 'triangle', v: 0.07, at: 0.5 })); },
  };
})();
['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, () => SFX.ensure(), { capture: true }));
function speakerSVG(on) {
  return `<svg viewBox="0 0 8 8" aria-hidden="true"><path fill="currentColor" d="M0 3h2v2H0zM2 2h1v4H2zM3 1h1v6H3z"/>${on ? '<path fill="currentColor" d="M5 2h1v1H5zM6 3h1v2H6zM5 5h1v1H5z"/>' : '<path fill="currentColor" d="M5 2h1v1H5zM7 2h1v1H7zM6 3h1v2H6zM5 5h1v1H5zM7 5h1v1H7z"/>'}</svg>`;
}
function renderSfx() {
  ['sfxBtn', 'sfxBtn2'].forEach(id => { const b = $(id); b.innerHTML = speakerSVG(!SFX.muted) + (SFX.muted ? 'Sound off' : 'Sound on'); b.setAttribute('aria-pressed', !SFX.muted); });
}
['sfxBtn', 'sfxBtn2'].forEach(id => $(id).addEventListener('click', () => { SFX.ensure(); SFX.setMuted(!SFX.muted); store.muted = SFX.muted; saveStore(); renderSfx(); SFX.ui(); }));
renderSfx();

/* =================== PIXEL ART =================== */
function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function mix(a, b, t) { const A = hex2rgb(a), B = hex2rgb(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function mulberry(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const CRITTERS = {
  crab: [
    '.DD........DD.',
    'DMMD......DMMD',
    'DMLD......DLMD',
    '.DD..w..w..DD.',
    '..D..k..k..D..',
    '..DMMMMMMMMD..',
    '.DMMLLLLLLMMD.',
    'DMMMMMMMMMMMMD',
    'DMMMMrrrrMMMMD',
    '.DMMMMMMMMMMD.',
    'D.D.D....D.D.D',
  ],
  octo: [
    '...DDDDDD...',
    '..DMMMMMMD..',
    '.DMLLMMMMMD.',
    '.DMLMMMMMMD.',
    '.DMwkMMwkMD.',
    '.DMkkMMkkMD.',
    '.DMMMMMMMMD.',
    '..DMMrrMMD..',
    '.DMDMDMDMDM.',
    'DM.DM.DM.DMD',
    'D..D..D..D.D',
  ],
  jelly: [
    '....DDDD....',
    '..DDMMMMDD..',
    '.DMLLMMMMMD.',
    '.DMLMMMMMMD.',
    'DMMwkMMwkMMD',
    'DMMMMrrMMMMD',
    'DDDDDDDDDDDD',
    '.L.M.L.M.L..',
    '.L..M.L..M..',
    '..L.M..L.M..',
    '..L..M.L..M.',
    '...L.M..L...',
  ],
  fish: [
    '....DDDD......',
    '..DDMMwMDD..D.',
    '.DMMMMwMMMDDMD',
    'DMwkMMwMMMMMMD',
    'DMkkMMwMMMMMMD',
    '.DMMMMwMMMDDMD',
    '..DDMMwMDD..D.',
    '....DDDD......',
  ],
  ray: [
    '......DD......',
    '.....DMMD.....',
    '...DDMLLMDD...',
    '.DDMMMLLMMMDD.',
    'DMMMwkMMwkMMMD',
    '.DDMMMMrrMMDD.',
    '...DDMMMMDD...',
    '.....DMMD.....',
    '......DD......',
    '.......D......',
    '........D.....',
  ],
};
const CRITTER_KEYS = Object.keys(CRITTERS);
const spriteCache = new Map();
function gridToCanvas(grid, pal, pad = 0) {
  const w = Math.max(...grid.map(r => r.length)) + pad * 2, h = grid.length + pad * 2;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  grid.forEach((row, y) => [...row].forEach((ch, i) => { if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i + pad, y + pad, 1, 1); } }));
  return c;
}
function critterURL(type, color) {
  const k = type + color;
  if (spriteCache.has(k)) return spriteCache.get(k);
  const pal = { M: color, D: mix(color, '#0a0f24', 0.55), L: mix(color, '#ffffff', 0.45), w: '#ffffff', k: '#0b1020', r: mix(color, '#2a0712', 0.6) };
  const url = gridToCanvas(CRITTERS[type] || CRITTERS.crab, pal, 1).toDataURL();
  spriteCache.set(k, url);
  return url;
}
function pedestalURL(variant, seed) {
  const k = 'ped' + variant + '_' + seed;
  if (spriteCache.has(k)) return spriteCache.get(k);
  const W = 32, H = 18;
  const rng = mulberry(seed * 7919 + variant);
  const px = Array.from({ length: H }, () => new Array(W).fill(null));
  const base = '#283a60', hi = '#3d5486', lo = '#18223e', spec = '#5fe6f2';
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x - 15.5), dy = y;
    let inside = false, col = base;
    if (variant === 0) { // round rock
      const e = (dx * dx) / (15 * 15) + ((dy - 10) * (dy - 10)) / (7.5 * 7.5);
      inside = e <= 1 && y >= 3;
      if (inside) col = ((dx * dx) / (13 * 13) + ((dy - 7) * (dy - 7)) / (3.6 * 3.6) <= 1) ? hi : (y > 13 ? lo : base);
    } else if (variant === 1) { // brain coral
      const e = (dx * dx) / (14 * 14) + ((dy - 15) * (dy - 15)) / (12 * 12);
      inside = e <= 1 && y <= 16;
      if (inside) col = Math.sin(x * 1.25 + Math.sin(y * 0.9) * 2.3) > 0.55 ? hi : (y > 13 ? lo : base);
    } else if (variant === 2) { // barrel sponge
      const half = 9 + Math.sin(y / H * Math.PI) * 2.5;
      inside = Math.abs(dx) <= half && y >= 1 && y <= 16;
      if (inside) col = (y <= 2) ? lo : ((x % 4 === 1 && y % 3 === 1 && y > 3 && y < 15) ? '#0d1428' : (dx < -half + 3 ? hi : (y > 13 ? lo : base)));
    } else { // table coral
      const top = (dx * dx) / (15 * 15) + ((dy - 5) * (dy - 5)) / (3.4 * 3.4) <= 1;
      const stem = Math.abs(dx) <= 3 + (y > 13 ? 3 : 0) && y > 6 && y <= 16;
      inside = top || stem;
      if (inside) col = top ? (dy <= 4 ? hi : base) : (x % 2 ? lo : '#20305a');
    }
    if (inside) px[y][x] = col;
  }
  // speckles
  for (let i = 0; i < 9; i++) { const x = Math.floor(rng() * W), y = Math.floor(rng() * H); if (px[y][x] && px[y][x] !== '#0d1428') px[y][x] = spec; }
  const c = document.createElement('canvas'); c.width = W; c.height = H + 1;
  const g = c.getContext('2d');
  // shadow
  g.fillStyle = 'rgba(5,12,28,.55)';
  for (let x = 3; x < W - 3; x++) g.fillRect(x, H, 1, 1);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!px[y][x]) continue;
    const edge = !(px[y - 1]?.[x] && px[y + 1]?.[x] && px[y][x - 1] && px[y][x + 1]);
    g.fillStyle = edge ? '#0c1226' : px[y][x];
    g.fillRect(x, y, 1, 1);
  }
  const url = c.toDataURL();
  spriteCache.set(k, url);
  return url;
}
function heartSVG(on) {
  return `<svg viewBox="0 0 7 6" aria-hidden="true"><path fill="${on ? 'var(--pink)' : '#22385a'}" d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/>${on ? '<path fill="#ffc2d4" d="M1 1h1v1H1z"/>' : ''}</svg>`;
}

/* puffer, drawn each frame at low res; faces right */
function drawPuffer(cv, frac, t, panic) {
  const g = cv.getContext('2d');
  const W = cv.width, cx = 22, cy = 22;
  g.clearRect(0, 0, W, W);
  const r = 6 + Math.round(frac * 8);
  const bodyA = '#f4cf63', bodyB = '#ff5a4a';
  const heat = Math.max(0, (frac - 0.55) / 0.45);
  const body = mix(bodyA, bodyB, heat), dark = mix(body, '#3a1a08', 0.55), belly = mix(body, '#fff7dc', 0.55), spot = mix(body, '#5b3a0a', 0.35);
  const put = (x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); };
  // tail
  const tx = cx - r - 1;
  for (let i = 0; i < 4; i++) for (let j = -i - 1; j <= i + 1; j++) put(tx - i, cy + j, i === 3 || Math.abs(j) === i + 1 ? dark : body);
  // spikes
  if (r >= 9) {
    const n = 16;
    for (let k = 0; k < n; k++) {
      const a = k / n * Math.PI * 2 + 0.2;
      for (let s = 0; s <= (r >= 12 ? 3 : 2); s++) put(Math.round(cx + Math.cos(a) * (r + s)), Math.round(cy + Math.sin(a) * (r + s)), s ? dark : body);
    }
  }
  // body
  for (let y = -r - 1; y <= r + 1; y++) for (let x = -r - 1; x <= r + 1; x++) {
    const d = Math.sqrt(x * x * 0.92 + y * y);
    if (d > r + 0.5) continue;
    let c = body;
    if (y > r * 0.25) c = belly;
    else if (((x * 7 + y * 13) & 7) === 0 && d < r - 1.5) c = spot;
    if (d > r - 0.6) c = dark;
    put(cx + x, cy + y, c);
  }
  // fin
  const fy = cy + Math.round(r * 0.15), fx = cx - Math.round(r * 0.25);
  const flap = Math.sin(t / 90) > 0 ? 1 : 0;
  put(fx, fy, dark); put(fx - 1, fy + flap, dark); put(fx - 2, fy + 1, dark);
  // eye
  const ex = cx + Math.round(r * 0.45), ey = cy - Math.round(r * 0.32);
  for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) put(ex + x, ey + y, '#ffffff');
  if (r >= 10) { put(ex + 2, ey, '#ffffff'); put(ex, ey - 2, '#ffffff'); }
  put(ex + (panic ? 0 : 1), ey, '#0b1020');
  if (!panic) put(ex + 1, ey + 1, '#0b1020');
  // mouth
  put(cx + r, cy + 1, '#7a2a12'); put(cx + r + 1, cy + 1, '#7a2a12');
}
[$('brandFish'), $('heroFish')].forEach((c, i) => { drawPuffer(c, i ? 0.75 : 0.5, 0, false); });

/* =================== SEABED BACKGROUND =================== */
const sea = $('sea'), sg = sea.getContext('2d');
let SW = 0, SH = 0, seaBase = null, kelps = [], bubbles = [], horizon = 0;
function buildSea() {
  const scale = innerWidth < 700 ? 3 : 4;
  SW = Math.ceil(innerWidth / scale); SH = Math.ceil(innerHeight / scale);
  sea.width = SW; sea.height = SH;
  horizon = Math.round(SH * 0.36);
  seaBase = document.createElement('canvas'); seaBase.width = SW; seaBase.height = SH;
  const b = seaBase.getContext('2d');
  const rng = mulberry(42);
  // water column
  const gr = b.createLinearGradient(0, 0, 0, horizon);
  gr.addColorStop(0, '#0d3d6a'); gr.addColorStop(1, '#1d5d92');
  b.fillStyle = gr; b.fillRect(0, 0, SW, horizon + 4);
  // far reef silhouette
  b.fillStyle = '#184a7a';
  for (let x = 0; x < SW; x++) {
    const h = 6 + Math.sin(x * 0.07) * 4 + Math.sin(x * 0.19 + 1) * 3 + Math.sin(x * 0.031) * 5 + rng() * 1.5;
    b.fillRect(x, Math.round(horizon - h), 1, Math.round(h) + 2);
  }
  // floor with dither
  const fg = b.createLinearGradient(0, horizon, 0, SH);
  fg.addColorStop(0, '#2b6398'); fg.addColorStop(1, '#1b4a79');
  b.fillStyle = fg; b.fillRect(0, horizon, SW, SH - horizon);
  for (let y = horizon; y < SH; y++) for (let x = 0; x < SW; x++) {
    const r = rng();
    if (r < 0.07) { b.fillStyle = '#3a78b0'; b.fillRect(x, y, 1, 1); }
    else if (r < 0.14) { b.fillStyle = '#1f5285'; b.fillRect(x, y, 1, 1); }
    else if (r < 0.142) { b.fillStyle = '#5a94c6'; b.fillRect(x, y, 2, 1); }
  }
  // sand ripples
  b.fillStyle = 'rgba(80,140,200,.18)';
  for (let y = horizon + 6; y < SH; y += 7) for (let x = 0; x < SW; x++) if (Math.sin(x * 0.12 + y * 0.6) > 0.82) b.fillRect(x, y + Math.round(Math.sin(x * 0.05) * 2), 1, 1);
  // kelp & coral clumps along horizon
  kelps = [];
  const nk = Math.round(SW / 18);
  for (let i = 0; i < nk; i++) {
    const near = rng() > 0.6;
    kelps.push({ x: Math.round(rng() * SW), h: Math.round((near ? 18 : 10) + rng() * (near ? 26 : 14)), ph: rng() * 6.28, col: near ? '#205a8c' : '#1a4f80', base: horizon + Math.round(rng() * (near ? 6 : 2)) });
  }
  // clumps of rounded coral on far floor
  for (let i = 0; i < nk; i++) {
    const x0 = Math.round(rng() * SW), y0 = horizon + Math.round(rng() * 4), rr = 2 + Math.round(rng() * 4);
    b.fillStyle = '#1d5486';
    for (let y = -rr; y <= 0; y++) for (let x = -rr; x <= rr; x++) if (x * x + y * y <= rr * rr) b.fillRect(x0 + x, y0 + y, 1, 1);
  }
}
function drawSea(t) {
  if (!seaBase) return;
  sg.drawImage(seaBase, 0, 0);
  // light shafts
  sg.fillStyle = 'rgba(180,225,255,.045)';
  for (let i = 0; i < 4; i++) {
    const x = (i * 0.29 + 0.1) * SW + Math.sin(t / 4000 + i * 1.7) * SW * 0.04;
    const w = SW * (0.05 + i * 0.012);
    sg.beginPath(); sg.moveTo(x, 0); sg.lineTo(x + w, 0); sg.lineTo(x + w * 2.4 + SW * 0.08, SH * 0.75); sg.lineTo(x + SW * 0.06, SH * 0.75); sg.closePath(); sg.fill();
  }
  // kelp
  kelps.forEach(k => {
    sg.fillStyle = k.col;
    for (let s = 0; s < k.h; s++) {
      const sway = Math.round(Math.sin(t / 900 + k.ph + s * 0.18) * (s / k.h) * 3);
      const x = k.x + sway, y = k.base - s;
      sg.fillRect(x, y, 1, 1);
      if (s % 4 === 2 && s < k.h - 1) { sg.fillRect(x - 2, y, 2, 1); sg.fillRect(x - 3, y - 1, 1, 1); }
      if (s % 4 === 0 && s > 2) { sg.fillRect(x + 1, y, 2, 1); sg.fillRect(x + 3, y - 1, 1, 1); }
    }
  });
  // bubbles
  if (Math.random() < 0.05 && bubbles.length < 24) bubbles.push({ x: Math.random() * SW, y: SH + 2, v: rand(0.15, 0.35), w: rand(0, 6.28), s: Math.random() < 0.2 ? 2 : 1 });
  sg.fillStyle = 'rgba(200,235,255,.55)';
  bubbles = bubbles.filter(b => {
    b.y -= b.v; b.w += 0.04;
    const x = Math.round(b.x + Math.sin(b.w) * 1.5), y = Math.round(b.y);
    if (b.s === 2) { sg.fillRect(x, y - 1, 2, 1); sg.fillRect(x - 1, y, 1, 2); sg.fillRect(x + 2, y, 1, 2); sg.fillRect(x, y + 2, 2, 1); }
    else sg.fillRect(x, y, 1, 1);
    return b.y > -4;
  });
}
buildSea();
addEventListener('resize', () => { buildSea(); drawSea(performance.now()); if (G && !$('game').hidden) layoutSeats(); });
let seaLast = 0;
function seaLoop(t) {
  if (t - seaLast > 80) { drawSea(t); seaLast = t; }
  if (!REDUCED) requestAnimationFrame(seaLoop);
}
requestAnimationFrame(seaLoop);

/* =================== CATEGORIES =================== */
let catCache = new Map();
function allDefs() {
  const out = BUILTIN.map(b => ({ ...b, ...(store.overrides[b.id] || {}), builtin: true, edited: !!store.overrides[b.id] }));
  store.custom.forEach(c => out.push({ ...c, builtin: false, edited: false }));
  return out;
}
function getCat(id) {
  if (catCache.has(id)) return catCache.get(id);
  const def = allDefs().find(d => d.id === id);
  if (!def) return null;
  const c = loadCategory(def);
  catCache.set(id, c);
  return c;
}
function invalidate() { catCache = new Map(); }

let toastT;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2300); }

/* =================== VIEWS =================== */
let G = null;
let genCounter = 0;
function showView(v) {
  $('tabPlay').setAttribute('aria-selected', v !== 'bank');
  $('tabBank').setAttribute('aria-selected', v === 'bank');
  $('tabPlay').textContent = NET.code ? 'Room ' + NET.code : 'Lobby';
  $('site').hidden = v === 'game';
  $('setup').hidden = v !== 'setup';
  $('roomView').hidden = v !== 'room';
  $('bank').hidden = v !== 'bank';
  $('game').hidden = v !== 'game';
  if (v !== 'game' && G && G.phase !== 'over' && !NET.role) endGame(true);
  if (v === 'setup') renderSetup();
  if (v === 'room') renderRoomView();
  if (v === 'bank') renderBank();
  scrollTo(0, 0);
}
$('tabPlay').onclick = () => { SFX.ui(); showView(NET.code ? 'room' : 'setup'); };
$('tabBank').onclick = () => { SFX.ui(); showView('bank'); };

/* text that goes over the network: strip control and invisible characters, cap length */
function clean(s, max) {
  return String(s ?? '').replace(/[\u0000-\u001f\u007f-\u009f\u00ad\u061c\u180e\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufe00-\ufe0f\ufeff\ue000-\uf8ff]/g, '').trim().slice(0, max);
}

/* =================== LOBBY =================== */
let setupPlayers = store.players || [
  { name: 'you', type: 'human', critter: 'crab' },
  { name: 'coral', type: 'bot-normal', critter: 'octo' },
  { name: 'finn', type: 'bot-easy', critter: 'fish' },
  { name: 'nori', type: 'bot-hard', critter: 'jelly' },
];
setupPlayers.forEach((p, i) => { if (!CRITTERS[p.critter]) p.critter = CRITTER_KEYS[i % CRITTER_KEYS.length]; });
function persistSetup() {
  store.players = setupPlayers;
  store.opts = { fuse: $('optFuse').value, hearts: $('optHearts').value, show: $('optShow').checked };
  saveStore();
}
function syncOptControls() {
  $('rvFuse').value = $('optFuse').value;
  $('rvHearts').value = $('optHearts').value;
}
if (store.opts) { $('optFuse').value = store.opts.fuse; $('optHearts').value = store.opts.hearts; $('optShow').checked = store.opts.show !== false; }
syncOptControls();
['optFuse', 'optHearts', 'optShow'].forEach(id => $(id).addEventListener('change', () => { SFX.ui(); persistSetup(); syncOptControls(); }));
$('rvFuse').addEventListener('change', () => { $('optFuse').value = $('rvFuse').value; SFX.ui(); persistSetup(); hostPublish(); });
$('rvHearts').addEventListener('change', () => { $('optHearts').value = $('rvHearts').value; SFX.ui(); persistSetup(); hostPublish(); });

function renderChips(box, after) {
  const defs = allDefs();
  if (!store.enabled) store.enabled = defs.map(d => d.id);
  box.innerHTML = '';
  defs.forEach(d => {
    const c = getCat(d.id);
    const b = document.createElement('button');
    b.className = 'chip';
    b.setAttribute('aria-pressed', store.enabled.includes(d.id));
    b.innerHTML = `${esc(d.name)} <span class="n">${c.answers.length}</span>`;
    b.onclick = () => {
      const on = store.enabled.includes(d.id);
      store.enabled = on ? store.enabled.filter(x => x !== d.id) : [...store.enabled, d.id];
      b.setAttribute('aria-pressed', !on); SFX.blip(on ? 0 : 2); saveStore();
      if (after) after();
    };
    box.appendChild(b);
  });
}

function renderSetup() {
  const rows = $('playerRows');
  rows.innerHTML = '';
  setupPlayers.forEach((p, i) => {
    const r = document.createElement('div');
    r.className = 'prow';
    r.innerHTML = `<button class="critter" aria-label="Change critter for player ${i + 1}"><img alt="" src="${critterURL(p.critter, SEAT_COLORS[i % 8])}"></button>
      <input type="text" id="pName${i}" value="${esc(p.name)}" maxlength="14" aria-label="Player ${i + 1} name">
      <select id="pType${i}" aria-label="Player ${i + 1} type">
        <option value="human">Human</option><option value="bot-easy">Bot · easy</option><option value="bot-normal">Bot · normal</option><option value="bot-hard">Bot · hard</option>
      </select>
      <button class="pbtn small rm" aria-label="Remove player ${i + 1}" ${setupPlayers.length <= 1 ? 'disabled' : ''}>X</button>`;
    rows.appendChild(r);
    r.querySelector('select').value = p.type;
    r.querySelector('.critter').onclick = () => {
      p.critter = CRITTER_KEYS[(CRITTER_KEYS.indexOf(p.critter) + 1) % CRITTER_KEYS.length];
      r.querySelector('.critter img').src = critterURL(p.critter, SEAT_COLORS[i % 8]);
      SFX.blip(CRITTER_KEYS.indexOf(p.critter)); persistSetup();
    };
    r.querySelector('input').oninput = e => { p.name = e.target.value; persistSetup(); };
    r.querySelector('select').onchange = e => { p.type = e.target.value; SFX.ui(); persistSetup(); hint(); };
    r.querySelector('.rm').onclick = () => { SFX.ui(); setupPlayers.splice(i, 1); persistSetup(); renderSetup(); };
  });
  $('addPlayer').disabled = setupPlayers.length >= 8;
  renderChips($('catChips'), hint);
  hint();
  renderOnline();
}
function enabledIds() { const all = allDefs().map(d => d.id); return (store.enabled || all).filter(id => all.includes(id) && getCat(id) && getCat(id).answers.length > 0); }
function hint() {
  const ids = enabledIds();
  const humans = setupPlayers.filter(p => p.type === 'human').length;
  $('startHint').textContent = !ids.length ? 'Pick at least one category.' : setupPlayers.length === 1 ? 'Solo run: survive as long as you can.' : !humans ? 'All bots. Sit back and watch.' : '';
  $('startBtn').disabled = !ids.length;
}
$('addPlayer').onclick = () => {
  if (setupPlayers.length >= 8) return;
  const used = new Set(setupPlayers.map(p => p.name));
  const name = BOT_NAMES.find(n => !used.has(n)) || 'bot' + (setupPlayers.length + 1);
  setupPlayers.push({ name, type: 'bot-normal', critter: CRITTER_KEYS[setupPlayers.length % CRITTER_KEYS.length] });
  SFX.ui(); persistSetup(); renderSetup();
};
$('startBtn').onclick = () => { SFX.ensure(); startGame(); };

/* =================== ONLINE =================== */
/* The host's browser runs the game. Everyone in a room publishes "presence":
   the host publishes the whole game state; players publish their name, critter,
   what they're typing and their latest submitted answer. */
const NET = {
  lobby: null, nr: null, role: null, code: null, pub: false, offline: false, connected: false, checking: true,
  hostPeer: null, lastSt: null, bots: [], order: [], seen: {}, drops: {}, ansSeq: 0, gameNo: 0,
  lastOpen: '', joinTimer: 0, hostGone: 0, busy: false,
};
const isHost = () => NET.role === 'host';
const isClient = () => NET.role === 'client';
const onlineProfile = Object.assign({ name: '', critter: 'crab' }, store.online || {});
if (!CRITTERS[onlineProfile.critter]) onlineProfile.critter = 'crab';
function saveOnline() { store.online = onlineProfile; saveStore(); }
function myPeer() {
  if (!NET.nr) return null;
  const me = NET.nr.peers().find(p => p.sameTab);
  return me ? me.peer : null;
}
function roomCode() { const L = 'BCDFGHJKLMNPQRSTVWXZ'; return Array.from({ length: 4 }, () => L[Math.floor(Math.random() * L.length)]).join(''); }
function roomName(code) { return 'pp-' + code.toLowerCase(); }
function joinErr(e) {
  const c = e && e.code;
  if (c === 'not_permitted') return 'Online rooms aren\'t available to you on this page.';
  if (c === 'limit_reached') return 'Too many rooms open right now. Try again in a moment.';
  if (window.PP_STANDALONE) return 'Couldn\'t connect. Check your internet, or try another network (some school and office Wi-Fi blocks games like this).';
  return 'Couldn\'t reach the room. Check your connection and try again.';
}

async function netInit() {
  let room = null;
  try { room = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('room') : null; } catch (e) { room = null; }
  NET.checking = false;
  if (!room) { NET.offline = true; renderOnline(); return; }
  NET.lobby = room;
  room.onPeers(() => renderRoomList(), () => { NET.offline = true; renderOnline(); });
  room.onConnection(c => { NET.connected = c; renderOnline(); }, () => {});
  renderOnline();
  inviteFromUrl();
}
function inviteFromUrl() {
  let code = '';
  try { code = (new URLSearchParams(location.search).get('room') || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); } catch (e) {}
  if (code.length !== 4) return;
  $('joinCode').value = code;
  if (clean(onlineProfile.name, 14)) { toast(`Joining room ${code}…`); joinRoom(code); }
  else { $('onlineCard').scrollIntoView({ block: 'center' }); $('onName').focus(); toast(`Enter your name, then press Join to enter room ${code}.`); }
}

/* ---- lobby panel ---- */
function renderOnline() {
  const card = $('onlineCard');
  if (!card) return;
  const ok = !!NET.lobby && !NET.offline;
  $('onCrit').querySelector('img').src = critterURL(onlineProfile.critter, SEAT_COLORS[0]);
  if (document.activeElement !== $('onName')) $('onName').value = onlineProfile.name;
  ['hostPub', 'hostPriv', 'quickPlay', 'joinBtn', 'joinCode', 'onName', 'onCrit'].forEach(id => { $(id).disabled = !ok || NET.busy; });
  $('netDot').className = 'netdot ' + (ok ? (NET.connected ? 'on' : 'wait') : 'off');
  $('netState').textContent = NET.checking ? 'connecting…' : !ok ? 'offline' : NET.connected ? 'connected' : 'connecting…';
  $('onlineHelp').hidden = ok;
  if (window.PP_STANDALONE) {
    $('hostPub').hidden = true; $('quickPlay').hidden = true; $('publicCol').hidden = true; $('browsing').hidden = true;
    $('hostPriv').textContent = 'Host a room';
    $('hostPriv').classList.add('hot');
    $('netState').textContent = ok ? 'ready' : 'unavailable';
    $('onlineHelp').textContent = 'Online play couldn\'t load. Check your internet connection and reload the page.';
  }
  $('onlineBody').classList.toggle('dimmed', !ok);
  renderRoomList();
}
function openRooms() {
  if (!NET.lobby) return [];
  return NET.lobby.peers()
    .filter(p => !p.sameTab && p.presence && p.presence.open && typeof p.presence.open === 'object')
    .map(p => {
      const o = p.presence.open;
      return { code: clean(o.code, 4).toUpperCase(), host: clean(o.host, 14) || 'someone', n: Math.max(0, Math.min(8, +o.n || 0)), ph: o.ph === 'playing' ? 'playing' : 'lobby' };
    })
    .filter(r => /^[A-Z]{4}$/.test(r.code));
}
function renderRoomList() {
  const box = $('roomList');
  if (!box) return;
  if (!NET.lobby || NET.offline) { box.innerHTML = ''; return; }
  const rooms = openRooms();
  const browsing = Math.max(0, NET.lobby.peers().length - 1);
  $('browsing').textContent = browsing ? `${browsing} other ${browsing === 1 ? 'diver' : 'divers'} here` : '';
  if (!rooms.length) { box.innerHTML = '<div class="empty">No public rooms right now. Host one, or share a private code with friends.</div>'; return; }
  box.innerHTML = '';
  rooms.forEach(r => {
    const row = document.createElement('div');
    row.className = 'rrow';
    row.innerHTML = `<span class="rcode">${esc(r.code)}</span><span class="rhost">${esc(r.host)}'s room</span><span class="rn">${r.n}/8</span><span class="rph ${r.ph}">${r.ph === 'lobby' ? 'waiting' : 'in game'}</span>`;
    const b = document.createElement('button');
    b.className = 'pbtn small';
    b.textContent = r.ph === 'lobby' ? 'Join' : 'Watch';
    b.disabled = NET.busy;
    b.onclick = () => joinRoom(r.code);
    row.appendChild(b);
    box.appendChild(row);
  });
}
$('onName').addEventListener('input', e => { onlineProfile.name = e.target.value; saveOnline(); });
$('onCrit').onclick = () => {
  onlineProfile.critter = CRITTER_KEYS[(CRITTER_KEYS.indexOf(onlineProfile.critter) + 1) % CRITTER_KEYS.length];
  SFX.blip(CRITTER_KEYS.indexOf(onlineProfile.critter)); saveOnline(); renderOnline();
};
function needName() {
  onlineProfile.name = clean($('onName').value, 14);
  if (!onlineProfile.name) { SFX.wrong(); toast('Pick a name first.'); $('onName').focus(); return true; }
  saveOnline();
  return false;
}
$('hostPub').onclick = () => { SFX.ensure(); if (!needName()) hostRoom(true); };
$('hostPriv').onclick = () => { SFX.ensure(); if (!needName()) hostRoom(false); };
$('quickPlay').onclick = () => {
  SFX.ensure();
  if (needName()) return;
  const r = openRooms().find(x => x.ph === 'lobby' && x.n < 8);
  if (r) joinRoom(r.code); else hostRoom(true);
};
$('joinForm').addEventListener('submit', e => {
  e.preventDefault(); SFX.ensure();
  if (needName()) return;
  joinRoom($('joinCode').value);
});
$('joinCode').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); });

/* ---- hosting ---- */
async function hostRoom(pub) {
  if (!NET.lobby || NET.code || NET.busy) return;
  NET.busy = true; renderOnline();
  let code = roomCode();
  if (openRooms().some(r => r.code === code)) code = roomCode();
  let nr;
  try { nr = await NET.lobby.join(roomName(code), ...(window.PP_STANDALONE ? [{ as: 'host' }] : [])); }
  catch (e) {
    NET.busy = false; renderOnline();
    if (e && e.code === 'taken' && (NET.retries = (NET.retries || 0) + 1) < 4) return hostRoom(pub);
    NET.retries = 0; SFX.wrong(); toast(joinErr(e)); return;
  }
  NET.retries = 0;
  if (typeof nr.hub === 'function' && !nr.hub()) {
    nr.leave().catch(() => {}); NET.busy = false; renderOnline(); return hostRoom(pub);
  }
  NET.busy = false;
  Object.assign(NET, { nr, role: 'host', code, pub, hostPeer: null, lastSt: null, bots: [], order: [], seen: {}, drops: {}, lastOpen: '' });
  G = null;
  nr.onPeers(hostOnPeers, e => netLost(e));
  SFX.correct(1);
  hostPublish();
  showView('room');
}
function hostRoster() {
  const live = new Map();
  if (NET.nr) NET.nr.peers().forEach(p => {
    if (!p.sameTab && p.kind === 'viewer' && p.presence && p.presence.role === 'player') live.set(p.peer, p);
  });
  live.forEach((p, id) => { if (!NET.order.includes(id)) NET.order.push(id); });
  NET.order = NET.order.filter(id => live.has(id));
  const list = [{ id: 'host', name: clean(onlineProfile.name, 14) || 'host', critter: onlineProfile.critter, kind: 'host' }];
  NET.order.forEach(id => {
    const pr = live.get(id).presence;
    list.push({ id, name: clean(pr.name, 14) || 'diver', critter: CRITTERS[pr.cr] ? pr.cr : 'crab', kind: 'remote', guest: live.get(id).guest });
  });
  NET.bots.forEach(b => list.push({ ...b, kind: 'bot' }));
  return { seated: list.slice(0, 8), waiting: Math.max(0, list.length - 8) };
}
function stateSize(o) { try { return new TextEncoder().encode(JSON.stringify(o)).length; } catch (e) { return 9999; } }
function buildState() {
  const base = { v: 1, code: NET.code, fz: +$('optFuse').value, hs: +$('optHearts').value };
  if (!G) {
    const { seated, waiting } = hostRoster();
    return {
      ...base, ph: 'lobby', g: NET.gameNo, wt: waiting,
      pl: seated.map(p => ({ id: p.id, n: clean(p.name, 14), c: p.critter, t: p.kind === 'bot' ? 'b' : p.kind === 'host' ? 'o' : 'r', d: p.type || '' })),
      cats: enabledIds().map(id => clean(getCat(id).name, 28)).slice(0, 24),
    };
  }
  return {
    ...base, ph: G.phase, g: G.gameNo,
    pl: G.players.map(p => ({ id: p.id, n: clean(p.name, 14), c: p.critter, t: p.type.startsWith('bot') ? 'b' : p.me ? 'o' : 'r', h: p.hearts, m: p.meter, a: p.alive ? 1 : 0, o: p.outOrder, gv: p.given, b: p.best ? [clean(p.best.name, 40), p.best.tier] : 0 })),
    tn: G.turn, tid: G.turnId, fm: Math.round(G.fuseMs), cn: G.catNo, cnm: clean(G.catName, 40), cp: clean(G.prompt, 220), no: clean(G.note, 200),
    ct: G.ct || 0, cu: G.said.length, an: G.an.slice(-8), pop: G.popEv || 0, fb: G.fb || 0, ty: G.ty || 0,
  };
}
function hostPublish() {
  if (!isHost() || !NET.nr) return;
  const st = buildState();
  if (stateSize(st) > 3600 && st.an) st.an = st.an.slice(-3);
  if (stateSize(st) > 3600) st.no = '';
  if (stateSize(st) > 3600 && st.cats) st.cats = st.cats.slice(0, 8);
  if (stateSize(st) > 3600) st.cp = st.cp.slice(0, 120);
  NET.nr.presence({ role: 'host', name: clean(onlineProfile.name, 14), cr: onlineProfile.critter, st }).catch(() => {});
  if (NET.pub && NET.lobby) {
    const open = { code: NET.code, host: clean(onlineProfile.name, 14), n: st.pl.length, ph: st.ph === 'lobby' ? 'lobby' : 'playing' };
    const key = JSON.stringify(open);
    if (key !== NET.lastOpen) { NET.lastOpen = key; NET.lobby.presence({ open }).catch(() => {}); }
  }
}
function hostOnPeers(ch) {
  const inGame = G && !G.remote && G.phase !== 'over';
  if (!inGame && (ch.joined.length || ch.left.length || ch.updated.length)) {
    hostPublish();
    if (!$('roomView').hidden) renderRoomView();
    ch.joined.forEach(p => { if (!p.sameTab && p.presence && p.presence.role === 'player') SFX.blip(1); });
  }
  ch.joined.forEach(p => { if (NET.drops[p.peer]) { clearTimeout(NET.drops[p.peer]); delete NET.drops[p.peer]; } });
  if (inGame) ch.left.forEach(p => {
    const pi = G.players.findIndex(q => q.id === p.peer);
    if (pi >= 0 && G.players[pi].alive && !NET.drops[p.peer]) NET.drops[p.peer] = setTimeout(() => dropPlayer(p.peer), 6000);
  });
  [...ch.joined, ...ch.updated].forEach(p => {
    if (p.sameTab || !G || G.remote) return;
    const pr = p.presence || {};
    const pi = G.players.findIndex(q => q.id === p.peer);
    if (pi < 0) return;
    if (Array.isArray(pr.ans) && +pr.ans[0] > (NET.seen[p.peer] || 0)) {
      NET.seen[p.peer] = +pr.ans[0];
      hostAnswer(pi, p.peer, pr.ans);
    }
    remoteTyping(pi, pr.ty);
  });
}
function remoteTyping(pi, ty) {
  if (!G || G.phase !== 'turn' || G.turn !== pi || !Array.isArray(ty) || ty[0] !== G.turnId) return;
  const t = clean(ty[1], 40);
  if (t) say(pi, esc(t), 'typing'); else clearSay(pi);
}
function hostAnswer(pi, peer, ans) {
  if (!G || G.phase !== 'turn' || G.turn !== pi || ans[1] !== G.turnId) return;
  const typed = clean(ans[2], 60);
  if (!typed) return;
  const res = matchAnswer(typed, G.cat, new Set(G.used.keys()));
  if (res.status === 'ok') { accept(pi, res.id, typed, res); return; }
  const [kind, msg] = feedbackFor(res, typed);
  G.fb = [peer, +ans[0], kind, clean(msg, 140)];
  hostPublish();
}
function dropPlayer(peer) {
  delete NET.drops[peer];
  if (!G || G.remote || G.phase === 'over') return;
  const pi = G.players.findIndex(q => q.id === peer);
  if (pi < 0 || !G.players[pi].alive) return;
  const p = G.players[pi];
  p.alive = false; p.hearts = 0; p.outOrder = ++G.outCount;
  logLine(`<span style="color:${p.color}">${esc(p.name)}</span> <span class="dim">left the room</span>`);
  toast(`${p.name} left the room`);
  renderSeats(); updateHud();
  if (isOver()) { showResults(); return; }
  if (G.turn === pi && G.phase === 'turn') { G.turn = nextAlive(pi); beginTurn(); }
  else hostPublish();
}
$('rvAddBot').onclick = () => {
  if (!isHost()) return;
  const { seated } = hostRoster();
  if (seated.length >= 8) return;
  const used = new Set(seated.map(p => p.name));
  const name = BOT_NAMES.find(n => !used.has(n)) || 'bot' + (NET.bots.length + 1);
  NET.bots.push({ id: 'bot' + Date.now().toString(36), name, type: 'bot-normal', critter: CRITTER_KEYS[(seated.length + 1) % CRITTER_KEYS.length] });
  SFX.ui(); hostPublish(); renderRoomView();
};
$('rvStart').onclick = () => { SFX.ensure(); startGame(); };

/* ---- joining ---- */
async function joinRoom(raw) {
  const code = String(raw || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (code.length !== 4) { SFX.wrong(); toast('Room codes are 4 letters.'); return; }
  if (!NET.lobby || NET.code || NET.busy) return;
  NET.busy = true; renderOnline();
  let nr;
  if (window.PP_STANDALONE) toast(`Looking for room ${code}…`);
  try { nr = await NET.lobby.join(roomName(code), ...(window.PP_STANDALONE ? [{ as: 'guest' }] : [])); }
  catch (e) { NET.busy = false; renderOnline(); SFX.wrong(); toast(e && e.code === 'no_room' ? `No room found with code ${code}. Check the code with your host.` : joinErr(e)); return; }
  if (typeof nr.hub === 'function' && nr.hub()) {
    nr.leave().catch(() => {}); NET.busy = false; renderOnline(); SFX.wrong(); toast(`No room found with code ${code}.`); return;
  }
  NET.busy = false;
  Object.assign(NET, { nr, role: 'client', code, pub: false, hostPeer: null, lastSt: null, ansSeq: 0 });
  G = null;
  nr.presence({ role: 'player', name: clean(onlineProfile.name, 14) || 'diver', cr: onlineProfile.critter }).catch(() => {});
  nr.onPeers(clientOnPeers, e => netLost(e));
  showView('room');
  clearTimeout(NET.joinTimer);
  NET.joinTimer = setTimeout(() => {
    if (NET.code === code && !NET.hostPeer) { leaveRoom(); SFX.wrong(); toast(`No room found with code ${code}.`); }
  }, 7000);
}
function clientOnPeers(ch) {
  if (!isClient()) return;
  let host = NET.hostPeer ? ch.peers.find(p => p.peer === NET.hostPeer) : null;
  if (!NET.hostPeer) {
    host = ch.peers.find(p => !p.sameTab && p.presence && p.presence.role === 'host' && p.presence.st && p.presence.st.code === NET.code);
    if (host) { NET.hostPeer = host.peer; clearTimeout(NET.joinTimer); SFX.correct(1); }
  }
  if (host) {
    if (NET.hostGone) { clearTimeout(NET.hostGone); NET.hostGone = 0; }
    const st = host.presence && host.presence.st;
    if (st && st !== NET.lastSt) { NET.lastSt = st; try { applyState(st); } catch (e) { console.error(e); } }
  } else if (NET.hostPeer && !NET.hostGone) {
    NET.hostGone = setTimeout(() => { if (isClient()) { leaveRoom(); SFX.out(); toast('The host left, so the room closed.'); } }, 5000);
  }
  ch.updated.concat(ch.joined).forEach(p => {
    if (p.sameTab || p.peer === NET.hostPeer || !G || !G.remote) return;
    const pi = G.players.findIndex(q => q.id === p.peer);
    if (pi >= 0) remoteTyping(pi, p.presence && p.presence.ty);
  });
  if (!$('roomView').hidden) renderRoomView();
}
function netLost() {
  if (!NET.role) return;
  leaveRoom();
  SFX.out();
  toast('Lost the connection to the room.');
}
function leaveRoom() {
  const nr = NET.nr;
  clearTimeout(NET.joinTimer); clearTimeout(NET.hostGone);
  Object.values(NET.drops).forEach(clearTimeout);
  if (NET.pub && NET.lobby) NET.lobby.presence({ open: null }).catch(() => {});
  Object.assign(NET, { nr: null, role: null, code: null, pub: false, hostPeer: null, lastSt: null, bots: [], order: [], seen: {}, drops: {}, hostGone: 0, lastOpen: '' });
  if (G) { G.gen = -1; G.phase = 'over'; G.turnId++; }
  G = null;
  $('results').hidden = true;
  $('countdown').innerHTML = '';
  $('drawer').hidden = true;
  if (nr) nr.leave().catch(() => {});
  $('rvLink').hidden = true;
  if (window.PP_STANDALONE && location.search) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
  showView('setup');
}
$('rvLeave').onclick = () => { SFX.ui(); leaveRoom(); };
function inviteLink(code) {
  try { const u = new URL(location.href); u.search = ''; u.hash = ''; u.searchParams.set('room', code); return u.toString(); } catch (e) { return code; }
}
$('rvCopy').onclick = () => {
  if (window.PP_STANDALONE) {
    const link = inviteLink(NET.code || '');
    const ok = () => { SFX.ui(); toast('Invite link copied. Send it to your friends.'); };
    const fail = () => { $('rvLink').hidden = false; $('rvLink').value = link; $('rvLink').select(); toast('Copy the link below.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(ok, fail); else fail();
    return;
  }
  const code = NET.code || '';
  const done = () => { SFX.ui(); toast(`Copied ${code}`); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, () => toast(`Room code: ${code}`));
  else toast(`Room code: ${code}`);
};

/* ---- waiting room ---- */
function renderRoomView() {
  if (!NET.code) return;
  $('rvCode').textContent = NET.code;
  $('rvKind').textContent = window.PP_STANDALONE ? 'Room code' : isHost() ? (NET.pub ? 'Public room · listed in the lobby' : 'Private room · join by code') : 'Room';
  if (window.PP_STANDALONE) {
    $('rvCopy').textContent = 'Copy invite link';
    $('rvShare').textContent = 'Send friends the invite link, or have them open this site and enter the code. No account needed.';
    if ($('rvLink').hidden === false) $('rvLink').value = inviteLink(NET.code);
  }
  let pl = [], waiting = 0, cats = [], st = NET.lastSt;
  const me = myPeer();
  if (isHost()) {
    const r = hostRoster();
    pl = r.seated.map((p, i) => ({ id: p.id, n: p.name, c: p.critter, t: p.kind === 'bot' ? 'b' : p.kind === 'host' ? 'o' : 'r', d: p.type, guest: p.guest, me: p.kind === 'host' }));
    waiting = r.waiting;
  } else if (st) {
    pl = (st.pl || []).map(q => ({ ...q, me: q.id === me }));
    waiting = st.wt || 0;
    cats = st.cats || [];
  }
  const box = $('rvRoster');
  box.innerHTML = '';
  if (!pl.length) box.innerHTML = `<div class="empty">Looking for room ${esc(NET.code)}…</div>`;
  pl.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'rost';
    const badge = p.t === 'o' ? '<span class="badge host">host</span>' : p.t === 'b' ? '<span class="badge">bot</span>' : '';
    row.innerHTML = `<img alt="" src="${critterURL(CRITTERS[p.c] ? p.c : 'crab', SEAT_COLORS[i % 8])}"><span class="rname"></span>${badge}${p.me ? '<span class="badge you">you</span>' : ''}`;
    row.querySelector('.rname').textContent = p.n;
    if (isHost() && p.t === 'b') {
      const sel = document.createElement('select');
      sel.setAttribute('aria-label', `${p.n} difficulty`);
      sel.innerHTML = '<option value="bot-easy">easy</option><option value="bot-normal">normal</option><option value="bot-hard">hard</option>';
      sel.value = p.d || 'bot-normal';
      sel.onchange = () => { const b = NET.bots.find(x => x.id === p.id); if (b) b.type = sel.value; SFX.ui(); hostPublish(); };
      const rm = document.createElement('button');
      rm.className = 'pbtn small'; rm.textContent = 'X'; rm.setAttribute('aria-label', `Remove ${p.n}`);
      rm.onclick = () => { NET.bots = NET.bots.filter(x => x.id !== p.id); SFX.ui(); hostPublish(); renderRoomView(); };
      row.append(sel, rm);
    }
    box.appendChild(row);
  });
  if (waiting) { const w = document.createElement('div'); w.className = 'empty'; w.textContent = `${waiting} more waiting for a free seat.`; box.appendChild(w); }
  $('rvCount').textContent = `${pl.length}/8`;
  $('rvAddBot').hidden = !isHost();
  $('rvAddBot').disabled = pl.length >= 8;
  $('rvHostCard').hidden = !isHost();
  $('rvWaitCard').hidden = isHost();
  if (isHost()) {
    renderChips($('rvChips'), () => { hostPublish(); renderRoomView(); });
    syncOptControls();
    const ok = enabledIds().length > 0, enough = pl.length >= 2;
    $('rvStart').disabled = !ok || !enough;
    $('rvHint').textContent = !ok ? 'Pick at least one category.' : !enough ? 'Waiting for a friend to join. You can also add a bot.' : '';
  } else {
    const hostP = pl.find(p => p.t === 'o');
    $('rvWaitTxt').textContent = !st ? 'Connecting to the room…' : st.ph !== 'lobby' ? 'A game is running. You\'ll watch this one and play the next.' : `${hostP ? hostP.n : 'The host'} will start the game. ${st.fz}s per turn, ${st.hs} heart${st.hs > 1 ? 's' : ''} each.`;
    $('rvCats').innerHTML = cats.map(c => `<span class="chip" aria-pressed="true">${esc(c)}</span>`).join('');
  }
}

/* =================== GAME (shared) =================== */
const sleep = (ms, gen) => new Promise(res => setTimeout(() => res(!!G && G.gen === gen), ms));
function sync() { if (isHost()) hostPublish(); }
function newG(extra) {
  return Object.assign({
    gen: ++genCounter, remote: false, players: [], turn: 0, cat: null, used: new Map(), passes: 0, turnId: 0, fuseMs: 1, turnStart: 0,
    phase: 'intro', lastCat: null, outCount: 0, solo: false, bag: [], catNo: 0, lastTick: 0, catName: '', prompt: '', note: '', ct: 0,
    said: [], an: [], anSeq: 0, popEv: 0, popSeq: 0, fb: 0, fbSeq: 0, ty: 0, gameNo: 0,
    pf: { x: 0, y: 0, ang: -Math.PI / 2, init: false }, particles: [],
  }, extra);
}
function makePlayer(r, i, hearts) {
  return { id: r.id, name: clean(r.name, 14) || 'player' + (i + 1), type: r.type, me: !!r.me, color: SEAT_COLORS[i % 8], critter: CRITTERS[r.critter] ? r.critter : 'crab',
    hearts, meter: 0, alive: true, given: 0, best: null, outOrder: 0, ped: (i * 3 + 1) % 4 };
}
function resetGameScreen(modeText) {
  $('log').innerHTML = '';
  $('results').hidden = true;
  $('drawer').hidden = true;
  $('saidBtn').hidden = !G.opts.show;
  $('hCode').textContent = NET.code || roomCode();
  $('hMode').textContent = modeText;
  $('pText').textContent = '';
  $('pLabel').textContent = 'Get ready';
  $('pNote').textContent = '';
  $('status').innerHTML = '';
}

/* ---- host / local game logic ---- */
async function startGame() {
  if (isClient()) return;
  persistSetup();
  const opts = { fuse: +$('optFuse').value, hearts: +$('optHearts').value, show: isHost() ? true : $('optShow').checked, cats: enabledIds() };
  if (!opts.cats.length) { toast('Pick at least one category.'); return; }
  let roster;
  if (isHost()) {
    roster = hostRoster().seated.map(r => ({ id: r.id, name: r.name, critter: r.critter, type: r.kind === 'host' ? 'human' : r.kind === 'remote' ? 'remote' : r.type, me: r.kind === 'host' }));
    if (roster.length < 2) { SFX.wrong(); toast('Wait for a friend to join, or add a bot.'); return; }
  } else {
    roster = setupPlayers.map((p, i) => ({ id: 'p' + i, name: p.name, critter: p.critter, type: p.type, me: p.type === 'human' }));
  }
  G = newG({ opts, solo: roster.length === 1, gameNo: isHost() ? ++NET.gameNo : 0 });
  G.players = roster.map((r, i) => makePlayer(r, i, opts.hearts));
  G.turn = Math.floor(Math.random() * G.players.length);
  NET.seen = {};
  resetGameScreen(isHost() ? `Online · ${G.players.length} players` : G.solo ? 'Solo run' : `Local · ${G.players.length} players`);
  showView('game');
  buildSeats();
  updateHud();
  setInput(false, 'wait for it…');
  loop();
  sync();
  const gen = G.gen;
  if (!(await countdown(gen))) return;
  if (!(await newPrompt(gen))) return;
  beginTurn();
}
async function countdown(gen) {
  const cd = $('countdown');
  for (const s of ['3', '2', '1', 'DIVE!']) {
    cd.innerHTML = `<b class="go">${s}</b>`;
    SFX.count(s === 'DIVE!');
    if (!(await sleep(s === 'DIVE!' ? 650 : 700, gen))) { cd.innerHTML = ''; return false; }
  }
  cd.innerHTML = '';
  return true;
}
function nextCatId() {
  if (!G.bag.length) {
    G.bag = [...G.opts.cats].sort(() => Math.random() - 0.5);
    if (G.bag.length > 1 && G.bag[0] === G.lastCat) G.bag.push(G.bag.shift());
  }
  return G.bag.shift();
}
async function newPrompt(gen) {
  const id = nextCatId();
  G.lastCat = id;
  G.cat = getCat(id);
  G.used = new Map();
  G.passes = 0;
  G.catNo++;
  G.catName = G.cat.name;
  G.prompt = G.cat.prompt || ('Name: ' + G.cat.name);
  G.note = G.cat.note || '';
  G.ct = G.cat.answers.length;
  G.said = [];
  G.phase = 'reveal';
  G.turnId++;
  G.ty = 0; G.fb = 0;
  renderSeats();
  setInput(false);
  sync();
  return await revealPrompt(gen);
}
function nextAlive(i) {
  const n = G.players.length;
  for (let k = 1; k <= n; k++) { const j = (i + k) % n; if (G.players[j].alive) return j; }
  return i;
}
function computeFuse() {
  const base = G.opts.fuse * 1000;
  return Math.max(base * 0.45, base * (1 - G.passes * 0.035));
}
function isOver() {
  const alive = G.players.filter(x => x.alive).length;
  return G.solo ? alive === 0 : alive <= 1;
}
function beginTurn() {
  G.turnId++;
  G.phase = 'turn';
  G.turnStart = performance.now();
  G.fuseMs = computeFuse();
  G.lastTick = 0;
  G.ty = 0;
  sync();
  turnVisual();
  if (G.players[G.turn].type.startsWith('bot')) runBot(G.turnId);
}
function feedbackFor(res, typed) {
  if (res.status === 'used') {
    const a = G.cat.answers[res.id];
    const who = G.players[G.used.get(res.id)];
    return ['used', `${a.name} was already said${who ? ' by ' + who.name : ''}`];
  }
  if (res.status === 'ambiguous') return ['ambiguous', `${res.ids.slice(0, 3).map(i => G.cat.answers[i].name).join(' or ')}? type a bit more`];
  return ['none', `“${typed.trim()}” isn't on the list`];
}
function accept(pi, id, typed, res) {
  const p = G.players[pi];
  const a = G.cat.answers[id];
  G.used.set(id, pi);
  p.given++;
  if (!p.best || a.tier > p.best.tier) p.best = { name: a.name, tier: a.tier };
  const pts = TIER_POINTS[a.tier];
  let gained = false;
  p.meter += pts;
  while (p.meter >= METER_FULL) { p.meter -= METER_FULL; if (p.hearts < MAX_HEARTS) { p.hearts++; gained = true; } }
  const fixed = res.fuzzy && norm(typed) !== norm(a.name);
  const ev = [++G.anSeq, G.catNo, pi, clean(a.name, 40), a.tier, pts, fixed ? clean(typed, 30) : '', gained ? 1 : 0];
  G.an.push(ev); if (G.an.length > 8) G.an.shift();
  G.said.push([a.name, a.tier]);
  G.passes++;
  fxAnswer(ev);
  G.turn = nextAlive(G.turn);
  if (G.used.size >= G.cat.answers.length) {
    toast('Every answer has been said. New category!');
    const gen = G.gen;
    newPrompt(gen).then(ok => { if (ok) beginTurn(); });
    return;
  }
  beginTurn();
}
async function pop() {
  G.phase = 'popping';
  G.turnId++;
  const gen = G.gen;
  const pi = G.turn;
  const p = G.players[pi];
  p.hearts--;
  let out = false;
  if (p.hearts <= 0) { p.alive = false; p.outOrder = ++G.outCount; out = true; }
  G.popEv = [++G.popSeq, pi, out ? 1 : 0];
  G.ty = 0;
  sync();
  fxPop(pi, out);
  const over = isOver();
  if (!(await sleep(1600, gen))) return;
  if (over) return showResults();
  G.turn = p.alive ? pi : nextAlive(pi);
  if (!(await newPrompt(gen))) return;
  beginTurn();
}
function setTyping(pi, text) {
  if (!G || G.remote) return;
  const t = clean(text, 40);
  G.ty = [G.turnId, pi, t];
  if (t) say(pi, esc(t), 'typing'); else clearSay(pi);
  sync();
}
function showResults() {
  G.phase = 'over';
  sync();
  resultsVisual();
}
function endGame(silent) {
  if (!G) return;
  G.phase = 'over'; G.turnId++; G.gen = -1;
  $('countdown').innerHTML = '';
  if (!silent) showView('setup');
}
function backToRoom() {
  if (G) { G.gen = -1; G.phase = 'over'; G.turnId++; }
  G = null;
  $('results').hidden = true;
  $('countdown').innerHTML = '';
  $('drawer').hidden = true;
  hostPublish();
  showView('room');
}

/* ---- human input (local players, host, and clients) ---- */
$('answerIn').addEventListener('input', () => {
  SFX.key(false);
  if (!G || G.phase !== 'turn' || !G.players[G.turn] || !G.players[G.turn].me) return;
  const v = $('answerIn').value;
  if (isHost()) setTyping(G.turn, v);
  else if (isClient() && NET.nr) {
    NET.nr.presence({ ty: [G.turnId, clean(v, 40)] }).catch(() => {});
    const t = clean(v, 40);
    if (t) say(G.turn, esc(t), 'typing'); else clearSay(G.turn);
  }
});
$('answerForm').addEventListener('submit', e => {
  e.preventDefault();
  if (!G || G.phase !== 'turn') return;
  const p = G.players[G.turn];
  if (!p || !p.me) return;
  const inp = $('answerIn');
  const typed = inp.value;
  if (!typed.trim()) return;
  if (isClient()) {
    if (!NET.nr) return;
    NET.ansSeq++;
    NET.nr.presence({ ans: [NET.ansSeq, G.turnId, clean(typed, 60)] }).catch(() => {});
    $('status').innerHTML = '<span class="dim">checking…</span>';
    return;
  }
  const res = matchAnswer(typed, G.cat, new Set(G.used.keys()));
  if (res.status === 'ok') {
    const a = G.cat.answers[res.id];
    const fixed = res.fuzzy && norm(typed) !== norm(a.name);
    accept(G.turn, res.id, typed, res);
    if (fixed) $('status').innerHTML = `<span class="good">autocorrected to ${esc(a.name)}</span>`;
    return;
  }
  const [kind, msg] = feedbackFor(res, typed);
  showFeedback(kind, msg);
});
function showFeedback(kind, msg) {
  $('status').innerHTML = `<span class="bad">${esc(msg)}</span>`;
  if (kind === 'used') SFX.used(); else if (kind === 'ambiguous') SFX.hmm(); else SFX.wrong();
  const inp = $('answerIn');
  inp.classList.remove('bad'); void inp.offsetWidth; inp.classList.add('bad');
  inp.select();
}

/* ---- bots (run on the host or in local games) ---- */
function runBot(tid) {
  const pi = G.turn;
  const p = G.players[pi];
  const s = BOT_SKILL[p.type] ?? 0.6;
  const knowP = [0.97, 0.5 + 0.45 * s, 0.12 + 0.6 * s, 0.03 + 0.4 * s];
  const weight = [1, 0.6 + s, 0.25 + s * 1.3, 0.1 + s * 1.3];
  const pool = [];
  G.cat.answers.forEach((a, i) => { if (!G.used.has(i) && Math.random() < knowP[a.tier]) pool.push(i); });
  const think = 650 + Math.random() * (1300 + (1 - s) * 4200) + G.passes * 110 * (1.2 - s);
  const stillMine = () => G && G.turnId === tid && G.phase === 'turn';
  setTimeout(() => { if (stillMine()) setTyping(pi, '…'); }, 250);
  if (!pool.length) return;
  let tot = 0; pool.forEach(i => tot += weight[G.cat.answers[i].tier]);
  let r = Math.random() * tot, id = pool[0];
  for (const i of pool) { r -= weight[G.cat.answers[i].tier]; if (r <= 0) { id = i; break; } }
  const a = G.cat.answers[id];
  let text = a.name;
  const alts = a.aliases.filter(x => norm(x).length > 3);
  if (alts.length && Math.random() < 0.2) text = alts[Math.floor(Math.random() * alts.length)];
  if (text.length > 6 && Math.random() < 0.18) {
    const j = 2 + Math.floor(Math.random() * (text.length - 4));
    const typo = text.slice(0, j) + text[j + 1] + text[j] + text.slice(j + 2);
    const chk = matchAnswer(typo, G.cat, new Set(G.used.keys()));
    if (chk.status === 'ok' && chk.id === id) text = typo;
  }
  setTimeout(() => {
    if (!stillMine()) return;
    let k = 0;
    const step = () => {
      if (!stillMine()) return;
      k++;
      setTyping(pi, text.slice(0, k));
      SFX.key(true);
      if (k < text.length) setTimeout(step, rand(40, 95) * (1.3 - s * 0.5));
      else setTimeout(() => {
        if (!stillMine()) return;
        const res = matchAnswer(text, G.cat, new Set(G.used.keys()));
        if (res.status === 'ok') accept(pi, res.id, text, res);
        else accept(pi, id, a.name, { fuzzy: false });
      }, 180);
    };
    step();
  }, think);
}

/* ---- client: mirror the host's state ---- */
function startRemoteGame(st) {
  const me = myPeer();
  const fresh = st.ph === 'intro';
  G = newG({ remote: true, gameNo: st.g, opts: { hearts: st.hs, show: true, fuse: st.fz }, turnId: -1, catNo: fresh ? 0 : st.cn, turn: st.tn || 0, phase: st.ph });
  G.players = (st.pl || []).map((q, i) => {
    const p = makePlayer({ id: q.id, name: q.n, critter: q.c, type: q.t === 'b' ? 'bot' : 'remote', me: q.id === me }, i, q.h ?? st.hs);
    return p;
  });
  G.spectator = !G.players.some(p => p.me);
  G.anSeq = Math.max(0, ...(st.an || []).map(e => +e[0] || 0));
  G.popSeq = Array.isArray(st.pop) ? +st.pop[0] : 0;
  G.fbSeq = NET.ansSeq;
  resetGameScreen(`Online · ${G.players.length} players${G.spectator ? ' · watching' : ''}`);
  if (!fresh) {
    G.catName = st.cnm; G.prompt = st.cp; G.note = st.no; G.ct = st.ct;
    $('pLabel').textContent = `Category ${st.cn}`;
    $('hCatTop').textContent = `· Category ${st.cn} ·`;
    $('pText').textContent = st.cp || '';
    $('pNote').textContent = st.no || '';
  }
  showView('game');
  buildSeats();
  updateHud();
  setInput(false, G.spectator ? 'watching · you play next game' : 'wait for it…');
  loop();
  if (fresh) countdown(G.gen);
}
function applyState(st) {
  if (!st || typeof st !== 'object' || !Array.isArray(st.pl)) return;
  if (st.ph === 'lobby') {
    if (G && G.remote) { G.gen = -1; G = null; $('results').hidden = true; $('countdown').innerHTML = ''; $('drawer').hidden = true; }
    if ($('roomView').hidden && $('bank').hidden) showView('room'); else renderRoomView();
    return;
  }
  if (!G || !G.remote || G.gameNo !== st.g) startRemoteGame(st);
  const g = G;
  st.pl.forEach((q, i) => {
    const p = g.players[i]; if (!p) return;
    p.hearts = +q.h || 0; p.meter = +q.m || 0; p.alive = !!q.a; p.outOrder = +q.o || 0; p.given = +q.gv || 0;
    p.best = Array.isArray(q.b) ? { name: clean(q.b[0], 40), tier: Math.max(0, Math.min(3, +q.b[1] || 0)) } : null;
  });
  g.ct = +st.ct || 0;
  g.cu = +st.cu || 0;
  // answers that happened since the last update
  (st.an || []).forEach(ev => {
    if (!Array.isArray(ev) || +ev[0] <= g.anSeq) return;
    g.anSeq = +ev[0];
    const e = [+ev[0], +ev[1], +ev[2], clean(ev[3], 40), Math.max(0, Math.min(3, +ev[4] || 0)), +ev[5] || 0, clean(ev[6], 30), ev[7] ? 1 : 0];
    if (!g.players[e[2]]) return;
    if (e[1] === g.catNo) g.said.push([e[3], e[4]]);
    fxAnswer(e);
  });
  if (Array.isArray(st.pop) && +st.pop[0] > g.popSeq) {
    g.popSeq = +st.pop[0];
    if (g.players[+st.pop[1]]) fxPop(+st.pop[1], !!st.pop[2]);
  }
  if (st.cn !== g.catNo && st.ph !== 'intro') {
    g.catNo = st.cn; g.catName = clean(st.cnm, 40); g.prompt = clean(st.cp, 220); g.note = clean(st.no, 200);
    g.said = [];
    revealPrompt(g.gen);
  }
  g.turn = Math.max(0, Math.min(g.players.length - 1, +st.tn || 0));
  if (st.ph === 'turn' && st.tid !== g.turnId) {
    g.turnId = st.tid; g.phase = 'turn';
    g.turnStart = performance.now();
    g.fuseMs = Math.max(600, (+st.fm || 10000) - 120);
    g.lastTick = 0;
    turnVisual();
  } else if (st.ph !== g.phase) {
    g.phase = st.ph; g.turnId = st.tid;
    if (st.ph === 'over') resultsVisual();
    else { setInput(false); renderSeats(); }
  }
  const me = myPeer();
  if (Array.isArray(st.fb) && st.fb[0] === me && +st.fb[1] > g.fbSeq) {
    g.fbSeq = +st.fb[1];
    if (g.phase === 'turn' && g.players[g.turn] && g.players[g.turn].me) showFeedback(clean(st.fb[2], 12), clean(st.fb[3], 140));
  }
  if (Array.isArray(st.ty) && g.phase === 'turn' && st.ty[0] === g.turnId && g.players[st.ty[1]] && !g.players[st.ty[1]].me) {
    const t = clean(st.ty[2], 40);
    if (t) say(st.ty[1], esc(t), 'typing'); else clearSay(st.ty[1]);
  }
  renderSeats(); updateHud(); renderSaid();
}

/* ---- visuals shared by every role ---- */
async function revealPrompt(gen) {
  G.said = G.said || [];
  renderSeats();
  setInput(false);
  $('status').innerHTML = 'new category incoming';
  $('pLabel').textContent = `Category ${G.catNo}`;
  $('hCatTop').textContent = `· Category ${G.catNo} ·`;
  $('pNote').textContent = '';
  renderSaid();
  logLine(`<span class="dim">Category ${G.catNo}:</span> ${esc(G.catName)}`);
  const box = $('promptBox');
  box.classList.remove('reveal'); void box.offsetWidth; box.classList.add('reveal');
  SFX.reveal();
  const text = G.prompt;
  const h = $('pText');
  const myCat = G.catNo;
  if (REDUCED) h.textContent = text;
  else {
    if (!(await sleep(260, gen))) return false;
    for (let i = 1; i <= text.length; i++) {
      if (G.catNo !== myCat) return false;
      h.innerHTML = esc(text.slice(0, i)) + '<span class="cur">&nbsp;</span>';
      if (i % 2 === 0 && text[i - 1] !== ' ') SFX.blip(i);
      if (!(await sleep(text.length > 60 ? 18 : 26, gen))) return false;
    }
    h.textContent = text;
  }
  $('pNote').textContent = G.note || '';
  return await sleep(450, gen);
}
function myCount() { return G.players.filter(x => x.me).length; }
function turnVisual() {
  renderSeats();
  updateHud();
  const p = G.players[G.turn];
  $('answerIn').value = '';
  if (p.me) {
    setInput(true);
    $('status').innerHTML = myCount() > 1 ? `▸ <b>${esc(p.name)}'s puffer</b> · type an answer` : '▸ <b>your puffer</b> · type an answer';
    SFX.yourTurn();
    setTimeout(() => { if (!$('answerIn').disabled) $('answerIn').focus({ preventScroll: true }); }, 0);
  } else {
    setInput(false, G.spectator ? 'watching · you play next game' : `${p.name} has the puffer…`);
    $('status').innerHTML = `▸ <b>${esc(p.name)}</b> has the puffer`;
  }
}
function setInput(enabled, placeholder) {
  const inp = $('answerIn');
  inp.disabled = !enabled; $('answerBtn').disabled = !enabled;
  inp.placeholder = placeholder || (enabled ? 'your puffer · type!' : '');
  inp.classList.remove('bad', 'good');
}
function logLine(html) {
  const li = document.createElement('li');
  li.innerHTML = html;
  const log = $('log');
  log.prepend(li);
  while (log.children.length > 80) log.lastChild.remove();
}
function renderSaid() {
  if (!G) return;
  const n = G.remote ? Math.max(G.cu || 0, G.said.length) : G.said.length;
  $('saidCount').textContent = n;
  $('saidBtn').textContent = `Said ${n}`;
  $('saidTotal').textContent = G.ct || 0;
  const box = $('said');
  box.innerHTML = '';
  [...G.said].reverse().forEach(([name, tier]) => {
    const s = document.createElement('span');
    s.className = 'c' + tier;
    s.textContent = name;
    box.appendChild(s);
  });
}
$('saidBtn').onclick = () => { SFX.ui(); $('drawer').hidden = !$('drawer').hidden; };
function say(pi, html, cls, fade) {
  const seat = document.querySelector(`.seat[data-i="${pi}"] .stack`);
  if (!seat) return;
  let b = seat.querySelector('.say');
  if (!b) { b = document.createElement('div'); seat.appendChild(b); }
  b.className = 'say ' + (cls || '');
  b.innerHTML = html;
  if (fade) { void b.offsetWidth; b.classList.add('fade'); clearTimeout(b._t); b._t = setTimeout(() => b.remove(), 2200); }
  else clearTimeout(b._t);
}
function clearSay(pi) { const b = document.querySelector(`.seat[data-i="${pi}"] .say`); if (b && !b.classList.contains('fade')) b.remove(); }
function fxAnswer(ev) {
  const [, , pi, name, tier, pts, fixedFrom, gained] = ev;
  const p = G.players[pi];
  say(pi, `${esc(name)}<span class="tier">${TIERS[tier]}${pts ? ' +' + pts : ''}</span>`, `ans c${tier}`, true);
  logLine(`<span style="color:${p.color}">${esc(p.name)}</span> ${esc(name)} <span class="tier c${tier}">${TIERS[tier]}</span>${fixedFrom ? ` <span class="fix">from “${esc(fixedFrom)}”</span>` : ''}`);
  SFX.correct(tier);
  if (tier >= 2) sparkle(pi, tier);
  if (gained) { setTimeout(() => SFX.heart(), 380); toast(`${p.name} earned an extra heart`); }
  renderSaid();
  setTimeout(() => SFX.pass(), 120);
}
function fxPop(pi, out) {
  const p = G.players[pi];
  clearSay(pi);
  SFX.pop();
  burst(G.pf.x, G.pf.y);
  const t = $('popTxt'); t.classList.remove('go'); void t.offsetWidth; t.classList.add('go');
  const gm = $('game'); gm.classList.remove('shake'); void gm.offsetWidth; gm.classList.add('shake');
  logLine(`<span style="color:${p.color}">${esc(p.name)}</span> <span style="color:var(--red)">got puffed</span>${out ? ' and sank' : ''}`);
  if (out) SFX.out();
  setInput(false);
  $('status').innerHTML = `<span class="bad">pop! ${esc(p.name)} ${out ? 'is out' : 'loses a heart'}</span>`;
  renderSeats();
  updateHud();
}

/* seats */
function buildSeats() {
  const arena = $('arena');
  arena.querySelectorAll('.seat').forEach(s => s.remove());
  G.players.forEach((p, i) => {
    const s = document.createElement('div');
    s.className = 'seat';
    s.dataset.i = i;
    s.innerHTML = `<div class="stack"><div class="glow"></div><img class="crit" alt="" src="${critterURL(p.critter, p.color)}"><img class="ped" alt="" src="${pedestalURL(p.ped, i + 3)}"></div><div class="nm"></div><div class="hearts"></div><div class="pips"></div>`;
    s.querySelector('.nm').textContent = p.name + (p.me && NET.role ? ' (you)' : '');
    arena.appendChild(s);
  });
  arena.querySelectorAll('.seat img').forEach(im => { if (!im.complete) im.addEventListener('load', () => G && layoutSeats(), { once: true }); });
  layoutSeats();
  renderSeats();
}
if (window.ResizeObserver) new ResizeObserver(() => { if (G && !$('game').hidden) layoutSeats(); }).observe($('arena'));
function layoutSeats() {
  const n = G.players.length;
  const arena = $('arena');
  const W = arena.clientWidth, H = arena.clientHeight;
  const probe = arena.querySelector('.seat');
  const sh = probe ? probe.offsetHeight : 160, sw = probe ? probe.offsetWidth : 150;
  const top = sh * 0.62 + 4, bottom = H - sh * 0.38 - 2;
  const cyy = (top + bottom) / 2;
  const rx = Math.max(60, Math.min(W / 2 - sw / 2, 540)), ry = Math.max(30, (bottom - top) / 2);
  G.cy = cyy;
  G.players.forEach((p, i) => {
    const ang = (-90 + (360 / n) * i) * Math.PI / 180 + (n === 2 ? Math.PI / 2 : 0);
    p.sx = W / 2 + Math.cos(ang) * rx;
    p.sy = cyy + Math.sin(ang) * ry;
    const s = arena.querySelector(`.seat[data-i="${i}"]`);
    s.style.left = p.sx + 'px'; s.style.top = p.sy + 'px';
  });
  const fx = $('fx'); fx.width = W; fx.height = H;
}
function renderSeats() {
  if (!G) return;
  G.players.forEach((p, i) => {
    const s = document.querySelector(`.seat[data-i="${i}"]`);
    if (!s) return;
    s.classList.toggle('active', i === G.turn && p.alive && (G.phase === 'turn' || G.phase === 'reveal'));
    s.classList.toggle('out', !p.alive);
    let h = '';
    const shown = Math.max(G.opts.hearts, p.hearts);
    for (let k = 0; k < shown; k++) h += heartSVG(k < p.hearts);
    s.querySelector('.hearts').innerHTML = p.alive ? h : '<span class="tier dim">sunk</span>';
    let m = '';
    for (let k = 0; k < METER_FULL; k++) m += `<i class="${k < p.meter ? 'on' : ''}"></i>`;
    s.querySelector('.pips').innerHTML = p.alive ? m : '';
  });
}
function updateHud() {
  const alive = G.players.filter(x => x.alive).length;
  $('hFloat').textContent = `${alive}/${G.players.length}`;
  const cur = G.players[G.turn] || G.players[0];
  const me = cur.me ? cur : (G.players.find(x => x.me && x.alive) || G.players.find(x => x.me) || cur);
  $('dialHv').innerHTML = `<span>${heartSVG(me.hearts > 0)}${Math.max(0, me.hearts)}</span>`;
}

/* particles */
function burst(x, y) {
  const cols = ['#f4cf63', '#ff5a4a', '#ffffff', '#ffd45c', '#ff8a5a'];
  for (let i = 0; i < 46; i++) {
    const a = Math.random() * Math.PI * 2, v = rand(2, 9);
    G.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(28, 52), max: 52, c: cols[i % cols.length], s: Math.random() < 0.3 ? 8 : 4 });
  }
  for (let i = 0; i < 14; i++) G.particles.push({ x: x + rand(-20, 20), y: y + rand(-20, 20), vx: rand(-0.6, 0.6), vy: rand(-2.2, -0.8), life: rand(50, 90), max: 90, c: 'bubble', s: 6 });
}
function sparkle(pi, tier) {
  const p = G.players[pi];
  const col = tier === 3 ? '#ffd45c' : '#94b4ff';
  for (let i = 0; i < (tier === 3 ? 28 : 16); i++) {
    const a = Math.random() * Math.PI * 2, v = rand(1, 4);
    G.particles.push({ x: p.sx, y: p.sy - 40, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: rand(25, 45), max: 45, c: col, s: 4 });
  }
}
function drawFx() {
  const c = $('fx'), g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  G.particles = G.particles.filter(q => {
    q.x += q.vx; q.y += q.vy; q.vx *= 0.93; q.vy = q.vy * 0.93 + (q.c === 'bubble' ? -0.02 : 0.08); q.life--;
    const a = Math.max(0, q.life / q.max);
    const x = Math.round(q.x / 4) * 4, y = Math.round(q.y / 4) * 4;
    if (q.c === 'bubble') {
      g.fillStyle = `rgba(210,240,255,${a * 0.8})`;
      g.fillRect(x + 2, y, 4, 2); g.fillRect(x, y + 2, 2, 4); g.fillRect(x + 6, y + 2, 2, 4); g.fillRect(x + 2, y + 6, 4, 2);
    } else {
      g.globalAlpha = a; g.fillStyle = q.c; g.fillRect(x, y, q.s, q.s); g.globalAlpha = 1;
    }
    return q.life > 0;
  });
}

/* main loop */
let rafId = 0;
function loop() {
  cancelAnimationFrame(rafId);
  const pcv = $('puffer');
  const tick = () => {
    if (!G || $('game').hidden) return;
    const now = performance.now();
    let frac = 0;
    if (G.phase === 'turn') {
      frac = Math.min(1, (now - G.turnStart) / G.fuseMs);
      if (frac > 0.4) {
        const f2 = (frac - 0.4) / 0.6;
        const interval = 560 - f2 * 460;
        if (now - G.lastTick > interval) { SFX.tick(f2); if (Math.random() < 0.35) SFX.inflate(frac); G.lastTick = now; }
      }
      if (frac >= 1 && !G.remote) pop();
    }
    const holder = G.players[G.turn] || G.players[0];
    const arena = $('arena');
    const cx = arena.clientWidth / 2, cy = G.cy || arena.clientHeight / 2;
    const dxh = holder.sx - cx, dyh = holder.sy - cy, dist = Math.hypot(dxh, dyh) || 1;
    const gap = Math.min(dist * 0.7, pcv.offsetWidth * 0.95);
    const tx = holder.sx - dxh / dist * gap, ty = holder.sy - dyh / dist * gap;
    const pf = G.pf;
    if (!pf.init) { pf.x = cx; pf.y = cy; pf.init = true; }
    pf.x += (tx - pf.x) * 0.12; pf.y += (ty - pf.y) * 0.12;
    const want = Math.atan2(holder.sy - pf.y, holder.sx - pf.x);
    let d = want - pf.ang; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    pf.ang += d * 0.15;
    const flip = Math.cos(pf.ang) < 0 ? -1 : 1;
    const wob = G.phase === 'turn' && frac > 0.78 ? rand(-2, 2) : Math.sin(now / 400) * 2;
    const visible = G.phase !== 'popping' && G.phase !== 'over';
    pcv.style.opacity = visible ? 1 : 0;
    pcv.style.transform = `translate(${(pf.x - pcv.offsetWidth / 2).toFixed(1)}px, ${(pf.y - pcv.offsetHeight / 2 + wob).toFixed(1)}px) rotate(${pf.ang.toFixed(3)}rad) scaleY(${flip})`;
    drawPuffer(pcv, frac, now, frac > 0.78);
    const ring = $('dialRing');
    const mine = holder.me && G.phase === 'turn';
    ring.style.strokeDashoffset = (207.3 * (mine ? frac : 0)).toFixed(1);
    ring.style.stroke = frac > 0.75 && mine ? 'var(--red)' : 'var(--cyan)';
    if (Math.random() < 0.03 && visible) G.particles.push({ x: pf.x + rand(-10, 10), y: pf.y - 20, vx: rand(-0.3, 0.3), vy: rand(-1.4, -0.6), life: 60, max: 60, c: 'bubble', s: 6 });
    drawFx();
    if (G.phase !== 'over' || G.particles.length) rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}
// keep the clock honest if the tab is backgrounded (rAF pauses)
setInterval(() => { if (G && !G.remote && G.phase === 'turn' && performance.now() - G.turnStart >= G.fuseMs + 250) pop(); }, 250);

/* results */
function resultsVisual() {
  const ranked = [...G.players].sort((a, b) => (b.alive - a.alive) || (b.outOrder - a.outOrder) || (b.given - a.given));
  const win = ranked[0];
  $('rWinner').innerHTML = `<img alt="" src="${critterURL(win.critter, win.color)}">`;
  $('rTitle').textContent = G.solo ? `${win.given} answers` : win.me && NET.role ? 'You win!' : `${win.name} wins!`;
  $('rList').innerHTML = ranked.map((p, i) => `<li><span class="pos">#${i + 1}</span><img alt="" src="${critterURL(p.critter, p.color)}"><span><span style="color:${p.color}">${esc(p.name)}</span> <span class="dim">· ${p.given}</span></span><span>${p.best ? `${esc(p.best.name)} <span class="tier c${p.best.tier}">${TIERS[p.best.tier]}</span>` : '<span class="dim">—</span>'}</span></li>`).join('');
  $('rAgain').hidden = isClient();
  $('rSetup').textContent = isHost() ? 'Back to room' : isClient() ? 'Leave room' : 'Back to lobby';
  $('rWait').hidden = !isClient();
  $('results').hidden = false;
  if (win.me || G.solo) SFX.win(); else SFX.out();
  (isClient() ? $('rSetup') : $('rAgain')).focus();
}
$('quitBtn').onclick = () => {
  SFX.ui();
  if (isHost()) backToRoom();
  else if (isClient()) leaveRoom();
  else endGame(false);
};
$('rAgain').onclick = () => { $('results').hidden = true; startGame(); };
$('rSetup').onclick = () => {
  $('results').hidden = true;
  if (isHost()) backToRoom();
  else if (isClient()) leaveRoom();
  else showView('setup');
};

/* =================== QUESTION BANK =================== */
let edId = null;
function renderBank() {
  const defs = allDefs();
  if (!edId || !defs.find(d => d.id === edId)) edId = defs[0].id;
  const list = $('catList');
  list.innerHTML = '';
  defs.forEach(d => {
    const c = getCat(d.id);
    const b = document.createElement('button');
    b.className = 'catitem';
    b.setAttribute('aria-current', d.id === edId);
    b.innerHTML = `<span>${esc(d.name)}</span><span class="meta">${!d.builtin ? '<span class="badge">custom</span>' : d.edited ? '<span class="badge">edited</span>' : ''}<span class="count">${c.answers.length}</span></span>`;
    b.onclick = () => { if (dirty() && !confirmLeave()) return; SFX.ui(); edId = d.id; renderBank(); };
    list.appendChild(b);
  });
  loadEditor();
  $('ioText').value = exportJSON();
}
let pendingLeave = 0;
function confirmLeave() {
  if (Date.now() - pendingLeave < 4000) { pendingLeave = 0; return true; }
  pendingLeave = Date.now();
  toast('Unsaved changes. Click again to discard them.');
  return false;
}
function currentDef() { return allDefs().find(d => d.id === edId); }
let edSnapshot = '';
function edValues() { return JSON.stringify([$('edName').value, $('edPrompt').value, $('edNote').value, $('edText').value]); }
function dirty() { return !$('bank').hidden && edSnapshot && edValues() !== edSnapshot; }
function loadEditor() {
  const d = currentDef();
  $('edName').value = d.name || '';
  $('edPrompt').value = d.prompt || '';
  $('edNote').value = d.note || '';
  $('edText').value = (d.text || '').replace(/^\n+/, '');
  edSnapshot = edValues();
  $('edReset').hidden = !(d.builtin && d.edited);
  $('edDelete').hidden = d.builtin;
  $('testIn').value = '';
  refreshEditorStats();
}
function draftCat() { return loadCategory({ id: '_draft', name: $('edName').value, prompt: $('edPrompt').value, text: $('edText').value }); }
function refreshEditorStats() {
  const c = draftCat();
  const t = [0, 0, 0, 0];
  c.answers.forEach(a => t[a.tier]++);
  $('edStats').innerHTML = `<span><b>${c.answers.length}</b> answers</span>` + TIERS.map((n, i) => `<span class="c${i}">${t[i]} ${n}</span>`).join('') + (dirty() ? '<span class="warn">unsaved</span>' : '');
  const names = new Map(); const dupes = [];
  c.answers.forEach(a => { const k = norm(a.name); if (names.has(k)) dupes.push(a.name); names.set(k, 1); });
  const warn = [...c.problems];
  if (dupes.length) warn.push('Listed twice: ' + dupes.join(', '));
  $('edWarn').textContent = warn.join(' · ');
  const sk = sharedKeys(c);
  $('sharedSum').textContent = `Shared aliases (${sk.length})`;
  $('sharedList').innerHTML = sk.length ? sk.map(x => `<div><span class="c3">${esc(x.key)}</span> → ${x.names.map(esc).join(', ')}</div>`).join('') : 'None. Every spelling points to exactly one answer.';
  runTester(c);
}
function runTester(c) {
  const v = $('testIn').value;
  const out = $('testRes');
  if (!v.trim()) { out.innerHTML = '<span class="dim">Try a typo, a nickname, or a plural.</span>'; return; }
  c = c || draftCat();
  const r = matchAnswer(v, c, new Set());
  if (r.status === 'ok') {
    const a = c.answers[r.id];
    out.innerHTML = `<span class="c1">Accepted</span> as <b>${esc(a.name)}</b> <span class="tier c${a.tier}">${TIERS[a.tier]}</span>${r.fuzzy ? ` <span class="fix">typo fix, ${r.dist} edit${r.dist > 1 ? 's' : ''}</span>` : ''}`;
  } else if (r.status === 'ambiguous') {
    out.innerHTML = `<span class="warn">Ambiguous:</span> could be ${r.ids.map(i => esc(c.answers[i].name)).join(' or ')}. Players get asked to type more.`;
  } else {
    out.innerHTML = `<span style="color:var(--red)">Rejected.</span> Not on the list. <button class="pbtn small" id="testAdd">Add “${esc(v.trim())}”</button>`;
    $('testAdd').onclick = () => { $('qaText').value = v.trim(); $('qaText').focus(); };
  }
}
['edName', 'edPrompt', 'edNote', 'edText'].forEach(id => $(id).addEventListener('input', () => { clearTimeout(refreshEditorStats.t); refreshEditorStats.t = setTimeout(refreshEditorStats, 150); }));
$('testIn').addEventListener('input', () => runTester());
function quickAdd() {
  const v = $('qaText').value.trim();
  if (!v) return;
  const tier = +$('qaTier').value;
  const ta = $('edText');
  const lines = ta.value.replace(/\s+$/, '').split('\n');
  let cur = 0, lastIdx = -1, sectionStart = -1;
  lines.forEach((l, i) => {
    const t = l.trim();
    if (t.startsWith('#')) { const k = TIERS.indexOf(t.slice(1).trim().toLowerCase()); if (k >= 0) { cur = k; if (k === tier) sectionStart = i; } return; }
    if (t && !t.startsWith('//') && cur === tier) lastIdx = i;
  });
  if (lastIdx >= 0) lines.splice(lastIdx + 1, 0, v);
  else if (sectionStart >= 0) lines.splice(sectionStart + 1, 0, v);
  else if (tier === 0) lines.unshift(v);
  else lines.push('# ' + TIERS[tier], v);
  ta.value = lines.join('\n') + '\n';
  $('qaText').value = '';
  refreshEditorStats();
  SFX.correct(Math.min(tier, 1));
  toast(`Added “${v.split('|')[0].trim()}”. Press Save to keep it.`);
}
$('qaBtn').onclick = quickAdd;
$('qaText').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); quickAdd(); } });
$('edSave').onclick = () => {
  const d = currentDef();
  const c = draftCat();
  if (!c.answers.length) { SFX.wrong(); toast('Add at least one answer before saving.'); return; }
  const rec = { name: $('edName').value.trim() || 'Untitled', prompt: $('edPrompt').value.trim(), note: $('edNote').value.trim(), text: $('edText').value };
  if (d.builtin) store.overrides[d.id] = rec;
  else { const i = store.custom.findIndex(x => x.id === d.id); store.custom[i] = { id: d.id, ...rec }; }
  saveStore(); invalidate(); renderBank(); SFX.correct(1); toast('Saved');
};
$('edRevert').onclick = () => { SFX.ui(); loadEditor(); toast('Changes discarded'); };
let armedAt = {};
function armed(k) {
  if (Date.now() - (armedAt[k] || 0) < 4000) { armedAt[k] = 0; return true; }
  armedAt[k] = Date.now();
  SFX.hmm();
  toast(k === 'delete' ? 'Click Delete again to remove this category.' : 'Click Reset again to throw away your edits.');
  return false;
}
$('edReset').onclick = () => { const d = currentDef(); if (!armed('reset')) return; delete store.overrides[d.id]; saveStore(); invalidate(); renderBank(); toast('Restored the built-in list'); };
$('edDelete').onclick = () => {
  const d = currentDef();
  if (!armed('delete')) return;
  store.custom = store.custom.filter(x => x.id !== d.id);
  if (store.enabled) store.enabled = store.enabled.filter(x => x !== d.id);
  saveStore(); invalidate(); edId = null; edSnapshot = ''; renderBank(); toast('Deleted');
};
function newId() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
$('newCat').onclick = () => {
  if (dirty() && !confirmLeave()) return;
  const id = newId();
  store.custom.push({ id, name: 'New category', prompt: 'Name a …', note: '', text: 'First answer | alias\nSecond answer\n# uncommon\n\n# rare\n\n' });
  if (store.enabled) store.enabled.push(id);
  saveStore(); invalidate(); edId = id; SFX.ui(); renderBank();
  $('edName').select();
};
$('edDup').onclick = () => {
  const id = newId();
  store.custom.push({ id, name: $('edName').value + ' (copy)', prompt: $('edPrompt').value, note: $('edNote').value, text: $('edText').value });
  if (store.enabled) store.enabled.push(id);
  saveStore(); invalidate(); edId = id; SFX.ui(); renderBank(); toast('Duplicated');
};
function exportJSON() { return JSON.stringify({ app: 'puff-pass', version: 1, custom: store.custom, overrides: store.overrides }, null, 1); }
$('copyExport').onclick = () => {
  const ta = $('ioText'); ta.value = exportJSON();
  const fallback = () => { ta.select(); toast('Selected. Press Ctrl/Cmd+C to copy.'); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(ta.value).then(() => toast('Copied'), fallback);
  else fallback();
};
$('doImport').onclick = () => {
  let data;
  try { data = JSON.parse($('ioText').value); } catch (e) { SFX.wrong(); toast('That text is not valid JSON. Paste an export from this page.'); return; }
  if (!data || (!Array.isArray(data.custom) && typeof data.overrides !== 'object')) { SFX.wrong(); toast('No categories found in that text.'); return; }
  let n = 0;
  (data.custom || []).forEach(c => {
    if (!c || typeof c.text !== 'string') return;
    const i = store.custom.findIndex(x => x.id === c.id);
    const rec = { id: c.id || newId(), name: String(c.name || 'Imported'), prompt: String(c.prompt || ''), note: String(c.note || ''), text: c.text };
    if (i >= 0) store.custom[i] = rec; else { store.custom.push(rec); if (store.enabled) store.enabled.push(rec.id); }
    n++;
  });
  Object.entries(data.overrides || {}).forEach(([id, o]) => { if (BUILTIN.find(b => b.id === id) && o && typeof o.text === 'string') { store.overrides[id] = o; n++; } });
  saveStore(); invalidate(); renderBank(); SFX.correct(2); toast(`Imported ${n} categor${n === 1 ? 'y' : 'ies'}`);
};

renderSetup();
netInit();
})();
