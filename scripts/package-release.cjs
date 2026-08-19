const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const zipFile = path.join(rootDir, 'anime-infinite-ascension.zip');

if (!fs.existsSync(distDir)) {
  console.error('[Package Release] Error: dist/ directory does not exist. Run "npm run build" first.');
  process.exit(1);
}

// Remove old zip if exists
if (fs.existsSync(zipFile)) {
  fs.unlinkSync(zipFile);
}

// PowerShell Compress-Archive
console.log('[Package Release] Zipping dist/ to anime-infinite-ascension.zip...');
try {
  execSync(`powershell -Command "Compress-Archive -Path '${distDir}\\*' -DestinationPath '${zipFile}' -Force"`, { stdio: 'inherit' });
  const stats = fs.statSync(zipFile);
  console.log(`[Package Release] Created release zip (${(stats.size / 1024).toFixed(1)} KB): ${zipFile}`);
} catch (err) {
  console.error('[Package Release] Failed to create zip archive:', err);
  process.exit(1);
}
