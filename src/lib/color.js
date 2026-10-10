export const PAL = {
  Viridis: [[68, 1, 84], [59, 82, 139], [33, 145, 140], [94, 201, 98], [253, 231, 37]],
  Inferno: [[0, 0, 4], [87, 16, 110], [188, 55, 84], [249, 142, 9], [252, 255, 164]],
  Cividis: [[0, 32, 77], [68, 88, 120], [124, 123, 120], [187, 162, 92], [255, 234, 70]],
};
export function color(t, pal) {
  const S = PAL[pal];
  t = Math.max(0, Math.min(1, t)) * (S.length - 1);
  const i = Math.min(Math.floor(t), S.length - 2), f = t - i;
  return `rgb(${S[i].map((c, k) => Math.round(c + (S[i + 1][k] - c) * f)).join(',')})`;
}
export const gradient = (pal) => `linear-gradient(to right, ${PAL[pal].map((s) => `rgb(${s})`).join(',')})`;
