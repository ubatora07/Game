const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const zipFile = path.join(rootDir, 'anime-infinite-ascension.zip');
const releaseSafety = path.join(rootDir, 'scripts', 'release-safety-audit.cjs');

const fail = (message, error) => {
  console.error(`[package-release] FAIL: ${message}`);
  if (error?.message) console.error(error.message);
  process.exit(1);
};

if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) {
  fail('dist/ does not exist. Run "npm run build" first.');
}
if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  fail('dist/index.html is missing; refusing to package an invalid web release.');
}

console.log('[package-release] Re-running release artifact safety gate...');
try {
  execFileSync(process.execPath, [releaseSafety], { cwd: rootDir, stdio: 'inherit' });
} catch (error) {
  fail('release-safety failed; archive was not created.', error);
}

if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);

const packageWithPython = () => {
  const program = String.raw`
import os, sys, zipfile
src, out = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(out, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for base, dirs, files in os.walk(src):
        dirs.sort(); files.sort()
        for name in files:
            full = os.path.join(base, name)
            rel = os.path.relpath(full, src).replace(os.sep, '/')
            z.write(full, rel)
`;
  execFileSync('python3', ['-c', program, distDir, zipFile], { cwd: rootDir, stdio: 'inherit' });
};

console.log('[package-release] Packaging dist/ contents at archive root...');
try {
  if (process.platform === 'win32') {
    const sourceGlob = path.join(distDir, '*');
    const command = `Compress-Archive -Path '${sourceGlob.replace(/'/g, "''")}' -DestinationPath '${zipFile.replace(/'/g, "''")}' -Force`;
    execFileSync('powershell', ['-NoProfile', '-Command', command], { cwd: rootDir, stdio: 'inherit' });
  } else {
    try {
      execFileSync('zip', ['-q', '-9', '-r', zipFile, '.'], { cwd: distDir, stdio: 'inherit' });
    } catch {
      packageWithPython();
    }
  }
} catch (error) {
  if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);
  fail('failed to create release ZIP.', error);
}

if (!fs.existsSync(zipFile)) fail('packager returned without producing the ZIP.');
const stats = fs.statSync(zipFile);
console.log(`[package-release] PASS: ${(stats.size / 1024).toFixed(1)} KiB -> ${zipFile}`);
