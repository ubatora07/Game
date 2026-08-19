import { test, expect, type Page } from '@playwright/test';
import {
  boot,
  seedSave,
  trackErrors,
  expectNoErrors,
  textOf,
} from './helpers';

const VIEWPORTS = [
  { name: 'Compact Android (360x640)', width: 360, height: 640, isMobile: true },
  { name: 'Modern iPhone (390x844)', width: 390, height: 844, isMobile: true },
  { name: 'Android Flagship (412x915)', width: 412, height: 915, isMobile: true },
  { name: 'Tablet Portrait (768x1024)', width: 768, height: 1024, isMobile: false },
  { name: 'HD Laptop (1280x720)', width: 1280, height: 720, isMobile: false },
  { name: 'Standard Laptop (1366x768)', width: 1366, height: 768, isMobile: false },
  { name: 'FHD Desktop (1920x1080)', width: 1920, height: 1080, isMobile: false },
  { name: 'QHD 2K Desktop (2560x1440)', width: 2560, height: 1440, isMobile: false },
] as const;

async function checkNoHorizontalOverflow(page: Page): Promise<void> {
  const overflows = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const app = document.getElementById('app');

    const overflowingElements: string[] = [];
    if (app && app.scrollWidth > app.clientWidth + 1) {
      const all = app.querySelectorAll('*');
      all.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth + 1 || (el as HTMLElement).scrollWidth > (el as HTMLElement).clientWidth + 1) {
          overflowingElements.push(`${el.tagName}#${el.id}.${el.className} (scrollW:${(el as HTMLElement).scrollWidth}, clientW:${(el as HTMLElement).clientWidth}, rectRight:${rect.right})`);
        }
      });
    }

    return {
      docOverflow: doc.scrollWidth > doc.clientWidth + 1,
      docScrollWidth: doc.scrollWidth,
      docClientWidth: doc.clientWidth,
      bodyOverflow: body.scrollWidth > body.clientWidth + 1,
      appOverflow: app ? app.scrollWidth > app.clientWidth + 1 : false,
      appScrollWidth: app?.scrollWidth,
      appClientWidth: app?.clientWidth,
      overflowingElements,
    };
  });

  expect(overflows.docOverflow, `Document has horizontal scroll: ${overflows.docScrollWidth} > ${overflows.docClientWidth}`).toBe(false);
  expect(overflows.bodyOverflow, 'Body has horizontal scroll').toBe(false);
  expect(overflows.appOverflow, `#app has horizontal scroll (${overflows.appScrollWidth} > ${overflows.appClientWidth}). Elements: ${overflows.overflowingElements.join(', ')}`).toBe(false);
}

async function checkModalFitsViewport(page: Page): Promise<void> {
  const modalBounds = await page.evaluate(() => {
    const modal = document.querySelector('.modal-content-animated') as HTMLElement | null;
    if (!modal) return null;
    const rect = modal.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  });

  if (modalBounds) {
    expect(modalBounds.width).toBeLessThanOrEqual(modalBounds.viewportWidth + 2);
    expect(modalBounds.height).toBeLessThanOrEqual(modalBounds.viewportHeight + 2);
    expect(modalBounds.left).toBeGreaterThanOrEqual(-2);
    expect(modalBounds.top).toBeGreaterThanOrEqual(-2);
  }
}

async function gotoScreen(page: Page, screenId: string): Promise<void> {
  await page.evaluate((id) => (window as any).events?.emit('screen:change', { screenId: id }), screenId);
  await page.waitForTimeout(100);
}

