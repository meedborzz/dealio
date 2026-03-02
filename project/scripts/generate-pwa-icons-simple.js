import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createSVGIcon = (size, isMaskable = false) => {
  const padding = isMaskable ? size * 0.2 : 0;
  const innerSize = size - (padding * 2);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = innerSize / 3;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#c8a2c9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#b892b9;stop-opacity:1" />
    </linearGradient>
  </defs>
  ${isMaskable ? `<rect width="${size}" height="${size}" fill="white"/>` : ''}
  <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="url(#grad)"/>
  <text x="${centerX}" y="${centerY + radius * 0.35}" font-family="Arial, sans-serif" font-size="${radius * 1.2}" font-weight="bold" fill="white" text-anchor="middle">D</text>
</svg>`;
};

const publicDir = path.join(__dirname, '..', 'public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.svg'), createSVGIcon(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.svg'), createSVGIcon(512));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192x192.svg'), createSVGIcon(192, true));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.svg'), createSVGIcon(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createSVGIcon(180));
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), createSVGIcon(64));

console.log('✓ PWA icons generated successfully!');
