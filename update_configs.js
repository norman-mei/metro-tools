const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const ROOT_DIR = path.join(process.cwd(), 'src', 'app', '(game)');

async function updateConfigs() {
  // Find all config.ts files in direct subdirectories of src/app/(game)
  // Pattern: src/app/(game)/[slug]/config.ts
  const pattern = path.join(ROOT_DIR, '*/config.ts').replace(/\\/g, '/');
  const files = await glob(pattern);

  console.log(`Found ${files.length} config files.`);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const slug = path.basename(path.dirname(file));
    
    // Check if icons are already defined
    if (content.includes('icons: {')) {
      console.log(`Skipping ${slug}: icons already defined.`);
      continue;
    }

    // Look for METADATA object
    const metadataRegex = /export const METADATA: Metadata = {/;
    if (!metadataRegex.test(content)) {
      console.log(`Skipping ${slug}: METADATA not found.`);
      continue;
    }

    // Inject icons property
    const injection = `
  icons: {
    icon: '/api/city-icon/${slug}',
    apple: '/api/city-icon/${slug}',
  },`;
    
    const newContent = content.replace(metadataRegex, `export const METADATA: Metadata = {${injection}`);
    
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${slug}.`);
  }
}

updateConfigs().catch(console.error);