test.describe('Phase 59 — Responsive QA v2', () => {
  for (const vp of VIEWPORTS) {
    test(`P59-Viewport: ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      const qa = trackErrors(page);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await boot(page);

      // Seed high-progression save with all features unlocked
      await seedSave(page, {
        rankId: 'S',
        rankIndex: 5,
        power: 1_500_000_000,
        gold: 8_000_000_000,
        crystals: 5000,
        essence: 1200,
        souls: 50,
        towerFloor: 25,
        buildings: { dojo: 50, meditation_chamber: 25, warrior_academy: 10 },
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
        stats: {
          lifetimePower: 1_500_000_000,
          lifetimeGold: 8_000_000_000,
          trainClicks: 500,
          buildingsPurchased: 85,
          upgradesPurchased: 20,
          towerMaxFloor: 25,
          reincarnations: 2,
          playtimeSeconds: 3600,
        },
      });

      // 1. Check No Horizontal Overflow on initial boot
      await checkNoHorizontalOverflow(page);

      // 2. Battle arena elements are readable and clickable
      await page.waitForSelector('#trainActionBtn');
      const trainBox = await page.locator('#trainActionBtn').boundingBox();
      expect(trainBox).not.toBeNull();
      if (trainBox) {
        expect(trainBox.width).toBeGreaterThanOrEqual(36);
        expect(trainBox.height).toBeGreaterThanOrEqual(36);
      }
      await page.click('#trainActionBtn');

      // Check buy multiplier buttons fit
      await page.waitForSelector('.buy-mult-btn[data-mult="1"]');
      await page.click('.buy-mult-btn[data-mult="10"]');
      await checkNoHorizontalOverflow(page);

      // 3. Header readable & currencies fit
      const headerGoldText = await textOf(page, '#headerGold');
      const headerPowerText = await textOf(page, '#headerPowerDisplay');
      expect(headerGoldText).not.toBe('');
      expect(headerPowerText).not.toBe('');
      await checkNoHorizontalOverflow(page);

      // 4. Test Navigation Across 5 Primary Bottom Tabs
      const primaryTabs = [
        { id: '#navBtn_home', screenSel: '#trainActionBtn' },
        { id: '#navBtn_ascension', screenSel: '#ascensionCardsList' },
        { id: '#navBtn_battle', screenSel: '#trainActionBtn' },
        { id: '#navBtn_heroes', screenSel: '#heroesGrid' },
      ];

      for (const tab of primaryTabs) {
        await page.click(tab.id);
        await page.waitForSelector(tab.screenSel);
        await checkNoHorizontalOverflow(page);
      }

      // 5. Test Secondary Screens via direct screen routing
      const secondaryScreens = [
        { id: 'tower', sel: '#towerFloorNum' },
        { id: 'summon', sel: '#summon1Btn' },
        { id: 'souls', sel: '#openReincarnateModalBtn' },
        { id: 'quests', sel: '#questsContentList' },
        { id: 'dailies', sel: '#claimLoginBtn' },
        { id: 'expeditions', sel: '.claim-btn, .dispatch-select, .empty-state' },
        { id: 'relics', sel: '.equip-btn, .empty-state' },
      ];

      for (const scr of secondaryScreens) {
        await gotoScreen(page, scr.id);
        await page.waitForSelector(scr.sel);
        await checkNoHorizontalOverflow(page);
      }

      // Return to home
      await gotoScreen(page, 'home');
      await page.waitForSelector('#trainActionBtn');

      // 6. Test Modals on this Viewport
      // Settings modal
      await page.click('#headerSettingsBtn');
      await page.waitForSelector('#setSound');
      await checkModalFitsViewport(page);
      await page.click('#settingsCloseBtn');
      await page.waitForSelector('#modalLayer', { state: 'hidden' });

      // Stats modal
      await page.click('#headerStatsBtn');
      await page.waitForSelector('#statsCloseBtn');
      await checkModalFitsViewport(page);
      await page.click('#statsCloseBtn');
      await page.waitForSelector('#modalLayer', { state: 'hidden' });

      // Reincarnate modal
      await gotoScreen(page, 'souls');
      await page.waitForSelector('#openReincarnateModalBtn');
      await page.click('#openReincarnateModalBtn');
      await page.waitForSelector('#confirmReincarnateBtn');
      await checkModalFitsViewport(page);
      await page.click('#cancelReincarnateBtn');
      await page.waitForSelector('#modalLayer', { state: 'hidden' });

      // Summon Result modal
      await gotoScreen(page, 'summon');
      await page.waitForSelector('#summon1Btn');
      await page.click('#summon1Btn');
      await page.waitForSelector('#closeSummonResultBtn');
      await checkModalFitsViewport(page);
      await page.click('#closeSummonResultBtn');
      await page.waitForSelector('#modalLayer', { state: 'hidden' });

      // 7. Check Tap Target Sizes on mobile
      if (vp.isMobile) {
        const navBtns = await page.$$('.nav-tab-btn');
        for (const btn of navBtns) {
          const box = await btn.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(36);
          }
        }
      }

      // Return to home
      await gotoScreen(page, 'home');
      await page.waitForSelector('#trainActionBtn');
      await checkNoHorizontalOverflow(page);

      expectNoErrors(qa.errors);
    });
  }

  test('P59-LiveResize: Desktop (1920x1080) -> Mobile (390x844) -> Desktop (1920x1080)', async ({ page }) => {
    const qa = trackErrors(page);
    
    // Start at FHD Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await boot(page);
    await seedSave(page, {
      rankId: 'S',
      rankIndex: 5,
      power: 50_000,
      gold: 100_000,
      crystals: 500,
    });

    // Check desktop 3-column grid
    await page.waitForSelector('.home-desktop-grid');
    const isDesktopLayout = await page.evaluate(() => {
      const grid = document.querySelector('.home-desktop-grid');
      return grid ? window.getComputedStyle(grid).display === 'grid' : false;
    });
    expect(isDesktopLayout).toBe(true);
    await checkNoHorizontalOverflow(page);

    // Train on desktop
    await page.click('#trainActionBtn');

    // Dynamically resize live to Mobile (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await checkNoHorizontalOverflow(page);

    const isMobileLayout = await page.evaluate(() => {
      const grid = document.querySelector('.home-desktop-grid');
      return grid ? window.getComputedStyle(grid).display === 'flex' || window.getComputedStyle(grid).display === 'block' : true;
    });
    expect(isMobileLayout).toBe(true);

    // Train on mobile
    await page.click('#trainActionBtn');
    await checkNoHorizontalOverflow(page);

    // Dynamically resize live back to FHD Desktop (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(300);
    await checkNoHorizontalOverflow(page);

    // Verify stats did not corrupt
    const power = await page.evaluate(() => (window as any).store?.get()?.power);
    expect(power).toBeGreaterThan(50_000);

    expectNoErrors(qa.errors);
  });
});
