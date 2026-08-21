import { describe, it, expect } from 'vitest';
import {
  SPRITE_DIMENSIONS,
  ANIMATION_BUDGETS,
  COORDINATE_ANCHORS,
  PORTRAIT_CONFIG,
  RARITY_FRAME_STYLES,
  getRarityFrameCss,
  getSpriteScale,
  PIXEL_RENDER_CSS
} from '../src/content/artPipeline';

describe('Phase 46 — Pixel-Anime Art Pipeline Tests', () => {
  it('P46-01 & P46-02: SPRITE_DIMENSIONS specifies valid dimensions and scales for all combatant tiers', () => {
    expect(SPRITE_DIMENSIONS.protagonist.width).toBe(64);
    expect(SPRITE_DIMENSIONS.protagonist.renderScale).toBe(1.0);

    expect(SPRITE_DIMENSIONS.heroPartySupport.width).toBe(56);
    expect(SPRITE_DIMENSIONS.heroPartySupport.renderScale).toBe(0.9);

    expect(SPRITE_DIMENSIONS.minion.width).toBe(64);
    expect(SPRITE_DIMENSIONS.minion.renderScale).toBe(1.0);

    expect(SPRITE_DIMENSIONS.elite.width).toBe(96);
    expect(SPRITE_DIMENSIONS.elite.renderScale).toBeGreaterThan(1.0);

    expect(SPRITE_DIMENSIONS.boss.width).toBe(128);
    expect(SPRITE_DIMENSIONS.boss.renderScale).toBeGreaterThan(SPRITE_DIMENSIONS.elite.renderScale);
  });

  it('P46-03: ANIMATION_BUDGETS defines authoritative 12 FPS animation frames', () => {
    expect(ANIMATION_BUDGETS.idleFrames).toBe(4);
    expect(ANIMATION_BUDGETS.attackFrames).toBe(6);
    expect(ANIMATION_BUDGETS.hurtFrames).toBe(2);
    expect(ANIMATION_BUDGETS.deathFrames).toBe(4);
    expect(ANIMATION_BUDGETS.skillFrames).toBe(8);
    expect(ANIMATION_BUDGETS.fps).toBe(12);
  });

  it('P46-04: COORDINATE_ANCHORS specifies ground line and horizontal placement anchors', () => {
    expect(COORDINATE_ANCHORS.groundYPercent).toBe(72);
    expect(COORDINATE_ANCHORS.protagonistXPercent).toBe(22);
    expect(COORDINATE_ANCHORS.heroPartyXPercent.length).toBe(3);
    expect(COORDINATE_ANCHORS.enemyXPercent).toBe(78);
    expect(COORDINATE_ANCHORS.bossXPercent).toBe(74);
  });

  it('P46-05: PORTRAIT_CONFIG defines standard dimensions for icons, cards, and modal presentation', () => {
    expect(PORTRAIT_CONFIG.iconSize).toBe(48);
    expect(PORTRAIT_CONFIG.cardSize).toBe(128);
    expect(PORTRAIT_CONFIG.summonModalSize).toBe(256);
  });

  it('P46-06: RARITY_FRAME_STYLES and getRarityFrameCss provide distinct styling for all 6 rarities', () => {
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
    for (const r of rarities) {
      const style = RARITY_FRAME_STYLES[r];
      expect(style).toBeDefined();
      expect(style.borderColor).toBeTruthy();
      expect(style.glowColor).toBeTruthy();
      expect(style.badgeSymbol).toBeTruthy();

      const css = getRarityFrameCss(r);
      expect(css).toContain('border:');
      expect(css).toContain('box-shadow:');
    }
  });

  it('P46-09 & P46-15: getSpriteScale and PIXEL_RENDER_CSS apply proper scaling and pixelated rendering', () => {
    expect(getSpriteScale('minion', false)).toBe(1.0);
    expect(getSpriteScale('elite', false)).toBe(1.35);
    expect(getSpriteScale(undefined, true)).toBe(1.75);

    expect(PIXEL_RENDER_CSS).toContain('image-rendering: pixelated;');
  });
});
