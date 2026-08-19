import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  boot,
  seedSave,
  trackErrors,
  textOf,
  headerPower,
} from './helpers';

async function gotoScreen(page: Page, screenId: string): Promise<void> {
  await page.evaluate((id) => (window as any).events?.emit('screen:change', { screenId: id }), screenId);
  await page.waitForTimeout(100);
}

function expectNoErrors(errors: string[]): void {
  expect(errors, 'Runtime errors (pageerror / console.error)').toEqual([]);
}

test.describe('Phase 58 — Complete Campaign Interaction QA v2', () => {
  test('P58-01: Battle Arena Combat Loop & Auto-Advance', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);

    // Initial state: World 1, Stage 1-1, AUTO ON
    expect(await textOf(page, '#campaignStageTitle')).toMatch(/Stage 1-1/i);
    expect(await textOf(page, '#autoAdvanceToggleBtn')).toBe('AUTO ON');

    // Click Attack button multiple times
    const powerBefore = await headerPower(page);
    for (let i = 0; i < 5; i++) {
      await page.click('#trainActionBtn');
    }
    await page.waitForTimeout(300);

    const powerAfter = await headerPower(page);
    expect(powerAfter).toBeGreaterThanOrEqual(powerBefore);

    // Toggle Auto-Advance off and on
    await page.click('#autoAdvanceToggleBtn');
    expect(await textOf(page, '#autoAdvanceToggleBtn')).toBe('AUTO OFF');

    await page.click('#autoAdvanceToggleBtn');
    expect(await textOf(page, '#autoAdvanceToggleBtn')).toBe('AUTO ON');

    expectNoErrors(qa.errors);
  });

  test('P58-02: Rapid Keyboard Attacks & Hotkey QA', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);

    // Press Space repeatedly for rapid attack
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Space');
    }
    await page.waitForTimeout(200);

    // Press KeyA to toggle auto-advance
    await page.keyboard.press('KeyA');
    expect(await textOf(page, '#autoAdvanceToggleBtn')).toBe('AUTO OFF');

    await page.keyboard.press('KeyA');
    expect(await textOf(page, '#autoAdvanceToggleBtn')).toBe('AUTO ON');

    expectNoErrors(qa.errors);
  });

  test('P58-03: Concurrent Battle + Building Purchases Race', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);
    await seedSave(page, { rankId: 'C', rankIndex: 2, gold: 50_000_000, crystals: 200 });

    // Switch to 10x multiplier in left sect column
    await page.click('.buy-mult-btn[data-mult="10"]');

    // Rapidly buy multiple buildings while combat runs
    const dojoBtn = page.locator('.buy-building-action-btn[data-building-id="dojo"]');
    if (await dojoBtn.isVisible()) {
      await dojoBtn.click();
      await dojoBtn.click();
    }

    const gardenBtn = page.locator('.buy-building-action-btn[data-building-id="herb_garden"]');
    if (await gardenBtn.isVisible()) {
      await gardenBtn.click();
    }

    await page.waitForTimeout(300);

    // Verify stats did not corrupt (no NaN)
    const power = await headerPower(page);
    expect(isNaN(power)).toBe(false);
    expect(isFinite(power)).toBe(true);

    expectNoErrors(qa.errors);
  });

  test('P58-04: Boss Encounter Blocked State & Dual Retry Buttons', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);

    await seedSave(page, {
      campaign: {
        currentWorldId: 1,
        currentStageId: '1-9',
        currentEncounter: 1,
        highestWorldReached: 1,
        highestStageReached: '1-10',
        firstClears: ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9'],
        campaignMode: 'boss_blocked',
        autoAdvance: true,
        farmStageId: '1-9',
        bossRetryState: {
          bossId: 'boss_1_10',
          failedStageId: '1-10',
          retryBoostActive: false,
          failCount: 1,
        },
      },
    });

    // Verify boss retry container is visible with both retry buttons
    await page.waitForSelector('#bossRetryContainer', { state: 'visible' });
    expect(await page.isVisible('#bossRetryBtn')).toBe(true);
    expect(await page.isVisible('#bossBoostedRetryBtn')).toBe(true);

    // Click regular retry button
    await page.click('#bossRetryBtn');
    await page.waitForTimeout(200);

    // Verify encounter switched back to progress mode
    const modeBadge = await textOf(page, '#campaignModeBadge');
    expect(modeBadge).toMatch(/PROGRESS|ПРОГРЕСС/i);

    expectNoErrors(qa.errors);
  });

  test('P58-05: Samsara Reincarnation Progression & Record Preservation', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);
    await seedSave(page, {
      rankId: 'S',
      rankIndex: 5,
      power: 2_000_000_000,
      gold: 500_000_000,
      crystals: 500,
      towerFloor: 15,
      stats: { lifetimePower: 2_000_000_000 },
      campaign: {
        currentWorldId: 2,
        currentStageId: '2-5',
        currentEncounter: 1,
        highestWorldReached: 2,
        highestStageReached: '2-5',
        firstClears: ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9', '1-10', '2-1', '2-2', '2-3', '2-4', '2-5'],
        campaignMode: 'progress',
        autoAdvance: true,
        farmStageId: '2-4',
        bossRetryState: null,
      },
    });

    await gotoScreen(page, 'souls');
    await page.waitForSelector('#openReincarnateModalBtn');
    await page.click('#openReincarnateModalBtn');
    await page.waitForSelector('#confirmReincarnateBtn');
    await page.click('#confirmReincarnateBtn');
    await page.waitForSelector('#modalLayer', { state: 'hidden' });

    // Verify campaign progression was reset to World 1 / Stage 1-1 in Rush mode, while preserving records
    const state = await page.evaluate(() => (window as any).store?.get());
    expect(state.campaign.currentWorldId).toBe(1);
    expect(state.campaign.currentStageId).toBe('1-1');
    expect(state.campaign.highestStageReached).toBe('2-5');
    expect(state.campaign.firstClears.length).toBe(15);
    expect(state.reincarnationCount).toBeGreaterThanOrEqual(1);

    expectNoErrors(qa.errors);
  });

  test('P58-06: Rapid Navigation Tab Switching & Clean Screen Lifecycles', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);

    // Rapidly navigate through tabs
    const tabs = ['home', 'ascension', 'battle', 'heroes', 'tower', 'summon', 'quests', 'home'];
    for (const tab of tabs) {
      await gotoScreen(page, tab);
      await page.waitForTimeout(50);
    }

    // Verify header numbers remain valid
    const power = await headerPower(page);
    expect(isNaN(power)).toBe(false);
    expect(isFinite(power)).toBe(true);

    expectNoErrors(qa.errors);
  });
});
