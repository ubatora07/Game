import { describe, it, expect } from 'vitest';
import { CAMPAIGN_WORLDS, getCampaignWorldById } from '../src/content/campaignWorlds';
import { CAMPAIGN_ENEMIES } from '../src/content/campaignEnemies';
import { CAMPAIGN_BOSSES } from '../src/content/campaignBosses';
import { getCampaignStageById, getAllCampaignStages, getStagesByWorldId } from '../src/content/campaignStages';
import { I18nService, t } from '../src/services/i18n/I18nService';

describe('Phase 60 — Content Production & Launch Campaign Suite', () => {
  const i18n = I18nService.getInstance();

  it('P60-01: World Data Validation — 5 complete worlds with distinct themes & modifiers', () => {
    expect(CAMPAIGN_WORLDS.length).toBe(5);

    for (let w = 1; w <= 5; w++) {
      const world = getCampaignWorldById(w);
      expect(world).toBeDefined();
      expect(world!.id).toBe(w);
      expect(world!.stageCount).toBe(10);
      expect(world!.emoji.length).toBeGreaterThan(0);
      expect(world!.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(world!.bgGradient).toContain('radial-gradient');
      expect(world!.minRankIndex).toBeGreaterThanOrEqual(0);
      expect(world!.worldModifier.bonusPct).toBeGreaterThan(0);
    }
  });

  it('P60-02: Enemy Family Validation — 5 enemies per world including elite variants', () => {
    const enemies = Object.values(CAMPAIGN_ENEMIES);
    expect(enemies.length).toBeGreaterThanOrEqual(25);

    for (const enemy of enemies) {
      expect(enemy.id.length).toBeGreaterThan(0);
      expect(enemy.defaultName.length).toBeGreaterThan(0);
      expect(enemy.baseHpMultiplier).toBeGreaterThan(0);
      expect(enemy.rewardMultiplier).toBeGreaterThan(0);
      expect(['melee', 'ranged', 'tank', 'magic', 'elite']).toContain(enemy.archetype);
    }

    // Ensure each world 1..5 has at least 1 elite enemy
    const elites = enemies.filter((e) => e.archetype === 'elite');
    expect(elites.length).toBeGreaterThanOrEqual(5);
  });

  it('P60-03: Boss & Lore Validation — mid-boss (X-5) and world boss (X-10) per world', () => {
    const bosses = Object.values(CAMPAIGN_BOSSES);
    expect(bosses.length).toBe(10);

    for (let w = 1; w <= 5; w++) {
      const midBoss = CAMPAIGN_BOSSES[`boss_${w}_5`];
      const worldBoss = CAMPAIGN_BOSSES[`boss_${w}_10`];

      expect(midBoss).toBeDefined();
      expect(midBoss.worldId).toBe(w);
      expect(midBoss.stageId).toBe(`${w}-5`);
      expect(midBoss.timerSeconds).toBeGreaterThanOrEqual(20);
      expect(midBoss.firstClearRewards.crystals).toBeGreaterThan(0);

      expect(worldBoss).toBeDefined();
      expect(worldBoss.worldId).toBe(w);
      expect(worldBoss.stageId).toBe(`${w}-10`);
      expect(worldBoss.timerSeconds).toBeGreaterThanOrEqual(30);
      expect(worldBoss.firstClearRewards.souls).toBeGreaterThan(0);
    }
  });

  it('P60-04: Math Stage Generation — all 50 stages generate valid enemy waves and boss stages', () => {
    const allStages = getAllCampaignStages();
    expect(allStages.length).toBe(50);

    for (let w = 1; w <= 5; w++) {
      const worldStages = getStagesByWorldId(w);
      expect(worldStages.length).toBe(10);

      for (let s = 1; s <= 10; s++) {
        const stageId = `${w}-${s}`;
        const stage = getCampaignStageById(stageId);
        expect(stage).toBeDefined();
        expect(stage!.id).toBe(stageId);
        expect(stage!.worldId).toBe(w);
        expect(stage!.stageNumber).toBe(s);

        if (s === 5 || s === 10) {
          expect(stage!.isBoss).toBe(true);
          expect(stage!.bossId).toBe(`boss_${w}_${s}`);
          expect(stage!.enemyCount).toBe(1);
        } else {
          expect(stage!.isBoss).toBe(false);
          expect(stage!.enemyCount).toBeGreaterThanOrEqual(3);
          expect(stage!.enemyPool.length).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  it('P60-05: Reward Tables & Scaling — progressive gold, power, crystals across worlds', () => {
    let lastGoldReward = 0;
    let lastPowerReward = 0;

    for (let w = 1; w <= 5; w++) {
      const stage = getCampaignStageById(`${w}-1`)!;
      expect(stage.baseRewards.gold).toBeGreaterThan(lastGoldReward);
      expect(stage.baseRewards.power).toBeGreaterThan(lastPowerReward);
      lastGoldReward = stage.baseRewards.gold;
      lastPowerReward = stage.baseRewards.power;

      // Boss first-clear bonus
      const bossStage = getCampaignStageById(`${w}-10`)!;
      const bonus = bossStage.firstClearRewards;
      expect(bonus).toBeDefined();
      expect(bonus.crystals).toBeGreaterThanOrEqual(100);
      expect(bonus.souls).toBeGreaterThanOrEqual(5);
    }
  });

  it('P60-06: Translation Completeness — all Worlds, Enemies, and Bosses localized in RU and EN', () => {
    for (const lang of ['en', 'ru'] as const) {
      i18n.setLanguage(lang);

      // Worlds
      for (const world of CAMPAIGN_WORLDS) {
        const name = t(world.nameKey);
        expect(name).toBeDefined();
        expect(name.length).toBeGreaterThan(0);
        expect(name).not.toBe(world.nameKey);
      }

      // Enemies
      for (const enemy of Object.values(CAMPAIGN_ENEMIES)) {
        const name = t(enemy.nameKey);
        expect(name).toBeDefined();
        expect(name.length).toBeGreaterThan(0);
      }

      // Bosses
      for (const boss of Object.values(CAMPAIGN_BOSSES)) {
        const name = t(boss.nameKey);
        const title = t(boss.titleKey);
        expect(name).toBeDefined();
        expect(name.length).toBeGreaterThan(0);
        expect(title).toBeDefined();
        expect(title.length).toBeGreaterThan(0);
      }
    }
  });
});
