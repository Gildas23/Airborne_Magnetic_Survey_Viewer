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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.18),_transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eaf6fb_100%)] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-2xl border border-slate-200/80 bg-white/75 px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center rounded-full border border-sea/20 bg-cyan-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-sea">Magnetic survey dashboard</p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Airborne magnetic survey viewer</h1>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">Total magnetic field along flight lines. Drag on the map to pick a region, click a point to choose its line, or use the arrow keys to step through lines.</p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0 space-y-5">
            <section className="rounded-2xl border border-slate-800/70 bg-slate-950 p-4 text-white shadow-[0_24px_60px_rgba(15,23,42,0.28)] sm:p-5" aria-label="Map">
              <div className="mb-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold tracking-tight text-slate-100">{s.survey.name}, line {line.id}</h2>
                <span aria-live="polite" className="rounded-full border border-slate-700 bg-slate-900/75 px-2.5 py-1 text-xs text-slate-300">
                  {hv ? `${hv.v.toFixed(1)} nT at ${hv.lat.toFixed(4)}° N, ${Math.abs(hv.lon).toFixed(4)}° ${hv.lon < 0 ? 'W' : 'E'}` : 'Hover a point to read its value'}
                </span>
              </div>
              <MapCanvas survey={s.survey} pts={s.pts} ext={s.ext} range={s.activeRange} brush={s.brush} pal={s.pal} li={s.li}
                hover={s.hover} onHover={s.setHover} onSelectLine={s.setLi} onBrush={s.setBrush} />
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-[11px] text-slate-300">
                <span className="font-medium text-slate-100">{s.ext.lo}</span>
                <div className="h-2.5 flex-1 rounded-full shadow-inner" style={{ background: gradient(s.pal) }} />
                <span className="font-medium text-slate-100">{s.ext.hi} nT</span>
              </div>
            </section>

            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[['Points', fmt(m?.n)], ['Mean (nT)', fmt(m?.mean)], ['Lowest (nT)', fmt(m?.lo)], ['Highest (nT)', fmt(m?.hi)]].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm ring-1 ring-slate-100">
                  <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">{k}</dt>
                  <dd className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="grid gap-5 md:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white/90 p-3.5 shadow-[0_12px_38px_rgba(15,23,42,0.06)] sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-slate-900">Profile</h2>
                  <div className="flex items-center gap-1.5 text-sm">
                    <button aria-label="Previous line" onClick={() => s.stepLine(-1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-lg text-slate-600 transition hover:border-sea/60 hover:bg-cyan-50 hover:text-sea">&lsaquo;</button>
                    <select value={s.li} onChange={(e) => s.setLi(+e.target.value)} aria-label="Choose line" className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-sea focus:ring-2 focus:ring-sea/20">
                      {s.survey.lines.map((l, i) => <option key={l.id} value={i}>{l.id}</option>)}
                    </select>
                    <button aria-label="Next line" onClick={() => s.stepLine(1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-lg text-slate-600 transition hover:border-sea/60 hover:bg-cyan-50 hover:text-sea">&rsaquo;</button>
                  </div>
                </div>
                <Profile line={line} ext={s.ext} range={s.activeRange} hoverIdx={s.hover?.li === s.li ? s.hover.pi : null} onHover={(pi) => s.setHover(pi == null ? null : { li: s.li, pi })} />
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white/90 p-3.5 shadow-[0_12px_38px_rgba(15,23,42,0.06)] sm:p-4">
                <h2 className="mb-3 text-base font-semibold text-slate-900">Value distribution</h2>
                <Histogram pts={s.inBrush} ext={s.ext} range={s.activeRange} pal={s.pal} onPick={s.setRange} />
                <p className="mt-2 text-xs text-slate-500">Click a bar to show only that range.</p>
              </section>
            </div>
          </main>
          <aside className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-[0_12px_38px_rgba(15,23,42,0.06)] sm:p-5">
            <Controls s={s} />
          </aside>
        </div>

        <footer className="mt-8 max-w-prose text-sm leading-6 text-slate-500">
          The built-in surveys are synthetic. To view real data, export a survey from NRCan's Geoscience Data Repository, convert it to CSV, and open it with the file picker. Check the dataset's licence before reusing it.
        </footer>
      </div>
    </div>
  );
}
