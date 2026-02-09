#!/usr/bin/env node
/**
 * Merge NYC rapid + regional-rail routes and normalize the in-game line labels.
 *
 * Why this exists:
 * - We want a single combined FeatureCollection in both
 *   public/data/ny/rapid/routes.json and public/data/ny/regional-rail/routes.json.
 * - Certain legacy route names (e.g., “IRT Flushing Line”, “GS”) should be
 *   replaced with the short in-game labels (e.g., “7”, “42 st shuttle”).
 *
 * Usage: node scripts/merge-ny-routes.js
 */

const fs = require('fs');
const path = require('path');

const files = {
  rapidRoutes: path.join('public', 'data', 'ny', 'rapid', 'routes.json'),
  regionalRoutes: path.join('public', 'data', 'ny', 'regional-rail', 'routes.json'),
  rapidFeatures: path.join('public', 'data', 'ny', 'rapid', 'features.json'),
  regionalFeatures: path.join('public', 'data', 'ny', 'regional-rail', 'features.json'),
};

// Map legacy / descriptive names to the short in-game labels.
const NAME_MAPPING = new Map([
  ['IRT 42nd Street Line', '42 st shuttle'],
  ['GS', '42 st shuttle'],
  ['IRT Flushing Line', '7'],
  ['IRT Flushing Line (Express)', '7'],
  ['<7>', '7'],
  ['IRT Pelham Line', '6'],
  ['IRT Lexington Avenue Line', '6'],
  ['<6>', '6'],
  ['BMT Canarsie Line', 'L'],
  ['IRT Broadway–Seventh Avenue Line', '1'],
  ['Staten Island Railway', 'SIR'],
  ['AirTrain Newark', 'EWR airtrain'],
]);

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function normalizeNames(features) {
  let renamed = 0;
  for (const f of features) {
    if (!f?.properties) continue;
    const current = f.properties.name;
    if (!NAME_MAPPING.has(current)) continue;
    const next = NAME_MAPPING.get(current);
    if (next !== current) {
      f.properties.name = next;
      renamed += 1;
    }
  }
  return renamed;
}

function dedupeFeatures(features) {
  const seen = new Set();
  const out = [];
  for (const f of features) {
    const key = JSON.stringify({ geom: f.geometry, props: f.properties });
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}

function main() {
  const rapidRoutes = readJson(files.rapidRoutes);
  const regionalRoutes = readJson(files.regionalRoutes);
  const rapidFeatures = readJson(files.rapidFeatures);
  const regionalFeatures = readJson(files.regionalFeatures);

  const renamedRapid = normalizeNames(rapidRoutes.features);
  const renamedRegional = normalizeNames(regionalRoutes.features);

  const mergedRoutes = dedupeFeatures([...rapidRoutes.features, ...regionalRoutes.features]);
  const mergedRoutesFc = { type: 'FeatureCollection', features: mergedRoutes };

  const mergedStops = dedupeFeatures([...rapidFeatures.features, ...regionalFeatures.features]);
  const mergedStopsFc = { type: 'FeatureCollection', features: mergedStops };

  const routesOut = JSON.stringify(mergedRoutesFc, null, 2) + '\n';
  fs.writeFileSync(files.rapidRoutes, routesOut);
  fs.writeFileSync(files.regionalRoutes, routesOut);

  const featuresOut = JSON.stringify(mergedStopsFc, null, 2) + '\n';
  fs.writeFileSync(files.rapidFeatures, featuresOut);
  fs.writeFileSync(files.regionalFeatures, featuresOut);

  console.log('Merged routes:', mergedRoutes.length);
  console.log('Merged stops:', mergedStops.length);
  console.log('Renamed (rapid routes):', renamedRapid, 'Renamed (regional routes):', renamedRegional);
  console.log('Wrote combined collections to both rapid and regional-rail files');
}

main();
