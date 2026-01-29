
const fs = require('fs');
const filePath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\src\\app\\(game)\\asia\\china\\xiamen\\data\\xiamen.geojson';
const outPath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\xiamen_line3_features.json';

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(data);

  const targetIds = ['way/687961016', 'way/687961018'];
  const extracted = [];
  const seen = new Set();

  for (const f of geojson.features) {
    const id = f.properties['@id'];
    if (targetIds.includes(id) && !seen.has(id)) {
      extracted.push(f);
      seen.add(id);
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(extracted, null, 2));
  console.log(`Extracted ${extracted.length} features.`);
} catch (err) {
  console.error(err);
}
