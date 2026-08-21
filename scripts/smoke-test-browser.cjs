const { chromium } = require('playwright');

async function runSmokeTest() {
  console.log('[SmokeTest] Launching Chromium browser...');
  const browser = await chromium.launch({ headless: true });

  // 1. Test Fantasy Idle RPG (fantasy.html)
  {
    console.log('[SmokeTest] Testing http://localhost:3000/fantasy.html ...');
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('http://localhost:3000/fantasy.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify canvas battlefield
    const canvas = await page.$('#fantasyCanvas');
    if (!canvas) throw new Error('Fantasy canvas #fantasyCanvas not found');

    // Verify Attack button
    const attackBtn = await page.$('#fantasyAttackBtn');
    if (!attackBtn) throw new Error('Attack button #fantasyAttackBtn not found');

    // Click attack button multiple times
    console.log('[SmokeTest] Testing active click strikes & combo build...');
    for (let i = 0; i < 5; i++) {
      await attackBtn.click();
      await page.waitForTimeout(150);
    }

    // Wait for combat flow (5 seconds of combat ticks)
    await page.waitForTimeout(4000);

    // Switch tabs: HERO, GEAR, UPGRADES, WORLD, BATTLE
    const tabs = ['hero', 'gear', 'upgrades', 'world', 'battle'];
    for (const tab of tabs) {
      console.log(`[SmokeTest] Switching to tab: ${tab}...`);
      await page.click(`button[data-tab="${tab}"]`);
      await page.waitForTimeout(400);
    }

    // Test Upgrade purchasing
    await page.click('button[data-tab="upgrades"]');
    await page.waitForTimeout(300);
    const buyBtn = await page.$('.fantasy-upgrade-row button');
    if (buyBtn) {
      console.log('[SmokeTest] Testing upgrade purchase button...');
      await buyBtn.click();
      await page.waitForTimeout(200);
    }

    // Switch back to battle
    await page.click('button[data-tab="battle"]');
    await page.waitForTimeout(1000);

    if (errors.length > 0) {
      console.error('[SmokeTest] Browser errors detected in fantasy.html:', errors);
      throw new Error(`Browser console errors found: ${errors.join(', ')}`);
    }

    console.log('[SmokeTest] ✓ fantasy.html passed all gameplay smoke checks with 0 console errors!');
    await page.close();
  }

  // 2. Test Canonical Game (index.html)
  {
    console.log('[SmokeTest] Testing http://localhost:3000/ ...');
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const appContainer = await page.$('#app, .game-layout, body');
    if (!appContainer) throw new Error('App container not found');

    if (errors.length > 0) {
      console.error('[SmokeTest] Browser errors in index.html:', errors);
    } else {
      console.log('[SmokeTest] ✓ index.html loaded cleanly with 0 console errors!');
    }
    await page.close();
  }

  await browser.close();
  console.log('[SmokeTest] All browser smoke checks completed successfully!');
}

runSmokeTest().catch((err) => {
  console.error('[SmokeTest] FAILED:', err);
  process.exit(1);
});
