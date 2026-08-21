/**
 * Unified Single Source of Truth for Battle Screen (1920x1080 reference canvas)
 * Extracted directly from Figma JSON export (BattleScreen_Desktop_1920x1080)
 */
export const BATTLE_LAYOUT = {
  canvas: {
    width: 1920,
    height: 1080,
  },

  background: {
    x: 0,
    y: 137,
    width: 1920,
    height: 760,
  },

  hero: {
    x: 132,
    y: 540,
    width: 302,
    height: 302,
    attackFrames: {
      attack1: { x: 484, y: 533, width: 320, height: 320 },
      attack2: { x: 854, y: 533, width: 320, height: 320 },
      attack3: { x: 1224, y: 533, width: 320, height: 320 },
    },
  },

  enemy: {
    x: 1446,
    y: 540,
    width: 320,
    height: 320,
    hpBar: {
      yOffset: -35,
      normalWidth: 220,
      normalHeight: 28,
      bossWidth: 360,
      bossHeight: 40,
    },
  },

  header: {
    x: 0,
    y: 0,
    width: 1920,
    height: 300,
    brownBg: {
      x: 0,
      y: 0,
      width: 1920,
      height: 86,
    },
    avatar: {
      x: 34,
      y: 92,
      width: 127,
      height: 127,
    },
    upperSlot: {
      x: 200,
      y: 122,
      width: 405,
      height: 42,
    },
    lowerSlot: {
      x: 200,
      y: 176,
      width: 405,
      height: 42,
    },
    centerCrest: {
      x: 740,
      y: 86,
      width: 440,
      height: 108,
    },
    coin: {
      x: 1296,
      y: 137,
      width: 64,
      height: 64,
      textX: 1368,
      textY: 153,
    },
    power: {
      x: 1449,
      y: 140,
      width: 51,
      height: 51,
      textX: 1508,
      textY: 153,
    },
    diamond: {
      x: 1592,
      y: 134,
      width: 64,
      height: 64,
      textX: 1664,
      textY: 153,
    },
    settings: {
      x: 1754,
      y: 102,
      width: 128,
      height: 128,
    },
  },

  footer: {
    x: 0,
    y: 853,
    width: 1920,
    height: 227,
    buttons: {
      battle: { x: 211, topOffset: 30, width: 208, height: 192 },
      hero: { x: 527, topOffset: 35, width: 226, height: 183 },
      gear: { x: 841, topOffset: 44, width: 237, height: 180 },
      upgrades: { x: 1166, topOffset: 48, width: 221, height: 170 },
      world: { x: 1485, topOffset: 35, width: 231, height: 173 },
    },
  },
} as const;
