import { describe, it, expect, beforeEach } from 'vitest';
import { I18nService, t } from '../src/services/i18n/I18nService';
import { CAMPAIGN_WORLDS } from '../src/content/campaignWorlds';
import { CAMPAIGN_BOSSES } from '../src/content/campaignBosses';

describe('Phase 57 — Localization Revalidation Suite', () => {
  let i18n: I18nService;

  beforeEach(() => {
    i18n = I18nService.getInstance();
    i18n.setLanguage('en');
  });

  it('P57-01: verifies all Campaign and Ad translation keys in English', () => {
    i18n.setLanguage('en');

    expect(t('campaign.title')).toBe('Campaign');
    expect(t('campaign.world')).toBe('World');
    expect(t('campaign.stage')).toBe('Stage');
    expect(t('campaign.boss')).toBe('Boss');
    expect(t('campaign.mode_progress')).toBe('PROGRESS');
    expect(t('campaign.mode_farm')).toBe('FARM');
    expect(t('campaign.mode_rush')).toBe('RUSH');
    expect(t('campaign.mode_boss_blocked')).toBe('BLOCKED');
    expect(t('ad.boss_boost.title')).toBe('Boss Combat Surge');
    expect(t('ad.boss_chest.title')).toBe('Bonus Boss Treasure');
  });

  it('P57-02: verifies all Campaign and Ad translation keys in Russian', () => {
    i18n.setLanguage('ru');

    expect(t('campaign.title')).toBe('Кампания');
    expect(t('campaign.world')).toBe('Мир');
    expect(t('campaign.stage')).toBe('Этап');
    expect(t('campaign.boss')).toBe('Босс');
    expect(t('campaign.mode_progress')).toBe('ПРОГРЕСС');
    expect(t('campaign.mode_farm')).toBe('ФАРМ');
    expect(t('campaign.mode_rush')).toBe('РАШ');
    expect(t('campaign.mode_boss_blocked')).toBe('БЛОКИРОВКА');
    expect(t('ad.boss_boost.title')).toBe('Боевой прилив на босса');
    expect(t('ad.boss_chest.title')).toBe('Бонусный сундук босса');
  });

  it('P57-03: all Campaign World name keys exist in both RU and EN', () => {
    for (const world of CAMPAIGN_WORLDS) {
      i18n.setLanguage('en');
      const nameEn = t(world.nameKey);
      expect(nameEn).toBeDefined();
      expect(nameEn.length).toBeGreaterThan(0);
      expect(nameEn).not.toBe(world.nameKey);

      i18n.setLanguage('ru');
      const nameRu = t(world.nameKey);
      expect(nameRu).toBeDefined();
      expect(nameRu.length).toBeGreaterThan(0);
      expect(nameRu).not.toBe(world.nameKey);
    }
  });

  it('P57-04: all Boss name and title keys exist in both RU and EN', () => {
    for (const boss of Object.values(CAMPAIGN_BOSSES)) {
      i18n.setLanguage('en');
      const bossNameEn = t(boss.nameKey);
      const bossTitleEn = t(boss.titleKey);
      expect(bossNameEn.length).toBeGreaterThan(0);
      expect(bossTitleEn.length).toBeGreaterThan(0);

      i18n.setLanguage('ru');
      const bossNameRu = t(boss.nameKey);
      const bossTitleRu = t(boss.titleKey);
      expect(bossNameRu.length).toBeGreaterThan(0);
      expect(bossTitleRu.length).toBeGreaterThan(0);
    }
  });

  it('P57-05: dynamic language switching updates all campaign text strings cleanly', () => {
    i18n.setLanguage('en');
    expect(t('campaign.auto_advance_on')).toBe('AUTO ON');

    i18n.setLanguage('ru');
    expect(t('campaign.auto_advance_on')).toBe('АВТО ВКЛ');
  });
});
