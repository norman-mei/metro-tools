const fs = require('fs');
const path = 'src/app/(game)/boston/data/routes.json';

try {
  const data = fs.readFileSync(path, 'utf8');
  const json = JSON.parse(data);
  console.log('Total features:', json.features.length);
  json.features.slice(0, 5).forEach((f, i) => {
    console.log(`Feature ${i} properties:`, JSON.stringify(f.properties, null, 2));
  });
} catch (err) {
  console.error(err);
}
