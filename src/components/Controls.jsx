import { DEMO } from '../lib/data';
import { PAL } from '../lib/color';

const btn = 'rounded-xl border px-3 py-2.5 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sea/40 ';
export default function Controls({ s }) {
  const [lo, hi] = s.activeRange;
  return (
    <div className="space-y-6">
      <section aria-labelledby="h-survey" className="space-y-3">
        <h2 id="h-survey" className="text-base font-semibold text-slate-900">Survey</h2>
        <div className="space-y-2">
          {DEMO.map((d) => (
            <button key={d.id} onClick={() => s.loadDemo(d)} aria-pressed={s.key === d.id} className={btn + (s.key === d.id ? 'border-sea bg-sea text-white shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white')}>
              <span className="block font-medium">{d.name}</span>
              <span className={s.key === d.id ? 'mt-0.5 block text-xs text-cyan-100' : 'mt-0.5 block text-xs text-slate-500'}>{d.place}, {d.n} lines</span>
            </button>
          ))}
        </div>
        <label className="block pt-1 text-sm">
          <span className="mb-2 block text-slate-600">Open a CSV file (columns: line, lon, lat, value)</span>
          <input type="file" accept=".csv" onChange={(e) => e.target.files[0] && s.loadFile(e.target.files[0])} className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-sea file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white file:shadow-sm hover:file:bg-sea/90" />
        </label>
        {s.error && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-900">{s.error}</p>}
      </section>

      <section aria-labelledby="h-filter" className="space-y-3">
        <h2 id="h-filter" className="text-base font-semibold text-slate-900">Show values between</h2>
        <label className="block text-sm text-slate-700">
          <div className="mb-1.5 flex items-center justify-between gap-3"><span>Lowest</span><b className="font-semibold text-slate-900">{Math.round(lo)} nT</b></div>
          <input type="range" className="w-full accent-sea" min={s.ext.lo} max={s.ext.hi} value={lo} onChange={(e) => s.setRange([Math.min(+e.target.value, hi), hi])} />
        </label>
        <label className="block text-sm text-slate-700">
          <div className="mb-1.5 flex items-center justify-between gap-3"><span>Highest</span><b className="font-semibold text-slate-900">{Math.round(hi)} nT</b></div>
          <input type="range" className="w-full accent-sea" min={s.ext.lo} max={s.ext.hi} value={hi} onChange={(e) => s.setRange([lo, Math.max(+e.target.value, lo)])} />
        </label>
      </section>

      <section aria-labelledby="h-pal" className="space-y-3">
        <h2 id="h-pal" className="text-base font-semibold text-slate-900">Colours</h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PAL).map((p) => (
            <button key={p} onClick={() => s.setPal(p)} aria-pressed={s.pal === p} className={btn + 'min-w-[5.5rem] ' + (s.pal === p ? 'border-sea bg-sea text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50')}>{p}</button>
          ))}
        </div>
        <p className="text-xs leading-5 text-slate-500">Cividis stays readable for colour-blind viewers.</p>
      </section>

      <button onClick={s.reset} className="flex items-center gap-2 text-sm font-medium text-sea underline decoration-sea/40 underline-offset-4 transition hover:text-sea/75">Clear filters and region (Esc)</button>
    </div>
  );
}
