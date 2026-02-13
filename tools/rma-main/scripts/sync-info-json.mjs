import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve('info.json');
const target = resolve('public', 'info.json');

if (!existsSync(source)) {
    throw new Error(`Missing source file: ${source}`);
}

cpSync(source, target);
console.log(`Synced ${source} -> ${target}`);
