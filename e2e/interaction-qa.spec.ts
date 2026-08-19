import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  boot,
  seedSave,
  trackErrors,
  devClick,
  textOf,
  parseFormatted,
  headerGold,
  headerCrystals,
  headerPower,
  withDevPanel,
} from './helpers';

function expectNoErrors(errors: string[]): void {
  expect(errors, 'Runtime errors (pageerror / console.error)').toEqual([]);
}

async function gotoScreen(page: Page, screenId: string): Promise<void> {
  await page.evaluate((id) => (window as any).events?.emit('screen:change', { screenId: id }), screenId);
  await page.waitForTimeout(100);
}

async function assertNoNanInHeader(page: Page): Promise<void> {
  for (const sel of ['#headerGold', '#headerCrystals', '#headerPowerDisplay']) {
    const txt = await textOf(page, sel);
    expect(txt).not.toMatch(/NaN|Infinity/i);
  }
}

test.describe('Phase 27 — Full Interaction QA', () => {
  test('P27-01 Boot: clean state, UI shell, locked nav', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);

    expect(await textOf(page, '#headerRankFrame')).toBe('E');
    expect(await parseFormatted(await textOf(page, '#headerGold'))).toBe(0);
    expect(await parseFormatted(await textOf(page, '#headerCrystals'))).toBe(150);

    // UX IA V3: exactly six primary domains; deep routes do not leak into the bottom bar.
    for (const subTab of ['home', 'sect', 'ascension', 'tower', 'expeditions', 'summon', 'heroes', 'souls', 'relics', 'quests', 'dailies']) {
      expect(await page.$(`#navBtn_${subTab}`), `deep route ${subTab} not in bottom bar`).toBeNull();
    }
    for (const primaryTab of ['hero', 'team', 'battle', 'settlement', 'world', 'more']) {
      expect(await page.$(`#navBtn_${primaryTab}`), `primary tab ${primaryTab}`).not.toBeNull();
    }

    // Ascend quick button hidden when below threshold
    expect(await page.isVisible('#ascendQuickBtn')).toBe(false);

    // Dead click on unaffordable building: gold stays 0, no negative
    const goldBefore = await headerGold(page);
    await page.click('.buy-building-action-btn[data-building-id="dojo"]');
    await page.waitForTimeout(300);
    expect(await headerGold(page)).toBe(goldBefore);

    // Dead click on incomplete quest claim
    await gotoScreen(page, 'quests');
    await page.waitForSelector('#qcard_quest_train_10 .claim-quest-action-btn');
    await page.click('#qcard_quest_train_10 .claim-quest-action-btn');
    await page.waitForTimeout(300);
    expect(await headerGold(page)).toBe(goldBefore);
    expect(await textOf(page, '#qcard_quest_train_10 .claim-quest-action-btn')).toMatch(/%$/);

    expectNoErrors(qa.errors);
  });

  test('P27-02 Home: Train loop, combo, progress bar', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);

    const powerBefore = parseFormatted(await textOf(page, '#stagePowerNumber'));
    for (let i = 0; i < 10; i++) {
      await page.click('#trainActionBtn');
    }
    const powerAfter = parseFormatted(await textOf(page, '#stagePowerNumber'));
    expect(powerAfter).toBeGreaterThan(powerBefore);

    // Combo display appears after rapid clicks
    await page.waitForSelector('#stageComboDisplay', { state: 'visible', timeout: 5000 });

    // Next goal banner exists and shows progress
    expect(await textOf(page, '#nextGoalText')).toMatch(/%/);
    expect(await textOf(page, '#stageProgressPct')).toMatch(/%/);

    // Stats modal opens/closes (modal lifecycle)
    await page.click('#headerStatsBtn');
    await page.waitForSelector('#modalLayer .modal-backdrop');
    await page.keyboard.press('Escape');
    await page.waitForSelector('#modalLayer', { state: 'hidden' });

    expectNoErrors(qa.errors);
  });

  test('P27-03 Buildings: buy 1 / 10 / 100 / max, milestone, contribution, synergy', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);
    await seedSave(page, { rankId: 'C', rankIndex: 2, gold: 1_000_000_000, crystals: 150 });

    const dojoBtn = '.buy-building-action-btn[data-building-id="dojo"]';
    const ownedSel = '#bcard_dojo .b-owned';

    // buy 1
    await page.click('.buy-mult-btn[data-mult="1"]');
    await page.click(dojoBtn);
    expect(await textOf(page, ownedSel)).toBe('×1');

    // buy 10
    await page.click('.buy-mult-btn[data-mult="10"]');
    await page.click(dojoBtn);
    expect(await textOf(page, ownedSel)).toBe('×11');

    // buy 100
    await page.click('.buy-mult-btn[data-mult="100"]');
    await page.click(dojoBtn);
    expect(await textOf(page, ownedSel)).toBe('×111');

    // buy max
    const goldBefore = await headerGold(page);
    await page.click('.buy-mult-btn[data-mult="max"]');
    await page.click(dojoBtn);
    const ownedAfterMax = await textOf(page, ownedSel);
    expect(parseInt(ownedAfterMax.replace('×', ''), 10)).toBeGreaterThan(111);
    expect(await headerGold(page)).toBeLessThan(goldBefore);

    // milestone multiplier badge appears (e.g. ×16.0)
    expect(await textOf(page, '#bcard_dojo .b-milestone')).toMatch(/×\d+(\.\d+)?/);

    // switch back to 1x multiplier
    await page.click('.buy-mult-btn[data-mult="1"]');

    // second building + contribution % appears
    await page.click('.buy-building-action-btn[data-building-id="meditation_chamber"]');
    expect(await textOf(page, '#bcard_dojo .b-contrib')).not.toBe('');

    // synergy: owning warrior_academy + meditation_chamber unlocks synergy upgrade card
    await page.click('.buy-building-action-btn[data-building-id="warrior_academy"]');
    await page.click('#tabUpgradesBtn');
    await page.waitForSelector('#ucard_spirit_education');

    expectNoErrors(qa.errors);
  });

  test('P27-04 Upgrades: purchase, level up, power rate increases', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);
    await seedSave(page, { gold: 50_000, buildings: { dojo: 5 } });

    await page.click('#tabUpgradesBtn');
    const rateBefore = parseFormatted((await textOf(page, '#stagePowerRate')).replace(/\+/, ''));
    await page.click('.buy-upg-action-btn[data-upgrade-id="dojo_mastery"]');
    expect(await textOf(page, '#ucard_dojo_mastery .u-lvl')).toBe('Lv.1/5');
    const rateAfter = parseFormatted((await textOf(page, '#stagePowerRate')).replace(/\+/, ''));
    expect(rateAfter).toBeGreaterThan(rateBefore);

    // purchase click upgrade -> Lv.1/10
    await page.click('.buy-upg-action-btn[data-upgrade-id="iron_fist"]');
    expect(await textOf(page, '#ucard_iron_fist .u-lvl')).toBe('Lv.1/10');

    expectNoErrors(qa.errors);
  });

  test('P27-05 Quests: claim state transitions 0% -> Claim -> Done, reward applied', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);

    // complete quest_train_10 by clicking 10 times
    for (let i = 0; i < 10; i++) {
      await page.click('#trainActionBtn');
    }

    await gotoScreen(page, 'quests');
    const btnSel = '#qcard_quest_train_10 .claim-quest-action-btn';
    await page.waitForSelector(btnSel);
    expect(await textOf(page, btnSel)).toBe('Claim');

    const goldBefore = await headerGold(page);
    await page.click(btnSel);
    expect(await textOf(page, btnSel)).toBe('✓ Done');
    expect(await headerGold(page)).toBeGreaterThan(goldBefore);

    // achievements tab opens
    await page.click('#tabAchieveBtn');
    await page.waitForSelector('#questsContentList .achievement-card');
    expect(await textOf(page, '#achieveCount')).not.toBe('');

    // claiming twice must not double-reward
    const goldAfter1 = await headerGold(page);
    await page.click('#tabQuestsBtn');
    await page.click(btnSel);
    await page.waitForTimeout(300);
    expect(await headerGold(page)).toBe(goldAfter1);

    expectNoErrors(qa.errors);
  });

  test('P27-06 Rank: quick ascend button, ascension screen, ascend, header updates', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);
    await seedSave(page, { power: 5000, gold: 0 });

    // quick ascend banner appears on home
    await page.waitForSelector('#ascendQuickBtn', { state: 'visible' });
    await page.click('#ascendQuickBtn');

    // ascension screen: D card has ascend button
    await page.waitForSelector('#ascCard_D .ascend-now-btn');
    await page.click('#ascCard_D .ascend-now-btn');

    // close celebratory ascension modal
    await page.waitForSelector('#closeAscensionModalBtn');
    await page.click('#closeAscensionModalBtn');
    await page.waitForSelector('#modalLayer', { state: 'hidden' });

    await page.waitForFunction(() => document.getElementById('headerRankFrame')?.textContent === 'D');
    expect(await textOf(page, '#headerRankTitle')).not.toBe('');

    // completed previous rank shows claim checkmark, current rank shows Current
    await page.click('#headerRankBadge');
    await page.waitForSelector('#ascCard_E');
    expect(await textOf(page, '#ascCard_E .asc-action-slot')).toMatch(/✓/);
    expect(await textOf(page, '#ascCard_D .asc-action-slot')).toMatch(/Current|Текущий/i);

    expectNoErrors(qa.errors);
  });

  test('P27-07 Spirit: golden orb appears and gives reward on click', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);

    // Spawn spirit via dev panel trigger
    await devClick(page, 'devSpawnSpirit');
    await page.waitForSelector('#goldenSpiritOrb', { state: 'visible', timeout: 5000 });

    const powerBefore = parseFormatted(await textOf(page, '#stagePowerNumber'));
    const crystalsBefore = await headerCrystals(page);
    await page.click('#goldenSpiritOrb', { force: true });
    await page.waitForTimeout(500);

    const powerAfter = parseFormatted(await textOf(page, '#stagePowerNumber'));
    const crystalsAfter = await headerCrystals(page);
    expect(powerAfter).toBeGreaterThan(powerBefore);
    expect(crystalsAfter).toBeGreaterThanOrEqual(crystalsBefore + 25);

    expectNoErrors(qa.errors);
  });

  test('P27-08 Tower: saved floor restored, fight (slash), auto-climb toggle', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);
    await seedSave(page, {
      rankId: 'C',
      rankIndex: 2,
      power: 0,
      towerFloor: 15,
      gold: 0,
    });

    await gotoScreen(page, 'tower');
    await page.waitForSelector('#towerFloorNum');
    expect(await textOf(page, '#towerFloorNum')).toBe('15'); // floor restored from save

    // manual slash reduces HP (min damage 5, floor 15 HP ~500)
    const hpBefore = parseFormatted((await textOf(page, '#towerHpText')).split('/')[0]);
    await page.click('#towerEnemyIcon', { force: true });
    await page.waitForTimeout(200);
    const hpAfter = parseFormatted((await textOf(page, '#towerHpText')).split('/')[0]);
    expect(hpAfter).toBeLessThan(hpBefore);

    // auto-climb toggle works
    const labelBefore = await textOf(page, '#autoClimbText');
    await page.click('#toggleAutoClimbBtn');
    const labelAfter = await textOf(page, '#autoClimbText');
    expect(labelAfter).not.toBe(labelBefore);

    expectNoErrors(qa.errors);
  });

  test('P27-09 Tower: loss -> retry (timer reset, floor kept)', async ({ page }) => {
    test.setTimeout(60_000);
    const qa = trackErrors(page);
    await boot(page);
    await seedSave(page, {
      rankId: 'C',
      rankIndex: 2,
      power: 0,
      towerFloor: 15,
      gold: 0,
    });

    await gotoScreen(page, 'tower');
    await page.waitForSelector('#towerTimerText');
    expect(await textOf(page, '#towerFloorNum')).toBe('15');

    // DPS floor is 10, floor 15 HP ~500 -> cannot win in 12s -> defeat
    await page.waitForTimeout(13_500);
    const floorAfter = await textOf(page, '#towerFloorNum');
    const timerAfter = await textOf(page, '#towerTimerText');
    expect(floorAfter).toBe('15'); // retry on same floor
    const timerNum = parseFormatted(timerAfter);
    expect(timerNum).toBeGreaterThan(0);
    expect(timerNum).toBeLessThanOrEqual(12);

    expectNoErrors(qa.errors);
  });

  test('P27-10 Tower: boss floor, victory, rewards', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);
    await seedSave(page, {
      rankId: 'C',
      rankIndex: 2,
      power: 0,
      towerFloor: 10,
      gold: 0,
      buildings: { dojo: 80 },
    });

    await gotoScreen(page, 'tower');
    await page.waitForSelector('#towerFloorNum');
    expect(await textOf(page, '#towerFloorNum')).toBe('10');

    // boss badge visible on floor 10
    await page.waitForSelector('#towerBossBadge', { state: 'visible' });

    const goldAtBoss = await headerGold(page);
    const crystalsAtBoss = await headerCrystals(page);

    // boss dies -> floor 11 + rewards (gold, crystals +25)
    await expect
      .poll(async () => textOf(page, '#towerFloorNum'), { timeout: 10_000, intervals: [50] })
      .toBe('11');
    expect(await headerGold(page)).toBeGreaterThan(goldAtBoss);
    expect(await headerCrystals(page)).toBeGreaterThanOrEqual(crystalsAtBoss + 25);

    expectNoErrors(qa.errors);
  });

  test('P27-11 Summon: 1x pull unlocks new hero, result modal', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);
    await seedSave(page, { rankId: 'A', rankIndex: 4, crystals: 2000 });

    await gotoScreen(page, 'summon');
    await page.waitForSelector('#summon1Btn');

    const crystalsBefore = await headerCrystals(page);
    await page.click('#summon1Btn');
    await page.waitForSelector('#closeSummonResultBtn');
    expect(await textOf(page, '#modalLayer')).toMatch(/NEW/);
    expect(await headerCrystals(page)).toBe(crystalsBefore - 100);

    await page.click('#closeSummonResultBtn');
    await page.waitForSelector('#modalLayer', { state: 'hidden' });

    // hero appears in Heroes screen
    await page.click('#navBtn_team');
    await page.waitForSelector('#teamDomainHub');
    await page.click('[data-domain-action="roster"]');
    await page.waitForSelector('#heroesGrid .hero-card');
    expect(await textOf(page, '#heroesHeaderTitle')).toMatch(/\(1 \/ /);
    expect(await page.$('#heroesGrid .hero-card .star-up-btn')).not.toBeNull();

    expectNoErrors(qa.errors);
  });

  test('P27-12 Summon: 10-pull duplicates -> essence, star-up', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);

    // own every hero -> every pull is a duplicate -> deterministic essence gain
    const ownedHeroes = await page.evaluate(async () => {
      // @ts-expect-error Vite dev-server absolute module path used intentionally in browser context.
      const { HEROES } = await import('/src/content/heroes.ts');
      const heroes: Record<string, { stars: number; duplicates: number }> = {};
      for (const h of HEROES) heroes[h.id] = { stars: 1, duplicates: 0 };
      return heroes;
    });

    await seedSave(page, {
      rankId: 'A',
      rankIndex: 4,
      crystals: 2000,
      essence: 500,
      heroes: ownedHeroes,
    });

    await gotoScreen(page, 'summon');
    await page.click('#summon10Btn');
    await page.waitForSelector('#closeSummonResultBtn');
    await page.click('#closeSummonResultBtn');

    // essence increased from duplicates
    await page.click('#navBtn_team');
    await page.waitForSelector('#teamDomainHub');
    await page.click('[data-domain-action="roster"]');
    await page.waitForSelector('#heroesEssenceDisplay');
    const essence = parseFormatted(await textOf(page, '#heroesEssenceDisplay'));
    expect(essence).toBeGreaterThan(500);

    // star-up: 1 star -> 2 stars
    const starsBefore = (await textOf(page, '#hcard_hiro .h-stars')).match(/⭐/g)?.length ?? 0;
    await page.click('#hcard_hiro .star-up-btn');
    const starsAfter = (await textOf(page, '#hcard_hiro .h-stars')).match(/⭐/g)?.length ?? 0;
    expect(starsAfter).toBe(starsBefore + 1);

    expectNoErrors(qa.errors);
  });

  test('P27-13 Samsara: preview, cancel, confirm, reset, soul purchase', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);
    await seedSave(page, {
      rankId: 'S',
      rankIndex: 5,
      power: 2_000_000_000,
      gold: 0,
      crystals: 150,
      towerFloor: 10,
      stats: { lifetimePower: 2_000_000_000 },
    });

    await gotoScreen(page, 'souls');
    await page.waitForSelector('#openReincarnateModalBtn');

    // preview modal opens, cancel keeps state
    await page.click('#openReincarnateModalBtn');
    await page.waitForSelector('#confirmReincarnateBtn');
    expect(await textOf(page, '#modalLayer')).toMatch(/⚡/);
    await page.click('#cancelReincarnateBtn');
    await page.waitForSelector('#modalLayer', { state: 'hidden' });
    expect(await textOf(page, '#headerRankFrame')).toBe('S');

    // confirm -> reset to Rank E, souls gained
    await page.click('#openReincarnateModalBtn');
    await page.waitForSelector('#confirmReincarnateBtn');
    await page.click('#confirmReincarnateBtn');
    await page.waitForSelector('#modalLayer', { state: 'hidden' });

    await page.waitForFunction(() => document.getElementById('headerRankFrame')?.textContent === 'E');
    expect(await headerPower(page)).toBe(0);
    const soulsOwned = parseFormatted(await textOf(page, '#soulOwnedDisplay'));
    expect(soulsOwned).toBeGreaterThan(0);

    // soul purchase: buy soul_essence (cost 4)
    const soulBtn = '.buy-soul-action-btn[data-skill="soul_essence"]';
    expect(await textOf(page, '#scard_soul_essence .s-lvl')).toBe('Lv.0 / 20');
    await page.click(soulBtn);
    expect(await textOf(page, '#scard_soul_essence .s-lvl')).toBe('Lv.1 / 20');

    expectNoErrors(qa.errors);
  });

  test('P27-14 Offline: claim normal, boosted claim via rewarded ad', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);
    const eightHoursAgo = Date.now() - 8 * 3600 * 1000;
    await seedSave(page, {
      power: 0,
      gold: 0,
      buildings: { dojo: 5 },
      lastSeenAt: eightHoursAgo,
    });

    // offline modal auto-opens on boot
    await page.waitForSelector('#claimOfflineNormalBtn', { timeout: 10_000 });

    // normal claim (1x)
    await page.click('#claimOfflineNormalBtn');
    await page.waitForSelector('#modalLayer', { state: 'hidden' });
    const goldAfterNormal = await headerGold(page);
    expect(goldAfterNormal).toBeGreaterThan(0);

    // boosted claim (3x) via dev skip + rewarded ad (mock = success)
    await devClick(page, 'devSkip8h');
    await page.waitForSelector('#claimOfflineAdBtn');
    const boostModalGold = parseFormatted(await textOf(page, '#offlineGoldReward'));
    const goldBeforeBoost = await headerGold(page);
    await page.click('#claimOfflineAdBtn');
    await page.waitForSelector('#modalLayer', { state: 'hidden' });
    const goldAfterBoost = await headerGold(page);
    expect(goldAfterBoost).toBeGreaterThan(goldBeforeBoost);

    // boosted reward == 3x the shown gains (approx)
    expect(goldAfterBoost - goldBeforeBoost).toBeGreaterThan(boostModalGold * 2);
    expect(goldAfterBoost - goldBeforeBoost).toBeLessThanOrEqual(boostModalGold * 3 + 1);

    expectNoErrors(qa.errors);
  });

  test('P27-15 Settings: toggles, notation, language, close paths', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);
    await seedSave(page, { power: 5000 });

    // open settings modal
    await page.click('#headerSettingsBtn');
    await page.waitForSelector('#setSound');

    // toggles
    await page.click('#setSound');
    await page.click('#setMusic');
    await page.click('#setReducedMotion');
    await page.click('#setScreenShake');
    expect(await page.$eval('#setSound', (el) => (el as HTMLInputElement).checked)).toBe(false);
    expect(await page.$eval('#setMusic', (el) => (el as HTMLInputElement).checked)).toBe(false);
    expect(await page.$eval('#setReducedMotion', (el) => (el as HTMLInputElement).checked)).toBe(true);
    expect(await page.$eval('#setScreenShake', (el) => (el as HTMLInputElement).checked)).toBe(false);

    // notation -> scientific
    await page.selectOption('#setNotation', 'scientific');
    expect(await textOf(page, '#headerPowerDisplay')).toMatch(/e\d+/);

    // switch to RU
    await page.selectOption('#setLang', 'ru');
    await page.waitForSelector('#modalLayer', { state: 'hidden' });
    const navLabelRu = await textOf(page, '#navBtn_team .nav-label');
    expect(navLabelRu).toBe('Команда');

    // switch to EN
    await page.click('#headerSettingsBtn');
    await page.waitForSelector('#setLang');
    await page.selectOption('#setLang', 'en');
    await page.waitForSelector('#modalLayer', { state: 'hidden' });
    const navLabelEn = await textOf(page, '#navBtn_team .nav-label');
    expect(navLabelEn).toBe('Team');

    // close via button
    await page.click('#headerSettingsBtn');
    await page.waitForSelector('#setSound');
    await page.click('#settingsCloseBtn');
    await page.waitForSelector('#modalLayer', { state: 'hidden' });

    // close via Escape
    await page.click('#headerSettingsBtn');
    await page.waitForSelector('#setSound');
    await page.keyboard.press('Escape');
    await page.waitForSelector('#modalLayer', { state: 'hidden' });

    // close via backdrop click
    await page.click('#headerSettingsBtn');
    await page.waitForSelector('#setSound');
    await page.mouse.click(15, 15);
    await page.waitForSelector('#modalLayer', { state: 'hidden' });

    expectNoErrors(qa.errors);
  });

  test('P27-16 Global sweep: dev cheats do not corrupt state (no NaN/Infinity)', async ({ page }) => {
    const qa = trackErrors(page);
    await boot(page);

    await withDevPanel(page, async (p) => {
      await p.click('#devAddGold');
      await p.click('#devAddPower');
      await p.click('#devAddCrystals');
      await p.click('#devAddSouls');
      await p.click('#devAddEssence');
      await p.click('#devAscendRank');
      await p.click('#devSkip1m');
    });

    await assertNoNanInHeader(page);

    // rank ascended to D
    await page.waitForFunction(() => document.getElementById('headerRankFrame')?.textContent === 'D');

    // gold/power actually applied
    expect(await headerGold(page)).toBeGreaterThan(9000);
    expect(await headerPower(page)).toBeGreaterThanOrEqual(50000);

    expectNoErrors(qa.errors);
  });
});
