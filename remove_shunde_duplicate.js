
const fs = require('fs');
const filePath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\src\\app\\(game)\\asia\\china\\gba\\data\\features.json';

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(data);

  const initialCount = geojson.features.length;
  const targetId = 90485;

  // Filter out the specific station
  geojson.features = geojson.features.filter(f => f.id !== targetId);

  const finalCount = geojson.features.length;

  if (initialCount - finalCount === 1) {
    console.log(`Successfully removed station ID ${targetId}.`);
    console.log(`Count went from ${initialCount} to ${finalCount}.`);
    fs.writeFileSync(filePath, JSON.stringify(geojson, null, 2));
  } else {
    console.log(`Error: Expected to remove 1 station, but removed ${initialCount - finalCount}.`);
    console.log('No changes written.');
  }

} catch (err) {
  console.error(err);
}
