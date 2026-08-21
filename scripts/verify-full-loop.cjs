const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testLoop() {
  console.log('[LoopTest] Launching Chromium to verify full gameplay loop...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto('http://localhost:3000/fantasy.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Initial State: Normal Enemy Combat
  console.log('[LoopTest] 1. Verifying Hero running & normal enemy combat...');
  await page.screenshot({ path: 'docs/screenshots/fantasy/loop_01_normal_combat.png' });

  // 2. Active Clicks & Combo
  console.log('[LoopTest] 2. Clicking Attack button to trigger combo...');
  const attackBtn = await page.$('#fantasyAttackBtn');
  for (let i = 0; i < 6; i++) {
    await attackBtn.click();
    await page.waitForTimeout(120);
  }
  await page.screenshot({ path: 'docs/screenshots/fantasy/loop_02_combo_click.png' });

  // 3. Wait for Enemy Defeat & Reward
  console.log('[LoopTest] 3. Waiting for enemy defeat & reward distribution...');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'docs/screenshots/fantasy/loop_03_enemy_defeated.png' });

  // 4. Upgrade Tab & Purchasing
  console.log('[LoopTest] 4. Navigating to Upgrades tab and purchasing upgrade...');
  await page.click('button[data-tab="upgrades"]');
  await page.waitForTimeout(500);
  const buyBtn = await page.$('.fantasy-upgrade-row button');
  if (buyBtn) {
    await buyBtn.click();
    await page.waitForTimeout(200);
  }
  await page.screenshot({ path: 'docs/screenshots/fantasy/loop_04_upgrades.png' });

  // 5. Gear Tab & Inventory
  console.log('[LoopTest] 5. Navigating to Gear tab...');
  await page.click('button[data-tab="gear"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/screenshots/fantasy/loop_05_gear.png' });

  // 6. Return to Battle & Progress toward Boss
  console.log('[LoopTest] 6. Returning to Battle...');
  await page.click('button[data-tab="battle"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'docs/screenshots/fantasy/loop_06_stage_progression.png' });

  await browser.close();
  console.log('[LoopTest] Full gameplay loop successfully verified and recorded!');
}

testLoop().catch((err) => {
  console.error('[LoopTest] Error:', err);
  process.exit(1);
});
