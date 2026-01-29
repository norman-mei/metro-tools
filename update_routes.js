
const fs = require('fs');
const path = require('path');

const routesPath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\src\\app\\(game)\\asia\\china\\xiamen\\data\\routes.json';
const newFeaturesPath = 'c:\\Users\\kirk\\Downloads\\Coding Projects\\metro-memory\\xiamen_line3_features.json';

try {
  const routesData = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
  const newFeatures = JSON.parse(fs.readFileSync(newFeaturesPath, 'utf8'));

  // Filter out existing xiamen3 lines
  routesData.features = routesData.features.filter(f => f.properties && f.properties.line !== 'xiamen3');

  console.log(`Remaining features count: ${routesData.features.length}`);

  // Prepare new features
  newFeatures.forEach(f => {
    // Keep geometry
    // Update properties
    f.properties = {
      ...f.properties, // Keep original properties like coordinates? No, wait. 
                       // GeoJSON properties are separate.
                       // We should probably keep existing properties from source? 
                       // User said "use keywords such as 厦门地铁3号线 and Xiamen Metro Line 3"
                       // The source features ALREADY have these names.
                       // But routes.json seems to use minimal properties.
                       // Let's stick to the convention seen in routes.json.
      line: 'xiamen3',
      color: '#529fc9',
      // We can keep the name if we want, but routes.json seems to rely on config.
      // But looking at previous view_file, routes.json had:
      // "properties": { "line": "xiamen3", "color": "#529fc9" }
      // It didn't seem to have "name".
      // However, xiamen.geojson has rich properties.
      // I will keep the original properties AND add the required ones.
      // Actually, looking at routes.json again (lines 4339-4342), it ONLY has line and color.
      // To be safe and clean, I will just set line and color, but maybe "name" is useful?
      // User said "use keywords...". Maybe he meant identifying the source?
      // I'll stick to the minimal properties to match the file style, 
      // UNLESS the user wants the names in there.
      // "replace current xiamen line 3 line string ... use keywords such as ... "
      // This likely meant "use keywords to FIND the right lines".
      // I will just use line and color to be consistent with existing routes.json.
    };
    // Ensure geometry is LineString (it is).
    routesData.features.push(f);
  });

  console.log(`New features count: ${routesData.features.length}`);

  fs.writeFileSync(routesPath, JSON.stringify(routesData, null, 2)); // formatted
  console.log('Update successful.');

} catch (err) {
  console.error(err);
}
