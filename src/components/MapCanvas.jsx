import { useEffect, useMemo, useRef, useState } from 'react';
import { color } from '../lib/color';
import { makeProj } from '../lib/geo';
import { inRange, inBox } from '../lib/data';

/** Two stacked canvases: points (redrawn on filter changes) and an overlay (hover, line, brush box). */
export default function MapCanvas({ survey, pts, ext, range, brush, pal, li, hover, onHover, onSelectLine, onBrush }) {
  const base = useRef(null), over = useRef(null);
  const [drag, setDrag] = useState(null);
  const proj = useMemo(() => makeProj(ext), [ext]);
  const { W, H } = proj;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const xy = useMemo(() => {
    const a = new Float32Array(pts.length * 2);
    pts.forEach((p, i) => { const [x, y] = proj.toXY(p); a[2 * i] = x; a[2 * i + 1] = y; });
    return a;
  }, [pts, proj]);

  useEffect(() => {
    const g = base.current.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const span = ext.hi - ext.lo || 1;
    pts.forEach((p, i) => {
      g.globalAlpha = inRange(p.v, range) && inBox(p, brush) ? 1 : 0.1;
      g.fillStyle = color((p.v - ext.lo) / span, pal);
      g.fillRect(xy[2 * i] - 1.3, xy[2 * i + 1] - 1.3, 2.6, 2.6);
    });
  }, [pts, xy, range, brush, pal, ext, W, H, dpr]);

  useEffect(() => {
    const g = over.current.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const l = survey.lines[li];
    if (l) {
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1.5; g.beginPath();
      l.pts.forEach((p, i) => { const [x, y] = proj.toXY(p); i ? g.lineTo(x, y) : g.moveTo(x, y); });
      g.stroke();
    }
    let r = drag;
    if (!r && brush) {
      const [x0, y0] = proj.toXY({ lon: brush.lon0, lat: brush.lat1 }), [x1, y1] = proj.toXY({ lon: brush.lon1, lat: brush.lat0 });
      r = { x0, y0, x1, y1 };
    }
    if (r) { g.fillStyle = 'rgba(14,116,144,.2)'; g.strokeStyle = '#67e8f9'; g.setLineDash([5, 3]); g.fillRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0); g.strokeRect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0); g.setLineDash([]); }
    const hp = hover && survey.lines[hover.li]?.pts[hover.pi];
    if (hp) { const [x, y] = proj.toXY(hp); g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 7, 0, 7); g.stroke(); }
  }, [survey, li, hover, brush, drag, proj, W, H, dpr]);

  const at = (e) => { const r = over.current.getBoundingClientRect(); return [((e.clientX - r.left) * W) / r.width, ((e.clientY - r.top) * H) / r.height]; };
  const nearest = (x, y) => {
    let best = -1, d = 144;
    for (let i = 0; i < pts.length; i++) { const dx = xy[2 * i] - x, dy = xy[2 * i + 1] - y, s = dx * dx + dy * dy; if (s < d) { d = s; best = i; } }
    return best < 0 ? null : pts[best];
  };
  const down = (e) => { const [x, y] = at(e); setDrag({ sx: x, sy: y, x0: x, y0: y, x1: x, y1: y }); e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e) => {
    const [x, y] = at(e);
    if (drag) return setDrag({ ...drag, x0: Math.min(drag.sx, x), x1: Math.max(drag.sx, x), y0: Math.min(drag.sy, y), y1: Math.max(drag.sy, y) });
    const p = nearest(x, y); onHover(p ? { li: p.li, pi: p.pi } : null);
  };
  const up = () => {
    if (!drag) return;
    if (drag.x1 - drag.x0 > 8 && drag.y1 - drag.y0 > 8) {
      const a = proj.toLL(drag.x0, drag.y0), b = proj.toLL(drag.x1, drag.y1);
      onBrush({ lon0: a.lon, lon1: b.lon, lat0: b.lat, lat1: a.lat });
    } else { const p = nearest(drag.sx, drag.sy); if (p) onSelectLine(p.li); }
    setDrag(null);
  };

  const size = { aspectRatio: `${W} / ${H}` };
  return (
    <div className="relative w-full" style={size}>
      <canvas ref={base} width={W * dpr} height={H * dpr} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <canvas ref={over} width={W * dpr} height={H * dpr} className="absolute inset-0 w-full h-full cursor-crosshair"
        role="img" aria-label="Map of flight lines coloured by magnetic intensity. Drag to select a region, click a point to choose its line."
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={() => onHover(null)} />
    </div>
  );
}
