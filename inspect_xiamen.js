
const fs = require('fs');
const filePath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\src\\app\\(game)\\asia\\china\\xiamen\\data\\xiamen.geojson';
const outPath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\xiamen_analysis.txt';

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(data);

  const line3Features = geojson.features.filter(f => {
    const name = f.properties && (f.properties.name || f.properties['name:en']);
    return name && (name.includes('厦门地铁3号线') || name.includes('Xiamen Metro Line 3'));
  });

  line3Features.sort((a, b) => b.geometry.coordinates.length - a.geometry.coordinates.length);

  let output = `Found ${line3Features.length} features for Xiamen Metro Line 3\n\n`;
  line3Features.slice(0, 5).forEach((f, i) => {
    output += `Feature ${i + 1}:\n`;
    output += `  Name: ${f.properties.name}\n`;
    output += `  ID: ${f.properties['@id']}\n`;
    output += `  Coordinates: ${f.geometry.coordinates.length} points\n`;
    output += `  First Coordinate: ${JSON.stringify(f.geometry.coordinates[0])}\n\n`;
  });

  fs.writeFileSync(outPath, output);
  console.log('Done');
} catch (err) {
  console.error(err);
}
