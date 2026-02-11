const fs = require('fs');
const path = require('path');

const SOURCE_PATH = path.join(__dirname, '../../src/lib/citiesConfig.ts');
const DEST_PATH = path.join(__dirname, '../lib/cities.ts');

const sourceContent = fs.readFileSync(SOURCE_PATH, 'utf8');

// Use regex to capture the rawCities array content
const match = sourceContent.match(/const rawCities: CityBase\[\] = \[\s*([\s\S]*?)\]/);

if (!match) {
  console.error('Could not find rawCities array in source file');
  process.exit(1);
}

const rawCitiesContent = match[1];

// Clean up the content: remove pure comments that might be inside objects?
// Actually we can just paste it directly, but we need to handle "image: omaha" imports if present.
// The rawCities array in source seems to be mostly strings and objects.
// Wait, the source file had "image: omaha" commented out or used as variable?
// In src/lib/citiesConfig.ts lines 230-234: // name: 'Omaha', // image: omaha...
// It seems most active entries don't have image property in rawCities, they rely on getCityImagePath.
// So we can likely just copy the content.

// Let's generate the file content
const fileContent = `export interface ICity {
  name: string;
  image: string;
  link: string;
  continent: string;
  disabled?: boolean;
  hideInStats?: boolean;
  keywords?: string[];
}

type CityBase = Omit<ICity, 'image'>;

const rawCities: CityBase[] = [
${rawCitiesContent}
];

const getPathFromLink = (link: string): string | null => {
  if (!link.startsWith('/')) {
    return null;
  }
  return link.replace(/^\\//, '').split(/[?#]/)[0];
};

export const getSlugFromLink = (link: string): string | null => {
  const path = getPathFromLink(link);
  if (!path) {
    return null;
  }
  const segments = path.split('/').filter(Boolean);
  return segments.length ? segments[segments.length - 1] : null;
};

const getCityImagePath = (link: string): string => {
  const slug = getSlugFromLink(link);
  return slug ? \`/city-cards/\${slug}.jpg\` : '/city-cards/_default.jpg';
};

export const cities: ICity[] = rawCities.map(city => ({
  ...city,
  image: getCityImagePath(city.link),
}));
`;

fs.writeFileSync(DEST_PATH, fileContent);
console.log('Successfully synced cities to mobile/lib/cities.ts');
