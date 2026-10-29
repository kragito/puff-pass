/* ===== Puff Pass engine: knowledge base format, normalization, matching ===== */
const TIERS = ['common', 'uncommon', 'rare', 'legendary'];
const TIER_POINTS = [0, 1, 2, 3];

/* Bank text format:
   one answer per line, aliases separated by "|":  United Kingdom | UK | Britain
   "# uncommon" (or rare / legendary / common) switches the tier for the lines below
   lines starting with "//" are comments */
function parseBank(text) {
  const answers = [];
  const problems = [];
  let tier = 0;
  text.split(/\r?\n/).forEach((raw, ln) => {
    const line = raw.trim();
    if (!line || line.startsWith('//')) return;
    if (line.startsWith('#')) {
      const t = TIERS.indexOf(line.slice(1).trim().toLowerCase());
      if (t >= 0) tier = t; else problems.push(`Line ${ln + 1}: unknown tier "${line}"`);
      return;
    }
    const parts = line.split('|').map(s => s.trim()).filter(Boolean);
    if (!parts.length) return;
    if (!norm(parts[0])) { problems.push(`Line ${ln + 1}: "${parts[0]}" has no letters or digits`); return; }
    answers.push({ name: parts[0], aliases: parts.slice(1), tier });
  });
  return { answers, problems };
}

function norm(s) {
  s = String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  s = s.replace(/&/g, ' and ').replace(/\+/g, ' plus ').replace(/#/g, ' sharp ');
  s = s.replace(/['’ʻ`´.]/g, '');
  s = s.replace(/[^a-z0-9]+/g, ' ').trim();
  let t = s.split(' ').filter(Boolean);
  if (t.length > 1 && t[0] === 'the') t.shift();
  t = t.map(w => (w === 'saint' ? 'st' : w));
  return t.join('');
}

function buildIndex(cat) {
  const map = new Map();
  cat.answers.forEach((a, i) => {
    for (const raw of [a.name, ...a.aliases]) {
      const k = norm(raw);
      if (!k) continue;
      if (!map.has(k)) map.set(k, []);
      const arr = map.get(k);
      if (!arr.includes(i)) arr.push(i);
    }
  });
  cat.index = map;
  return map;
}

/* Optimal string alignment distance (Damerau-Levenshtein with adjacent swaps), with early exit */
function osa(a, b, max) {
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > max) return max + 1;
  let prev2 = null, prev = new Array(lb + 1), cur = new Array(lb + 1);
  for (let j = 0; j <= lb; j++) prev[j] = j;
  for (let i = 1; i <= la; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev.slice(); const t = prev; prev = cur; cur = t;
  }
  return prev[lb];
}

function typoAllowance(len) {
  if (len <= 3) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  return 3;
}

/* used: Set of answer indices already given for this prompt.
   Returns { status: 'ok'|'used'|'ambiguous'|'none'|'empty', id, ids, fuzzy, dist } */
function matchAnswer(input, cat, used) {
  used = used || new Set();
  const k = norm(input);
  if (!k) return { status: 'empty' };
  const idx = cat.index || buildIndex(cat);

  const pick = (ids, fuzzy, dist) => {
    const free = ids.filter(i => !used.has(i));
    if (!free.length) return { status: 'used', id: ids[0], ids, fuzzy, dist };
    if (fuzzy && free.length > 1) return { status: 'ambiguous', ids: free, fuzzy, dist };
    return { status: 'ok', id: free[0], fuzzy, dist };
  };

  // exact, then simple plural forms
  const variants = [k];
  if (k.length > 3) {
    if (k.endsWith('ies')) variants.push(k.slice(0, -3) + 'y');
    if (k.endsWith('es')) variants.push(k.slice(0, -2));
    if (k.endsWith('s')) variants.push(k.slice(0, -1));
  }
  for (const v of variants) {
    const ids = idx.get(v);
    if (ids) return pick(ids, false, 0);
  }

  // typo tolerance, scaled by length
  const thr = typoAllowance(k.length);
  if (!thr) return { status: 'none' };
  // Ties break toward names longer than the input: dropped letters are the most common typo,
  // so "Nigera" means Nigeria (not Niger) and "Austrlia" means Australia (not Austria).
  const lenClass = key => (key.length > k.length ? 0 : key.length === k.length ? 1 : 2);
  let best = thr + 1, bestClass = 3;
  let bestIds = new Set();
  for (const [key, ids] of idx) {
    if (key.length <= 2) continue;                      // never fuzz onto tiny codes like "TF" or "KL"
    if (key.length <= 5 && key[0] !== k[0]) continue;   // short words must at least start right
    const allowed = Math.min(thr, typoAllowance(key.length));
    if (!allowed) continue;
    const d = osa(k, key, Math.min(best, allowed));
    if (d > allowed) continue;
    const cls = lenClass(key);
    if (d < best || (d === best && cls < bestClass)) { best = d; bestClass = cls; bestIds = new Set(ids); }
    else if (d === best && cls === bestClass) ids.forEach(i => bestIds.add(i));
  }
  if (best > thr || !bestIds.size) return { status: 'none' };
  return pick([...bestIds], true, best);
}

function loadCategory(def) {
  const { answers, problems } = parseBank(def.text);
  const cat = { ...def, answers, problems };
  buildIndex(cat);
  return cat;
}

/* Shared aliases (same key on two answers) are allowed on purpose, e.g. "Adams" or "Los Angeles".
   This reports them so an editor can check they were intended. */
function sharedKeys(cat) {
  const out = [];
  for (const [key, ids] of cat.index) if (ids.length > 1) out.push({ key, names: ids.map(i => cat.answers[i].name) });
  return out;
}
