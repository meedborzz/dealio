import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="white" />
  <path d="M411,80 v352 h-65 v-45 c-20,30 -55,50 -100,50 c-80,0 -145,-65 -145,-145 s65,-145 145,-145 c45,0 80,20 100,50 v-107 h65 z M246,362 c45,0 80,-35 80,-80 s-35,-80 -80,-80 s-80,35 -80,80 s35,80 80,80 z" fill="black" />
</svg>`;

const iconsDir = path.join(process.cwd(), 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
    const adjustedSvgContent = svgContent.replace(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">`
    );

    const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
    fs.writeFileSync(filePath, adjustedSvgContent);
    console.log(`Generated ${filePath}`);
});

const faviconPath = path.join(process.cwd(), 'public', 'favicon.svg');
const appleTouchIconPath = path.join(process.cwd(), 'public', 'apple-touch-icon.svg');

fs.writeFileSync(faviconPath, svgContent);
fs.writeFileSync(appleTouchIconPath, svgContent);
console.log('Generated favicon and apple-touch-icon');
