/** Equirectangular projection fitted to the survey extent. */
export function makeProj(ext, W = 720) {
  const k = Math.cos((((ext.c + ext.d) / 2) * Math.PI) / 180);
  const H = Math.max(260, Math.min(560, (W * (ext.d - ext.c)) / ((ext.b - ext.a) * k || 1)));
  const m = 24;
  return {
    W, H,
    toXY: (p) => [m + ((p.lon - ext.a) / (ext.b - ext.a)) * (W - 2 * m), m + (1 - (p.lat - ext.c) / (ext.d - ext.c)) * (H - 2 * m)],
    toLL: (x, y) => ({ lon: ext.a + ((x - m) / (W - 2 * m)) * (ext.b - ext.a), lat: ext.c + (1 - (y - m) / (H - 2 * m)) * (ext.d - ext.c) }),
  };
}
