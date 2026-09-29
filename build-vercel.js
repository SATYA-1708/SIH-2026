const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Determine frontend directory
let frontendDir = null;
const candidates = [
  path.resolve('./frontend'),
  path.resolve('./kabadiWala/frontend'),
  path.resolve('.')
];

for (const dir of candidates) {
  const pkgPath = path.join(dir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name === 'kabadiwala-frontend' || (pkg.dependencies && pkg.dependencies.react)) {
        frontendDir = dir;
        break;
      }
    } catch (e) {}
  }
}

if (!frontendDir) {
  console.error('Could not find frontend directory!');
  process.exit(1);
}

console.log(`Found frontend at: ${frontendDir}`);
console.log('Installing frontend dependencies...');
execSync(`npm --prefix "${frontendDir}" install`, { stdio: 'inherit' });

console.log('Building frontend with Vite...');
execSync(`npm --prefix "${frontendDir}" run build`, { stdio: 'inherit' });

const sourceDist = path.join(frontendDir, 'dist');
if (!fs.existsSync(sourceDist)) {
  console.error(`Dist folder not found at ${sourceDist}`);
  process.exit(1);
}

// Copy dist to all potential output locations so Vercel finds it anywhere
const targetDists = [
  path.resolve('./dist'),
  path.resolve('./frontend/dist'),
  path.resolve('./kabadiWala/frontend/dist')
];

for (const target of targetDists) {
  if (path.resolve(target) !== path.resolve(sourceDist)) {
    try {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.cpSync(sourceDist, target, { recursive: true, force: true });
      console.log(`Copied build output to: ${target}`);
    } catch (err) {
      console.warn(`Could not copy to ${target}: ${err.message}`);
    }
  }
}

console.log('Vercel build completed successfully!');
