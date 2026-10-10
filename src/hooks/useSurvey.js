import { useEffect, useMemo, useState } from 'react';
import { DEMO, build, flatten, extent, inRange, inBox, stats, parseCSV } from '../lib/data';
import { PAL } from '../lib/color';

const readHash = () => { try { return Object.fromEntries(new URLSearchParams(location.hash.slice(1))); } catch { return {}; } };

export function useSurvey() {
  const h = useMemo(readHash, []);
  const init = DEMO.find((d) => d.id === h.s) || DEMO[0];
  const [key, setKey] = useState(init.id);
  const [survey, setSurvey] = useState(() => build(init));
  const [li, setLi] = useState(() => Math.max(0, build(init).lines.findIndex((l) => l.id === h.l)));
  const [range, setRange] = useState(h.lo ? [+h.lo, +h.hi] : null);
  const [brush, setBrush] = useState(null);
  const [hover, setHover] = useState(null);
  const [pal, setPal] = useState(PAL[h.p] ? h.p : 'Viridis');
  const [error, setError] = useState('');

  const pts = useMemo(() => flatten(survey), [survey]);
  const ext = useMemo(() => extent(pts), [pts]);
  const activeRange = range || [ext.lo, ext.hi];
  const inBrush = useMemo(() => pts.filter((p) => inBox(p, brush)), [pts, brush]);
  const shown = useMemo(() => inBrush.filter((p) => inRange(p.v, activeRange)), [inBrush, range, ext]);
  const summary = useMemo(() => stats(shown), [shown]);

  const reset = () => { setRange(null); setBrush(null); setHover(null); };
  const loadDemo = (d) => { setSurvey(build(d)); setKey(d.id); setLi(0); reset(); setError(''); };
  const loadFile = async (file) => {
    const { survey: s, skipped } = parseCSV(await file.text(), file.name);
    if (!s.lines.length) return setError('No usable rows found. Expected a header row, then columns: line, lon, lat, value.');
    setSurvey(s); setKey('custom'); setLi(0); reset();
    setError(skipped ? `Loaded ${file.name}. Skipped ${skipped} rows that were not numbers.` : '');
  };
  const stepLine = (d) => setLi((i) => Math.max(0, Math.min(survey.lines.length - 1, i + d)));

  useEffect(() => {
    const q = new URLSearchParams({ s: key, l: survey.lines[li]?.id ?? '', p: pal });
    if (range) { q.set('lo', Math.round(range[0])); q.set('hi', Math.round(range[1])); }
    try { history.replaceState(null, '', '#' + q); } catch { /* ignore */ }
  }, [key, li, range, pal, survey]);

  return { key, survey, pts, ext, li, setLi, stepLine, range, activeRange, setRange, brush, setBrush, hover, setHover, pal, setPal, inBrush, shown, summary, reset, loadDemo, loadFile, error };
}
