
const fs = require('fs');
const filePath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\src\\app\\(game)\\asia\\china\\gba\\data\\features.json';
const outPath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\gba_fuzzy_find.txt';

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(data);

  const terms = ['Baiyun', 'Yuntai', 'Cableway', 'Garden', '白云', '云台', '索道'];

  const matches = geojson.features.filter(f => {
    if (!f.properties) return false;
    const n = JSON.stringify(f.properties).toLowerCase();
    return terms.some(t => n.includes(t.toLowerCase()));
  });

  let output = `Found ${matches.length} potential matches:\n\n`;
  matches.forEach(f => {
    output += `ID: ${f.id}\n`;
    output += `Line: ${f.properties.line}\n`;
    output += `Name: ${f.properties.name}\n`;
    output += `JSON: ${JSON.stringify(f.properties)}\n`;
    output += `-----------------------------------\n`;
  });

  fs.writeFileSync(outPath, output);
  console.log('Analysis written to file.');

} catch (err) {
  console.error(err);
}
