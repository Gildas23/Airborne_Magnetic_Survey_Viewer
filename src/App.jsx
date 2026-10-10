import { useEffect } from 'react';
import { useSurvey } from './hooks/useSurvey';
import { gradient } from './lib/color';
import MapCanvas from './components/MapCanvas';
import Profile from './components/Profile';
import Histogram from './components/Histogram';
import Controls from './components/Controls';

const fmt = (n) => (n == null ? '-' : Math.round(n).toLocaleString());

export default function App() {
  const s = useSurvey();
  const line = s.survey.lines[s.li] || s.survey.lines[0];

  useEffect(() => {
    const f = (e) => {
      if (['INPUT', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') s.stepLine(1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') s.stepLine(-1);
      if (e.key === 'Escape') s.reset();
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  });

  const hv = s.hover && s.survey.lines[s.hover.li]?.pts[s.hover.pi];
  const m = s.summary;
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold">Airborne magnetic survey viewer</h1>
        <p className="text-slate-600 max-w-prose">Total magnetic field along flight lines. Drag on the map to pick a region, click a point to choose its line, or use the arrow keys to step through lines.</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <main className="min-w-0 space-y-5">
          <section className="rounded-lg bg-ink text-white p-3" aria-label="Map">
            <div className="flex flex-wrap justify-between gap-2 text-sm mb-2">
              <h2 className="font-semibold">{s.survey.name}, line {line.id}</h2>
              <span aria-live="polite" className="text-slate-300">
                {hv ? `${hv.v.toFixed(1)} nT at ${hv.lat.toFixed(4)}° N, ${Math.abs(hv.lon).toFixed(4)}° ${hv.lon < 0 ? 'W' : 'E'}` : 'Hover a point to read its value'}
              </span>
            </div>
            <MapCanvas survey={s.survey} pts={s.pts} ext={s.ext} range={s.activeRange} brush={s.brush} pal={s.pal} li={s.li}
              hover={s.hover} onHover={s.setHover} onSelectLine={s.setLi} onBrush={s.setBrush} />
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
              <span>{s.ext.lo}</span><div className="h-2.5 flex-1 rounded" style={{ background: gradient(s.pal) }} /><span>{s.ext.hi} nT</span>
            </div>
          </section>

          <dl className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-300 rounded-lg bg-white border border-slate-200 text-center">
            {[['Points', fmt(m?.n)], ['Mean (nT)', fmt(m?.mean)], ['Lowest (nT)', fmt(m?.lo)], ['Highest (nT)', fmt(m?.hi)]].map(([k, v]) => (
              <div key={k} className="py-3"><dt className="text-xs text-slate-500">{k}</dt><dd className="text-xl font-semibold">{v}</dd></div>
            ))}
          </dl>

          <div className="grid md:grid-cols-2 gap-5">
            <section className="rounded-lg bg-white border border-slate-200 p-3">
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-semibold">Profile</h2>
                <div className="flex items-center gap-1 text-sm">
                  <button aria-label="Previous line" onClick={() => s.stepLine(-1)} className="px-2 rounded hover:bg-mist">&lsaquo;</button>
                  <select value={s.li} onChange={(e) => s.setLi(+e.target.value)} aria-label="Choose line" className="rounded border border-slate-300 bg-white px-1 py-0.5">
                    {s.survey.lines.map((l, i) => <option key={l.id} value={i}>{l.id}</option>)}
                  </select>
                  <button aria-label="Next line" onClick={() => s.stepLine(1)} className="px-2 rounded hover:bg-mist">&rsaquo;</button>
                </div>
              </div>
              <Profile line={line} ext={s.ext} range={s.activeRange} hoverIdx={s.hover?.li === s.li ? s.hover.pi : null} onHover={(pi) => s.setHover(pi == null ? null : { li: s.li, pi })} />
            </section>
            <section className="rounded-lg bg-white border border-slate-200 p-3">
              <h2 className="font-semibold mb-1">Value distribution</h2>
              <Histogram pts={s.inBrush} ext={s.ext} range={s.activeRange} pal={s.pal} onPick={s.setRange} />
              <p className="text-xs text-slate-500">Click a bar to show only that range.</p>
            </section>
          </div>
        </main>
        <aside><Controls s={s} /></aside>
      </div>

      <footer className="mt-8 text-xs text-slate-500 max-w-prose">
        The built-in surveys are synthetic. To view real data, export a survey from NRCan's Geoscience Data Repository, convert it to CSV, and open it with the file picker. Check the dataset's licence before reusing it.
      </footer>
    </div>
  );
}
