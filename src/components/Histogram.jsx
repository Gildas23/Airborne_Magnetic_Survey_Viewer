import { color } from '../lib/color';
const CW = 560, CH = 190, N = 24;
export default function Histogram({ pts, ext, range, pal, onPick }) {
  const span = ext.hi - ext.lo || 1;
  const bins = Array(N).fill(0);
  pts.forEach((p) => { bins[Math.min(N - 1, Math.floor(((p.v - ext.lo) / span) * N))]++; });
  const max = Math.max(1, ...bins);
  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full" role="img" aria-label="Histogram of intensity values. Click a bar to filter to that range.">
      {bins.map((c, i) => {
        const lo = ext.lo + (i / N) * span, hi = ext.lo + ((i + 1) / N) * span, mid = (lo + hi) / 2, h = (c / max) * (CH - 45);
        return (
          <g key={i} onClick={() => onPick([Math.floor(lo), Math.ceil(hi)])} className="cursor-pointer">
            <rect x={10 + i * 22.5} y="0" width="21" height={CH - 25} fill="transparent" />
            <rect x={10 + i * 22.5} y={CH - 25 - h} width="19" height={h} rx="2" fill={color((mid - ext.lo) / span, pal)} opacity={mid >= range[0] && mid <= range[1] ? 1 : 0.2} />
          </g>
        );
      })}
      <text x="10" y={CH - 8} fontSize="10" fill="currentColor" opacity="0.6">{ext.lo}</text>
      <text x={CW - 10} y={CH - 8} fontSize="10" fill="currentColor" opacity="0.6" textAnchor="end">{ext.hi} nT</text>
    </svg>
  );
}
