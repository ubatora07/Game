/**
 * Unified Single Source of Truth for Battle Screen (1920x1080 reference canvas)
 */
export const BATTLE_LAYOUT = {
  canvas: {
    width: 1920,
    height: 1080,
  },

  background: {
    x: 0,
    y: 135,
    width: 1920,
    height: 760,
  },

  hero: {
    x: 132,
    y: 540,
    width: 320,
    height: 320,
  },

  enemy: {
    x: 1429,
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
      x: 60,
      y: 106,
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
      x: 1282,
      y: 124,
      width: 64,
      height: 64,
    },
    power: {
      x: 1455,
      y: 130,
      width: 51,
      height: 51,
    },
    diamond: {
      x: 1606,
      y: 124,
      width: 64,
      height: 64,
    },
    settings: {
      x: 1788,
      y: 108,
      width: 96,
      height: 96,
    },
  },

  footer: {
    x: 0,
    y: 853,
    width: 1920,
    height: 227,
    buttons: {
      battle: { x: 217, topOffset: 20, width: 208, height: 192 },
      hero: { x: 517, topOffset: 24, width: 226, height: 183 },
      gear: { x: 847, topOffset: 27, width: 237, height: 180 },
      upgrades: { x: 1172, topOffset: 32, width: 221, height: 170 },
      world: { x: 1491, topOffset: 29, width: 231, height: 173 },
    },
  },
} as const;
