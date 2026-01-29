
const fs = require('fs');
const filePath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\src\\app\\(game)\\asia\\china\\xiamen\\data\\xiamen.geojson';

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(data);

  const line3Features = geojson.features.filter(f => {
    const name = f.properties && (f.properties.name || f.properties['name:en']);
    return name && (name.includes('厦门地铁3号线') || name.includes('Xiamen Metro Line 3'));
  });

  console.log(`Found ${line3Features.length} features for Xiamen Metro Line 3`);

  line3Features.forEach((f, i) => {
    const coords = f.geometry.coordinates;
    const start = coords[0];
    const end = coords[coords.length - 1];
    console.log(`Feature ${i + 1} (${f.properties['@id']}): ${coords.length} points.`);
    console.log(`  Start: [${start}]`);
    console.log(`  End:   [${end}]`);
    // Check if it's potentially the missing segment (Airport area is roughly 118.35, 24.54)
    // Houcun is roughly 118.26, 24.58
    // We are looking for segments in between or near these.
  });

} catch (err) {
  console.error(err);
}
