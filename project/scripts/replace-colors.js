import fs from 'fs';
import path from 'path';

// Colors to replace
const colorReplacements = {
  'orange-': 'teal-',
  'bg-orange': 'bg-teal',
  'text-orange': 'text-teal',
  'border-orange': 'border-teal',
  'from-orange': 'from-teal',
  'to-orange': 'to-teal',
  'via-orange': 'via-teal',
  'hover:bg-orange': 'hover:bg-teal',
  'hover:text-orange': 'hover:text-teal',
  'focus:ring-orange': 'focus:ring-teal',
  'ring-orange': 'ring-teal'
};

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    Object.entries(colorReplacements).forEach(([oldColor, newColor]) => {
      if (content.includes(oldColor)) {
        content = content.replace(new RegExp(oldColor, 'g'), newColor);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated colors in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', 'dist', '.git'].includes(file)) {
      walkDirectory(filePath);
    } else if (stat.isFile() && /\.(tsx?|jsx?|css)$/.test(file)) {
      replaceInFile(filePath);
    }
  });
}

console.log('Starting color replacement from orange to teal...');
walkDirectory('./src');
console.log('Color replacement complete!');