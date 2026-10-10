import { describe, it, expect } from 'vitest';
import { parseCSV, extent, inBox, inRange, stats, build, DEMO, flatten } from './data';

describe('parseCSV', () => {
  it('groups rows by line and skips malformed rows', () => {
    const { survey, skipped } = parseCSV('line,lon,lat,value\nL1,-80,45,57000\nL1,-80,45.1,57010\nL2,-79.9,45,abc\nL2,-79.9,45.1,57020\n,,,', 't.csv');
    expect(survey.lines.map((l) => [l.id, l.pts.length])).toEqual([['L1', 2], ['L2', 1]]);
    expect(skipped).toBe(2);
  });
  it('returns no lines for an empty file', () => {
    expect(parseCSV('line,lon,lat,value', 'e.csv').survey.lines).toHaveLength(0);
  });
});

describe('filters', () => {
  const pts = flatten(build(DEMO[0]));
  it('computes an extent that contains every point', () => {
    const e = extent(pts);
    expect(pts.every((p) => p.v >= e.lo && p.v <= e.hi)).toBe(true);
  });
  it('filters by value range and box', () => {
    expect(inRange(5, [1, 5])).toBe(true);
    expect(inRange(6, [1, 5])).toBe(false);
    expect(inBox({ lon: 1, lat: 1 }, { lon0: 0, lon1: 2, lat0: 0, lat1: 2 })).toBe(true);
    expect(inBox({ lon: 3, lat: 1 }, { lon0: 0, lon1: 2, lat0: 0, lat1: 2 })).toBe(false);
    expect(inBox({ lon: 3, lat: 1 }, null)).toBe(true);
  });
  it('handles empty selections', () => { expect(stats([])).toBeNull(); });
});
