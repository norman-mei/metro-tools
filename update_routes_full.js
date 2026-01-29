
const fs = require('fs');
const routesPath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\src\\app\\(game)\\asia\\china\\xiamen\\data\\routes.json';
const newFeaturesPath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\xiamen_line3_all.json';

try {
  const routesData = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
  const newFeatures = JSON.parse(fs.readFileSync(newFeaturesPath, 'utf8'));

  // Filter out existing xiamen3 lines
  routesData.features = routesData.features.filter(f => f.properties && f.properties.line !== 'xiamen3');

  console.log(`Remaining existing features: ${routesData.features.length}`);

  // Add all new features with correct properties
  newFeatures.forEach(f => {
    f.properties = {
      line: 'xiamen3',
      color: '#529fc9'
    };
    routesData.features.push(f);
  });

  console.log(`Total features after update: ${routesData.features.length}`);
  console.log(`Added ${newFeatures.length} Line 3 features.`);

  fs.writeFileSync(routesPath, JSON.stringify(routesData, null, 2));
  console.log('Update successful.');

} catch (err) {
  console.error(err);
}
