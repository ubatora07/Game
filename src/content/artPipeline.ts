/**
 * Anime Infinite Ascension — Pixel-Anime Art Pipeline Specification & Presets
 * Standardizes dimensions, animation frame budgets, coordinate anchors, and rarity framing.
 */

export interface SpriteDimensions {
  width: number;
  height: number;
  renderScale: number;
}

export interface AnimationFrameBudget {
  idleFrames: number;
  attackFrames: number;
  hurtFrames: number;
  deathFrames: number;
  skillFrames: number;
  fps: number;
}

export interface CoordinateAnchors {
  groundYPercent: number;
  protagonistXPercent: number;
  heroPartyXPercent: number[];
  enemyXPercent: number;
  bossXPercent: number;
}

export interface RarityFrameStyle {
  borderColor: string;
  glowColor: string;
  gradientBackground: string;
  badgeSymbol: string;
  badgeColor: string;
  particleColor: string;
}

export const SPRITE_DIMENSIONS: Record<string, SpriteDimensions> = {
  protagonist: { width: 64, height: 64, renderScale: 1.0 },
  heroPartySupport: { width: 56, height: 56, renderScale: 0.9 },
  minion: { width: 64, height: 64, renderScale: 1.0 },
  elite: { width: 96, height: 96, renderScale: 1.35 },
  boss: { width: 128, height: 128, renderScale: 1.75 }
};

export const ANIMATION_BUDGETS: AnimationFrameBudget = {
  idleFrames: 4,
  attackFrames: 6,
  hurtFrames: 2,
  deathFrames: 4,
  skillFrames: 8,
  fps: 12
};

export const COORDINATE_ANCHORS: CoordinateAnchors = {
  groundYPercent: 72,
  protagonistXPercent: 22,
  heroPartyXPercent: [8, 13, 18],
  enemyXPercent: 78,
  bossXPercent: 74
};

export const PORTRAIT_CONFIG = {
  iconSize: 48,
  cardSize: 128,
  summonModalSize: 256,
  aspectRatio: '1:1'
};

export const RARITY_FRAME_STYLES: Record<string, RarityFrameStyle> = {
  common: {
    borderColor: 'rgba(148, 163, 184, 0.6)',
    glowColor: 'rgba(148, 163, 184, 0.2)',
    gradientBackground: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))',
    badgeSymbol: 'C',
    badgeColor: '#94a3b8',
    particleColor: '#94a3b8'
  },
  uncommon: {
    borderColor: 'rgba(34, 197, 94, 0.8)',
    glowColor: 'rgba(34, 197, 94, 0.35)',
    gradientBackground: 'linear-gradient(135deg, rgba(20, 83, 45, 0.4), rgba(15, 23, 42, 0.95))',
    badgeSymbol: 'UC',
    badgeColor: '#22c55e',
    particleColor: '#4ade80'
  },
  rare: {
    borderColor: 'rgba(59, 130, 246, 0.85)',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    gradientBackground: 'linear-gradient(135deg, rgba(30, 58, 138, 0.5), rgba(15, 23, 42, 0.95))',
    badgeSymbol: 'R',
    badgeColor: '#3b82f6',
    particleColor: '#60a5fa'
  },
  epic: {
    borderColor: 'rgba(168, 85, 247, 0.9)',
    glowColor: 'rgba(168, 85, 247, 0.55)',
    gradientBackground: 'linear-gradient(135deg, rgba(88, 28, 135, 0.5), rgba(15, 23, 42, 0.95))',
    badgeSymbol: 'SR',
    badgeColor: '#a855f7',
    particleColor: '#c084fc'
  },
  legendary: {
    borderColor: 'rgba(234, 179, 8, 0.95)',
    glowColor: 'rgba(234, 179, 8, 0.65)',
    gradientBackground: 'linear-gradient(135deg, rgba(113, 63, 18, 0.6), rgba(15, 23, 42, 0.95))',
    badgeSymbol: 'SSR',
    badgeColor: '#eab308',
    particleColor: '#fde047'
  },
  mythic: {
    borderColor: 'rgba(236, 72, 153, 1.0)',
    glowColor: 'rgba(236, 72, 153, 0.75)',
    gradientBackground: 'linear-gradient(135deg, rgba(131, 24, 67, 0.6), rgba(15, 23, 42, 0.95))',
    badgeSymbol: 'UR',
    badgeColor: '#ec4899',
    particleColor: '#f472b6'
  }
};

export function getRarityFrameCss(rarity: string): string {
  const style = RARITY_FRAME_STYLES[rarity.toLowerCase()] || RARITY_FRAME_STYLES.common;
  return `
    border: 2px solid ${style.borderColor};
    box-shadow: 0 0 16px ${style.glowColor}, inset 0 0 8px ${style.glowColor};
    background: ${style.gradientBackground};
  `;
}

export function getSpriteScale(archetype?: string, isBoss?: boolean): number {
  if (isBoss) return SPRITE_DIMENSIONS.boss.renderScale;
  if (archetype === 'elite') return SPRITE_DIMENSIONS.elite.renderScale;
  return SPRITE_DIMENSIONS.minion.renderScale;
}

export const PIXEL_RENDER_CSS = `
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-crisp-edges;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  transform: translateZ(0);
`;

/**
 * Runtime pixel-art scaling contract.
 * Production raster/atlas assets must use nearest-neighbor sampling and integer display scaling.
 * Procedural fallbacks follow the same logical canvas sizes so they can be replaced without layout changes.
 */
export const PIXEL_SCALE_RULES = {
  interpolation: 'nearest-neighbor' as const,
  nativeScale: 1,
  allowedIntegerScales: [1, 2, 3, 4] as const,
  requireIntegerScaleForRaster: true,
  allowFractionalContainerFit: false,
  seamlessWorldTileWidthPx: 192,
};
