# Airborne Magnetic Survey Viewer

An interactive web app for exploring airborne magnetic survey data: a map of flight lines, a profile along any line, a value histogram, and filters that all update together.

Built with React, Vite and Tailwind CSS as a portfolio project.

<!-- Add a screenshot or GIF here: docs/screenshot.png -->

## Why this exists

Airborne geophysical surveys produce millions of readings along parallel flight lines. The raw files are hard to read for anyone who is not already working in the field. This project explores how to make that kind of data approachable: clear defaults, linked views, and controls that explain themselves.

## What it does

- **Map of flight lines:** each reading is a point coloured by total magnetic field intensity (nT). It is drawn on canvas rather than SVG so it can handle many points.
- **Region selection:** drag a box on the map. The statistics and histogram recalculate for that area only.
- **Linked views:** hovering a point on the map marks its position on the profile, and hovering the profile marks it on the map. Click a point to choose its line.
- **Intensity filter:** two sliders limit which values are shown. Values outside the range fade on the map and histogram. Clicking a histogram bar sets the filter to that bin.
- **Colour palettes:** Viridis, Inferno and Cividis (Cividis is designed to stay readable with colour-vision deficiency).
- **Keyboard support:** arrow keys step through flight lines and Escape clears filters and selection. Controls are labelled for screen readers.
- **Shareable state:** the survey, selected line, filter range and palette are stored in the URL hash.
- **Bring your own data:** open a CSV file from the file picker. Bad files produce a clear message, and malformed rows are skipped and counted.
- **Reduced motion:** animation is disabled for visitors who request it.

## Data

The three built-in surveys (Block A, B and C) are **synthetic**. They are generated in `src/lib/data.js` to look like profile data: parallel lines with smooth anomalies, a regional trend and noise. They are for demonstration only and do not represent real geology.

To view real data:

1. Find a survey in the Geoscience Data Repository run by Natural Resources Canada (gdr.agg.nrcan.gc.ca), which hosts aeromagnetic data.
2. Check the licence for that dataset before reusing it. Many Government of Canada datasets use the Open Government Licence - Canada, but confirm it for each one.
3. Export it as CSV with this layout, with a header row first:

```csv
line,lon,lat,value
L1000,-94.100,49.400,58912.4
L1000,-94.100,49.403,58915.1
L1010,-94.081,49.400,58907.8
```

4. Open it with the file picker in the app, and credit the source in your own copy of this README.

## Getting started

Requires Node.js 18 or newer.

```bash
npm install
npm run dev       # start the dev server
npm test          # run unit tests
npm run build     # production build in dist/
npm run preview   # serve the production build locally
```

`vite.config.js` uses a relative base path, so the contents of `dist/` can be hosted on GitHub Pages, Netlify or any static host.

## Project structure

```
src/
  App.jsx                  page layout and keyboard shortcuts
  hooks/useSurvey.js       survey, filter, selection and URL-hash state
  lib/
    data.js                demo data, CSV parsing, filtering, statistics
    geo.js                 map projection and its inverse
    color.js               palettes and colour interpolation
    data.test.js           unit tests
  components/
    MapCanvas.jsx          canvas map with brush selection and hover
    Profile.jsx            profile chart along one line
    Histogram.jsx          value distribution, click to filter
    Controls.jsx           survey picker, file input, filters, palette
```

Design decisions:

- **Pure logic is separate from UI.** Parsing, filtering and projection live in `lib/` as plain functions, which keeps them testable without a browser.
- **One state hook.** `useSurvey` owns all shared state, so components stay presentational.
- **Two canvases for the map.** The point layer redraws only when data or filters change. A lightweight overlay handles hover, the selected line and the selection box, so mouse movement stays cheap.
- **Selection in map coordinates.** The selection box is stored as longitude and latitude bounds, not pixels, so it stays correct if the map is resized.

## Testing

`npm test` runs Vitest unit tests covering CSV parsing (grouping by line, skipping bad rows, empty files), extent calculation, and range and box filtering. The UI itself has no automated tests yet.

## Known limitations

- The map has no zoom or pan.
- Hover looks up the nearest point by scanning every point. This is fine for the demo data but will need a spatial index for very large surveys.
- Each point's colour is recomputed on every redraw. Precomputing a colour lookup table would speed this up.
- Performance on large real surveys has not been measured.
- No derived products yet (for example vertical derivative, tilt angle or gridded maps).
- Flight lines are drawn as points in the order given, with no handling of tie lines or crossover checks.

## Roadmap

- [ ] Zoom and pan on the map
- [ ] Multi-line profile overlay
- [ ] Derived layers: first vertical derivative and tilt angle
- [ ] Anomaly table with amplitude and width
- [ ] Spatial index for hover and selection
- [ ] Component tests and an end-to-end smoke test
- [ ] TypeScript migration

## About magnetic survey data

The values shown are the total magnetic field measured from an aircraft, in nanotesla (nT). Local variations in the field, called anomalies, can reflect differences in the magnetic minerals in the rocks below, which is why the data is used in mineral exploration and geological mapping. This project only displays values. It does not interpret them.

## Licence

Choose a licence for your repository (MIT is common for portfolio projects) and add a `LICENSE` file.
