
const fs = require('fs');
const filePath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\src\\app\\(game)\\asia\\china\\gba\\data\\features.json';

try {
  const data = fs.readFileSync(filePath, 'utf8');
  const geojson = JSON.parse(data);

  const targetIds = [90274, 91870];
  const clusterKey = 'baiyun_cableway_complex';

  const matches = geojson.features.filter(f => targetIds.includes(f.id));
  
  matches.forEach(f => {
    console.log(`ID: ${f.id}, Cluster: ${f.properties.cluster_key}`);
  });

  if (matches.every(f => f.properties.cluster_key === clusterKey)) {
    console.log('Verification SUCCESS');
  } else {
    console.log('Verification FAILED');
  }

} catch (err) {
  console.error(err);
}
