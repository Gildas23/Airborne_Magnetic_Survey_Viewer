const CW = 560, CH = 190, L = 46;
export default function Profile({ line, ext, range, hoverIdx, onHover }) {
  const n = line.pts.length, span = ext.hi - ext.lo || 1;
  const cx = (i) => L + (i / (n - 1)) * (CW - L - 12);
  const cy = (v) => 12 + (1 - (v - ext.lo) / span) * (CH - 40);
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((((e.clientX - r.left) * CW) / r.width - L) / (CW - L - 12)) * (n - 1));
    onHover(Math.max(0, Math.min(n - 1, i)));
  };
  const ticks = [0, 0.5, 1].map((t) => ext.lo + t * span);
  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full cursor-crosshair" onPointerMove={move} onPointerLeave={() => onHover(null)} role="img" aria-label={`Magnetic profile along line ${line.id}`}>
      <rect x={L} y={cy(range[1])} width={CW - L - 12} height={Math.max(1, cy(range[0]) - cy(range[1]))} className="fill-sea" opacity="0.12" />
      {ticks.map((t) => (
        <g key={t}><line x1={L} x2={CW - 12} y1={cy(t)} y2={cy(t)} stroke="currentColor" opacity="0.12" /><text x="2" y={cy(t) + 3} fontSize="10" fill="currentColor" opacity="0.6">{Math.round(t)}</text></g>
      ))}
      <polyline fill="none" className="stroke-sea" strokeWidth="1.8" points={line.pts.map((p, i) => `${cx(i)},${cy(p.v)}`).join(' ')} />
      {hoverIdx != null && <g><line x1={cx(hoverIdx)} x2={cx(hoverIdx)} y1="10" y2={CH - 28} stroke="currentColor" strokeDasharray="3 3" opacity="0.6" /><circle cx={cx(hoverIdx)} cy={cy(line.pts[hoverIdx].v)} r="4.5" className="fill-sea" /></g>}
      <text x={L} y={CH - 8} fontSize="10" fill="currentColor" opacity="0.6">Distance along line, south to north (nT)</text>
    </svg>
  );
}
