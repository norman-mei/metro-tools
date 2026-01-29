
const fs = require('fs');
const filePath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\src\\app\\(game)\\asia\\china\\xiamen\\data\\xiamen.geojson';
const outPath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\xiamen_line3_full_analysis.txt';

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(data);

  const line3Features = geojson.features.filter(f => {
    const name = f.properties && (f.properties.name || f.properties['name:en']);
    return name && (name.includes('厦门地铁3号线') || name.includes('Xiamen Metro Line 3'));
  });

  let output = `Found ${line3Features.length} features for Xiamen Metro Line 3\n\n`;
  
  line3Features.forEach((f, i) => {
    const coords = f.geometry.coordinates;
    const start = coords[0];
    const end = coords[coords.length - 1];
    output += `Feature ${i + 1} (${f.properties['@id']}): ${coords.length} points.\n`;
    output += `  Start: [${start}]\n`;
    output += `  End:   [${end}]\n`;
    output += `  Props: ${JSON.stringify(f.properties)}\n\n`;
  });

  fs.writeFileSync(outPath, output);
  console.log('Analysis written to file.');

} catch (err) {
  console.error(err);
}
