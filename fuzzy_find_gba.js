
const fs = require('fs');
const filePath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\src\\app\\(game)\\asia\\china\\gba\\data\\features.json';

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(data);

  // Search terms
  const terms = ['Baiyun', 'Yuntai', 'Cableway', 'Garden', '白云', '云台', '索道'];

  const matches = geojson.features.filter(f => {
    if (!f.properties) return false;
    const n = JSON.stringify(f.properties).toLowerCase();
    return terms.some(t => n.includes(t.toLowerCase()));
  });

  console.log(`Found ${matches.length} potential matches:`);
  matches.forEach(f => {
    console.log(`ID: ${f.id}, Line: ${f.properties.line}, Name: ${f.properties.name}`);
    console.log(`JSON: ${JSON.stringify(f.properties)}`);
    console.log('---');
  });

} catch (err) {
  console.error(err);
}
