
const fs = require('fs');
const filePath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\src\\app\\(game)\\asia\\china\\gba\\data\\features.json';

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(data);

  console.log(`Total features: ${geojson.features.length}`);

  const targetName = 'Shunde No.1 High School';
  const targetZh = '顺德一中';

  const matches = geojson.features.filter(f => {
    if (!f.properties) return false;
    const name = f.properties.name || '';
    const longName = f.properties.long_name || '';
    const altNames = f.properties.alternate_names || [];
    const zhNames = f.properties.names || []; // sometimes used
    
    // Check against English and Chinese target names
    const hasEng = name.includes('Shunde') || longName.includes('Shunde') || altNames.some(n => n && n.includes('Shunde'));
    const hasZh = name.includes(targetZh) || longName.includes(targetZh) || altNames.some(n => n && n.includes(targetZh));
    
    return hasEng || hasZh;
  });

  console.log(`Found ${matches.length} matches for Shunde:`);
  matches.forEach(f => {
    console.log(`ID: ${f.id}, Line: ${f.properties.line}, Name: ${f.properties.name}`);
    console.log(`Coords: ${JSON.stringify(f.geometry.coordinates)}`);
  });

} catch (err) {
  console.error(err);
}
