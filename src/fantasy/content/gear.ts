import { GearSlot, ItemRarity, GearItem } from '../core/FantasyState';

export interface GearTemplate {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: ItemRarity;
  minWorld: number;
  baseStats: {
    damagePct?: number;
    critChance?: number;
    attackSpeedPct?: number;
    clickDamagePct?: number;
    goldFindPct?: number;
    bossDamagePct?: number;
  };
  iconSvg: string;
}

export const GEAR_TEMPLATES: GearTemplate[] = [
  // Weapons
  { id: 'rusty_sword', name: 'Rusty Shortsword', slot: 'weapon', rarity: 'common', minWorld: 1, baseStats: { damagePct: 0.15 }, iconSvg: '🗡️' },
  { id: 'iron_broadsword', name: 'Iron Broadsword', slot: 'weapon', rarity: 'uncommon', minWorld: 1, baseStats: { damagePct: 0.35, clickDamagePct: 0.15 }, iconSvg: '⚔️' },
  { id: 'steel_longsword', name: 'Steel Longsword', slot: 'weapon', rarity: 'rare', minWorld: 1, baseStats: { damagePct: 0.70, critChance: 0.05 }, iconSvg: '🗡️' },
  { id: 'elven_saber', name: 'Elven Saber', slot: 'weapon', rarity: 'rare', minWorld: 2, baseStats: { damagePct: 1.20, attackSpeedPct: 0.15 }, iconSvg: '🗡️' },
  { id: 'rune_blade', name: 'Runed Greatsword', slot: 'weapon', rarity: 'epic', minWorld: 2, baseStats: { damagePct: 2.50, bossDamagePct: 0.30 }, iconSvg: '⚔️' },
  { id: 'dragon_slayer', name: 'Dragon Slayer Blade', slot: 'weapon', rarity: 'legendary', minWorld: 3, baseStats: { damagePct: 6.00, critChance: 0.12, bossDamagePct: 0.50 }, iconSvg: '👑' },

  // Armor
  { id: 'cloth_tunic', name: 'Traveler Tunic', slot: 'armor', rarity: 'common', minWorld: 1, baseStats: { goldFindPct: 0.10 }, iconSvg: '🛡️' },
  { id: 'leather_armor', name: 'Studded Leather Vest', slot: 'armor', rarity: 'uncommon', minWorld: 1, baseStats: { damagePct: 0.20, goldFindPct: 0.15 }, iconSvg: '🛡️' },
  { id: 'chainmail', name: 'Reinforced Chainmail', slot: 'armor', rarity: 'rare', minWorld: 1, baseStats: { damagePct: 0.50, clickDamagePct: 0.25 }, iconSvg: '🛡️' },
  { id: 'knight_plate', name: 'Knight Sun Plate', slot: 'armor', rarity: 'rare', minWorld: 2, baseStats: { damagePct: 1.00, goldFindPct: 0.30 }, iconSvg: '🛡️' },
  { id: 'mithril_cuirass', name: 'Mithril Cuirass', slot: 'armor', rarity: 'epic', minWorld: 2, baseStats: { damagePct: 2.20, attackSpeedPct: 0.12 }, iconSvg: '🛡️' },
  { id: 'dragon_plate', name: 'Dragon Scale Armor', slot: 'armor', rarity: 'legendary', minWorld: 3, baseStats: { damagePct: 5.50, bossDamagePct: 0.40, goldFindPct: 0.50 }, iconSvg: '🛡️' },

  // Rings
  { id: 'copper_ring', name: 'Copper Band', slot: 'ring', rarity: 'common', minWorld: 1, baseStats: { clickDamagePct: 0.15 }, iconSvg: '💍' },
  { id: 'silver_ring', name: 'Silver Ring of Fortune', slot: 'ring', rarity: 'uncommon', minWorld: 1, baseStats: { goldFindPct: 0.25 }, iconSvg: '💍' },
  { id: 'jade_band', name: 'Emerald Signet', slot: 'ring', rarity: 'rare', minWorld: 1, baseStats: { critChance: 0.06, damagePct: 0.40 }, iconSvg: '💍' },
  { id: 'ring_of_haste', name: 'Ring of Haste', slot: 'ring', rarity: 'rare', minWorld: 2, baseStats: { attackSpeedPct: 0.20 }, iconSvg: '💍' },
  { id: 'berserker_ring', name: 'Ring of the Berserker', slot: 'ring', rarity: 'epic', minWorld: 2, baseStats: { damagePct: 1.80, critChance: 0.10 }, iconSvg: '💍' },
  { id: 'sovereign_band', name: 'Highland Sovereign Band', slot: 'ring', rarity: 'legendary', minWorld: 3, baseStats: { damagePct: 4.50, attackSpeedPct: 0.25, critChance: 0.15 }, iconSvg: '💍' },
];

export function rollGearDrop(worldId: number, isBoss: boolean): GearItem | null {
  // Drop chance: 15% on normal enemy, 100% on Boss
  const dropRoll = Math.random();
  const threshold = isBoss ? 1.0 : 0.15;
  if (dropRoll > threshold) return null;

  const validTemplates = GEAR_TEMPLATES.filter((t) => t.minWorld <= worldId);
  if (validTemplates.length === 0) return null;

  // Weighted random template
  const template = validTemplates[Math.floor(Math.random() * validTemplates.length)];
  const itemLevel = Math.max(1, worldId * 3 + (isBoss ? 2 : 0));

  return {
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: template.name,
    slot: template.slot,
    rarity: template.rarity,
    level: itemLevel,
    icon: template.iconSvg,
    stats: { ...template.baseStats },
    value: itemLevel * 50,
  };
}
