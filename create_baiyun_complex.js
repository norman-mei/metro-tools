
const fs = require('fs');
const filePath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\src\\app\\(game)\\asia\\china\\gba\\data\\features.json';

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(data);

  const targetIds = [90274, 91870];
  const clusterKey = 'baiyun_cableway_complex';
  let updatedCount = 0;

  geojson.features.forEach(f => {
    if (targetIds.includes(f.id)) {
      f.properties.cluster_key = clusterKey;
      updatedCount++;
    }
  });

  if (updatedCount === 2) {
    fs.writeFileSync(filePath, JSON.stringify(geojson, null, 2));
    console.log(`Successfully updated ${updatedCount} stations with cluster_key: ${clusterKey}`);
  } else {
    console.log(`Error: Expected to update 2 stations, but found ${updatedCount}.`);
  }

} catch (err) {
  console.error(err);
}
