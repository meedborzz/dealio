import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');
const logoPath = path.join(__dirname, '..', 'src', 'assets', 'ligh_logo.png');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const logoBuffer = fs.readFileSync(logoPath);

sizes.forEach(size => {
  const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(outputPath, logoBuffer);
  console.log(`✓ Created ${size}x${size} icon`);
});

fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), logoBuffer);
fs.writeFileSync(path.join(publicDir, 'favicon.png'), logoBuffer);

console.log('✓ All PWA icons generated successfully!');
console.log('Note: For production, consider using sharp or similar library to properly resize images.');
