const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function generateSvg(size, isMaskable = false) {
  const padding = isMaskable ? size * 0.1 : 0;
  const innerSize = size - padding * 2;
  const fontSize = innerSize * 0.5;
  const borderRadius = size * 0.15;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${borderRadius}" fill="#c8a2c9"/>
  <text x="${size/2}" y="${size/2 + fontSize * 0.35}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle">D</text>
</svg>`;
}

sizes.forEach(size => {
  const svg = generateSvg(size);
  const filename = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Created ${filename}`);
});

const maskableSvg = generateSvg(512, true);
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512x512.svg'), maskableSvg);
console.log('Created maskable icon');

console.log('\nAll icons generated successfully!');
