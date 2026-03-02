import { writeFileSync } from 'fs';
import { resolve } from 'path';

const sizes = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 192, name: 'icon-maskable-192x192.png' },
  { size: 512, name: 'icon-maskable-512x512.png' }
];

const createSVGIcon = (size, isMaskable) => {
  const padding = isMaskable ? size * 0.1 : 0;
  const innerSize = size - (padding * 2);
  const innerOffset = padding;

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#c8a2c9"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${innerSize * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">D</text>
</svg>`;
};

sizes.forEach(({ size, name }) => {
  const isMaskable = name.includes('maskable');
  const svg = createSVGIcon(size, isMaskable);
  const outputPath = resolve(process.cwd(), 'public', 'icons', name.replace('.png', '.svg'));
  writeFileSync(outputPath, svg);
  console.log(`Created ${outputPath}`);
});

console.log('Icon generation complete! Note: SVG icons created. For production, convert these to PNG using an image converter or design tool.');
