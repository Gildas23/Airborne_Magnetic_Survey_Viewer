const rng = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;

export const DEMO = [
  { id: 'a', name: 'Block A', place: 'NW Ontario', lat: 49.4, lon: -94.1, n: 22, m: 110, seed: 7, base: 58900 },
  { id: 'b', name: 'Block B', place: 'Sudbury area', lat: 46.5, lon: -80.9, n: 18, m: 120, seed: 21, base: 57400 },
  { id: 'c', name: 'Block C', place: 'Ottawa Valley', lat: 45.3, lon: -76.2, n: 26, m: 90, seed: 3, base: 56100 },
];

/** Synthetic survey shaped like profile data: lines of {lon, lat, v} where v is total field in nT. */
export function build(s) {
  const r = rng(s.seed);
  const an = Array.from({ length: 6 }, () => ({ x: r(), y: r(), a: (r() - 0.4) * 900, w: 0.05 + r() * 0.1 }));
  const lines = [];
  for (let i = 0; i < s.n; i++) {
    const x = i / (s.n - 1), pts = [];
    for (let j = 0; j < s.m; j++) {
      const y = j / (s.m - 1);
      let v = s.base + (y - 0.5) * 180 + (x - 0.5) * 120 + (r() - 0.5) * 14;
      for (const a of an) v += a.a * Math.exp(-((x - a.x) ** 2 + (y - a.y) ** 2) / (2 * a.w ** 2));
      pts.push({ lon: s.lon + x * 0.4, lat: s.lat + y * 0.3, v });
    }
    lines.push({ id: 'L' + (1000 + i * 10), pts });
  }
  return { name: `${s.name} (demo)`, lines };
}

/** Parse "line,lon,lat,value" CSV. Skips malformed rows and reports how many. */
export function parseCSV(text, name) {
  const groups = new Map();
  let skipped = 0;
  text.trim().split(/\r?\n/).slice(1).forEach((row) => {
    const [line, lon, lat, v] = row.split(',').map((x) => x.trim());
    if (!line || [lon, lat, v].some((x) => x === undefined || x === '' || Number.isNaN(+x))) { skipped++; return; }
    if (!groups.has(line)) groups.set(line, []);
    groups.get(line).push({ lon: +lon, lat: +lat, v: +v });
  });
  return { survey: { name, lines: [...groups].map(([id, pts]) => ({ id, pts })) }, skipped };
}

export function flatten(survey) {
  const pts = [];
  survey.lines.forEach((l, li) => l.pts.forEach((p, pi) => pts.push({ ...p, li, pi })));
  return pts;
}

export function extent(pts) {
  const e = { lo: Infinity, hi: -Infinity, a: Infinity, b: -Infinity, c: Infinity, d: -Infinity };
  for (const p of pts) {
    if (p.v < e.lo) e.lo = p.v; if (p.v > e.hi) e.hi = p.v;
    if (p.lon < e.a) e.a = p.lon; if (p.lon > e.b) e.b = p.lon;
    if (p.lat < e.c) e.c = p.lat; if (p.lat > e.d) e.d = p.lat;
  }
  e.lo = Math.floor(e.lo); e.hi = Math.ceil(e.hi);
  return e;
}

export const inRange = (v, [lo, hi]) => v >= lo && v <= hi;
export const inBox = (p, b) => !b || (p.lon >= b.lon0 && p.lon <= b.lon1 && p.lat >= b.lat0 && p.lat <= b.lat1);

export function stats(pts) {
  if (!pts.length) return null;
  let lo = Infinity, hi = -Infinity, sum = 0;
  for (const p of pts) { if (p.v < lo) lo = p.v; if (p.v > hi) hi = p.v; sum += p.v; }
  return { n: pts.length, lo, hi, mean: sum / pts.length };
}
