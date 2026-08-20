const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '../docs/screenshots/fantasy');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('[Screenshots] Starting Vite dev server on port 3012...');
  const vite = spawn('node', ['node_modules/vite/bin/vite.js', '--port', '3012', '--strictPort'], {
    stdio: 'pipe',
    shell: false,
  });

  await new Promise((resolve) => setTimeout(resolve, 2500));

  try {
    const browser = await chromium.launch({ headless: true });
    
    const viewports = [
      { name: 'desktop', width: 1366, height: 768 },
      { name: 'mobile', width: 390, height: 844 },
    ];

    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto('http://localhost:3012/fantasy.html', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1200);

      // 1. Battle View
      await page.screenshot({ path: path.join(outDir, `battle-${vp.name}.png`) });
      console.log(`Captured battle-${vp.name}.png`);

      // 2. Hero View
      await page.evaluate(() => window.fantasyApp.switchTab('hero'));
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(outDir, `hero-${vp.name}.png`) });
      console.log(`Captured hero-${vp.name}.png`);

      // 3. Gear View
      await page.evaluate(() => window.fantasyApp.switchTab('gear'));
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(outDir, `gear-${vp.name}.png`) });
      console.log(`Captured gear-${vp.name}.png`);

      // 4. Upgrades View
      await page.evaluate(() => window.fantasyApp.switchTab('upgrades'));
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(outDir, `upgrades-${vp.name}.png`) });
      console.log(`Captured upgrades-${vp.name}.png`);

      // 5. World View
      await page.evaluate(() => window.fantasyApp.switchTab('world'));
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(outDir, `world-${vp.name}.png`) });
      console.log(`Captured world-${vp.name}.png`);

      await page.close();
    }

    await browser.close();
    console.log('[Screenshots] All Fantasy Idle RPG screenshots captured successfully!');
  } finally {
    vite.kill();
  }
}

run().catch((err) => {
  console.error('[Screenshots] Error:', err);
  process.exit(1);
});
