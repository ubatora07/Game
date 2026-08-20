const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '../docs/screenshots/hybrid');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('[Screenshots] Starting Vite server on port 3009...');
  const vite = spawn('node', ['node_modules/vite/bin/vite.js', '--port', '3009', '--strictPort'], {
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
      await page.goto('http://localhost:3009/beta.html', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // 1. Battle Screen
      await page.screenshot({ path: path.join(outDir, `battle-${vp.name}.png`) });
      console.log(`Captured battle-${vp.name}.png`);

      // 2. Hero Screen
      await page.evaluate(() => window.hybridApp.switchScreen('hero'));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `hero-${vp.name}.png`) });
      console.log(`Captured hero-${vp.name}.png`);

      // 3. Bank / Inventory Screen
      await page.evaluate(() => window.hybridApp.switchScreen('bank'));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `inventory-${vp.name}.png`) });
      console.log(`Captured inventory-${vp.name}.png`);

      // 4. Settlement Screen
      await page.evaluate(() => window.hybridApp.switchScreen('settlement'));
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(outDir, `settlement-${vp.name}.png`) });
      console.log(`Captured settlement-${vp.name}.png`);

      await page.close();
    }

    await browser.close();
    console.log('[Screenshots] All screenshots captured successfully!');
  } finally {
    vite.kill();
  }
}

run().catch((err) => {
  console.error('[Screenshots] Error:', err);
  process.exit(1);
});
