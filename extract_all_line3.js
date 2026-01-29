
const fs = require('fs');
const filePath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\src\\app\\(game)\\asia\\china\\xiamen\\data\\xiamen.geojson';
const outPath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\xiamen_line3_all.json';

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(data);

  const line3Features = geojson.features.filter(f => {
    const name = f.properties && (f.properties.name || f.properties['name:en']);
    return name && (name.includes('厦门地铁3号线') || name.includes('Xiamen Metro Line 3'));
  });

  fs.writeFileSync(outPath, JSON.stringify(line3Features, null, 2));
  console.log(`Extracted ${line3Features.length} features to ${outPath}`);

} catch (err) {
  console.error(err);
}
