// The ONE basemap definition every Leaflet map uses (locations, contact,
// product finder). CARTO's free basemap tiles started demanding an API key on
// 2026-10-20 ("API KEY REQUIRED" watermarked every map), so tiles now come
// from openstreetmap.org directly: no key, no vendor account. OSM has no dark
// style, so the dark look is recreated in CSS — `className` below lands on the
// tile container and `.jb-tiles-dark` in globals.css inverts/desaturates it.
// Pins, clusters and controls live in other panes and are untouched.
// OSM has no retina `{r}` variant and no `{s}` subdomains.

export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

export const TILE_OPTIONS = {
  maxZoom: 19,
  className: 'jb-tiles-dark',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}
