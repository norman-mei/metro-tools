
const fs = require('fs');
const filePath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\src\\app\\(game)\\asia\\china\\gba\\data\\features.json';
const outPath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\gba_shunde_analysis.txt';

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(data);

  // Filter for Shunde No.1 High School on fs_line3
  const matches = geojson.features.filter(f => {
    if (!f.properties) return false;
    const name = f.properties.name || '';
    const isTargetName = name.includes('Shunde No.1') || name.includes('顺德一中');
    // const isTargetLine = f.properties.line === 'fs_line3'; // User said Foshan Line 3, but let's be safe and check name first.
    return isTargetName;
  });

  let output = `Found ${matches.length} matches for Shunde No.1 High School:\n\n`;
  matches.forEach(f => {
    output += `ID: ${f.id}\n`;
    output += `Line: ${f.properties.line}\n`;
    output += `Name: ${f.properties.name}\n`;
    output += `Coords: [${f.geometry.coordinates}]\n`;
    output += `-----------------------------------\n`;
  });

  fs.writeFileSync(outPath, output);
  console.log('Analysis written to file.');

} catch (err) {
  console.error(err);
}
