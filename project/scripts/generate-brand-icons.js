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
      <stop offset="0%" style="stop-color:#b892b9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#9a7a9b;stop-opacity:1" />
    </linearGradient>
  </defs>
  ${isMaskable ? `<rect width="${size}" height="${size}" fill="white"/>` : ''}
  <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="url(#grad)"/>
  <text x="${centerX}" y="${centerY + radius * 0.35}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="${radius * 1.2}" font-weight="bold" fill="white" text-anchor="middle">D</text>
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

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const isMaskable = size === 192 || size === 512;
  const svgContent = createSVGIcon(size, isMaskable);
  fs.writeFileSync(
    path.join(iconsDir, `icon-${size}x${size}.svg`),
    svgContent
  );
});

fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.svg'), createSVGIcon(180));
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), createSVGIcon(64));

console.log('✓ PWA icons generated successfully with brand colors!');
console.log('Generated SVG sizes:', sizes.join(', '));
console.log('\nNote: For production, consider converting these to PNG format.');
console.log('Modern browsers support SVG icons in PWA manifests.');
