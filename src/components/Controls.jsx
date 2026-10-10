import { DEMO } from '../lib/data';
import { PAL } from '../lib/color';

const btn = 'rounded-md px-3 py-2 text-sm text-left focus:outline-none focus-visible:ring-2 ring-sea ';
export default function Controls({ s }) {
  const [lo, hi] = s.activeRange;
  return (
    <div className="space-y-6">
      <section aria-labelledby="h-survey">
        <h2 id="h-survey" className="font-semibold mb-2">Survey</h2>
        <div className="flex flex-col gap-1">
          {DEMO.map((d) => (
            <button key={d.id} onClick={() => s.loadDemo(d)} aria-pressed={s.key === d.id} className={btn + (s.key === d.id ? 'bg-ink text-white' : 'hover:bg-white')}>
              <span className="font-medium">{d.name}</span> <span className={s.key === d.id ? 'text-slate-300' : 'text-slate-500'}>{d.place}, {d.n} lines</span>
            </button>
          ))}
        </div>
        <label className="block mt-3 text-sm">
          <span className="block mb-1 text-slate-600">Open a CSV file (columns: line, lon, lat, value)</span>
          <input type="file" accept=".csv" onChange={(e) => e.target.files[0] && s.loadFile(e.target.files[0])} className="text-xs w-full" />
        </label>
        {s.error && <p role="status" className="mt-2 text-sm text-amber-800 bg-amber-50 rounded-md p-2">{s.error}</p>}
      </section>

      <section aria-labelledby="h-filter">
        <h2 id="h-filter" className="font-semibold mb-2">Show values between</h2>
        <label className="block text-sm">Lowest: <b>{Math.round(lo)} nT</b>
          <input type="range" className="w-full accent-sea" min={s.ext.lo} max={s.ext.hi} value={lo} onChange={(e) => s.setRange([Math.min(+e.target.value, hi), hi])} />
        </label>
        <label className="block text-sm mt-1">Highest: <b>{Math.round(hi)} nT</b>
          <input type="range" className="w-full accent-sea" min={s.ext.lo} max={s.ext.hi} value={hi} onChange={(e) => s.setRange([lo, Math.max(+e.target.value, lo)])} />
        </label>
      </section>

      <section aria-labelledby="h-pal">
        <h2 id="h-pal" className="font-semibold mb-2">Colours</h2>
        <div className="flex gap-1 flex-wrap">
          {Object.keys(PAL).map((p) => (
            <button key={p} onClick={() => s.setPal(p)} aria-pressed={s.pal === p} className={btn + 'border border-slate-300 ' + (s.pal === p ? 'bg-sea text-white border-sea' : 'bg-white')}>{p}</button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-1">Cividis stays readable for colour-blind viewers.</p>
      </section>

      <button onClick={s.reset} className="text-sm underline text-sea">Clear filters and region (Esc)</button>
    </div>
  );
}
