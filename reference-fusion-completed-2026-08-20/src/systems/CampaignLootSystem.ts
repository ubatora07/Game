import type { EquipmentAffix, EquipmentItem, EquipmentRarity } from '../core/crafting/CraftingTypes';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { getAllEquipmentTemplates, instantiateEquipment } from '../content/equipmentCatalog';
import { CombatPipeline } from './combat/CombatPipeline';

export interface CampaignLootContext {
  stageId: string;
  worldId: number;
  globalStageIndex: number;
  encounterIndex: number;
  enemyId: string;
  isBoss: boolean;
  isElite: boolean;
  isFirstClear: boolean;
  stageCleared: boolean;
  characterClass?: string;
  killSequence: number;
}

export interface CampaignLootRoll {
  item: EquipmentItem | null;
  dropChance: number;
  roll: number;
}

type WeightedRarity = { rarity: EquipmentRarity; weight: number };

const RARITY_AFFIX_COUNT: Record<EquipmentRarity, number> = {
  common: 0,
  rare: 1,
  epic: 1,
  legendary: 2,
  mythic: 2,
};

function weightedPick<T>(entries: Array<{ value: T; weight: number }>, roll: number): T | null {
  const valid = entries.filter((entry) => entry.weight > 0);
  const total = valid.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return null;

  let cursor = roll * total;
  for (const entry of valid) {
    cursor -= entry.weight;
    if (cursor <= 0) return entry.value;
  }
  return valid[valid.length - 1]?.value ?? null;
}

function rarityWeights(stageIndex: number): WeightedRarity[] {
  const index = Math.max(1, stageIndex);
  return [
    { rarity: 'common', weight: Math.max(12, 72 - index * 1.1) },
    { rarity: 'rare', weight: 22 + Math.min(26, index * 0.65) },
    { rarity: 'epic', weight: index >= 6 ? Math.min(30, 4 + (index - 5) * 0.8) : 0 },
    { rarity: 'legendary', weight: index >= 15 ? Math.min(14, 1 + (index - 14) * 0.42) : 0 },
    { rarity: 'mythic', weight: index >= 35 ? Math.min(4, (index - 34) * 0.18) : 0 },
  ];
}

function createRolledAffix(seed: string, ordinal: number): EquipmentAffix {
  const pool: Array<Omit<EquipmentAffix, 'id' | 'value' | 'label'> & {
    min: number;
    max: number;
    label: (value: number) => string;
  }> = [
    { target: 'attack', type: 'percent_add', min: 0.03, max: 0.08, label: (v) => `+${Math.round(v * 100)}% Attack` },
    { target: 'autoAttackDamage', type: 'percent_add', min: 0.04, max: 0.10, label: (v) => `+${Math.round(v * 100)}% Auto Attack Damage` },
    { target: 'bossDamage', type: 'percent_add', min: 0.05, max: 0.12, label: (v) => `+${Math.round(v * 100)}% Boss Damage` },
    { target: 'attackSpeed', type: 'percent_add', min: 0.03, max: 0.08, label: (v) => `+${Math.round(v * 100)}% Attack Speed` },
    { target: 'lootChance', type: 'percent_add', min: 0.04, max: 0.10, label: (v) => `+${Math.round(v * 100)}% Loot Chance` },
  ];

  const choiceRoll = CombatPipeline.deterministicRoll(`${seed}:affix:${ordinal}:choice`);
  const valueRoll = CombatPipeline.deterministicRoll(`${seed}:affix:${ordinal}:value`);
  const definition = pool[Math.min(pool.length - 1, Math.floor(choiceRoll * pool.length))];
  const value = definition.min + (definition.max - definition.min) * valueRoll;

  return {
    id: `drop_${ordinal}_${definition.target}`,
    target: definition.target,
    type: definition.type,
    value,
    label: definition.label(value),
  };
}

/**
 * Campaign equipment drop generator.
 *
 * It deliberately consumes existing EquipmentItem/template/modifier contracts rather
 * than introducing a second inventory model. Selection is level-aware and weighted,
 * while all rolls are keyed to the kill identity so FPS cannot alter loot outcomes.
 */
export class CampaignLootSystem {
  public static rollEquipmentDrop(context: CampaignLootContext): CampaignLootRoll {
    const seed = `${context.stageId}:${context.encounterIndex}:${context.enemyId}:${context.killSequence}`;
    const rawChance = context.isBoss ? 0.28 : context.isElite ? 0.12 : 0.035;
    const clearBonus = context.stageCleared ? 0.025 : 0;
    const contextData = {
      characterClass: context.characterClass,
      isBoss: context.isBoss,
      isElite: context.isElite,
      currentWorld: context.worldId,
      currentStage: context.stageId,
    };

    let dropChance = modifierResolver.resolve('lootChance', rawChance + clearBonus, contextData);
    if (context.isBoss && context.isFirstClear) dropChance = 1;
    dropChance = Math.min(0.9, Math.max(0, dropChance));
    if (context.isBoss && context.isFirstClear) dropChance = 1;

    const dropRoll = CombatPipeline.deterministicRoll(`${seed}:drop`);
    if (dropRoll >= dropChance) {
      return { item: null, dropChance, roll: dropRoll };
    }

    let rarity = weightedPick(
      rarityWeights(context.globalStageIndex).map((entry) => ({ value: entry.rarity, weight: entry.weight })),
      CombatPipeline.deterministicRoll(`${seed}:rarity`),
    ) ?? 'common';

    let candidates = getAllEquipmentTemplates().filter((template) =>
      template.rarity === rarity
      && (!context.characterClass || template.classTags.includes(context.characterClass as never)),
    );

    // Some rarity/class combinations may not exist in the authored catalog. Walk down
    // gracefully instead of creating an invalid or unusable item.
    const rarityFallback: EquipmentRarity[] = ['legendary', 'epic', 'rare', 'common'];
    if (candidates.length === 0) {
      for (const fallback of rarityFallback) {
        candidates = getAllEquipmentTemplates().filter((template) =>
          template.rarity === fallback
          && (!context.characterClass || template.classTags.includes(context.characterClass as never)),
        );
        if (candidates.length > 0) {
          rarity = fallback;
          break;
        }
      }
    }
    if (candidates.length === 0) return { item: null, dropChance, roll: dropRoll };

    // Prefer evolution stages appropriate to progression, while keeping a small chance
    // of a better-than-current-quality find.
    const desiredEvolution = Math.min(4, 1 + Math.floor((context.globalStageIndex - 1) / 12));
    const chosen = weightedPick(
      candidates.map((template) => ({
        value: template,
        weight: 1 / (1 + Math.abs(template.evolutionStage - desiredEvolution) * 1.75),
      })),
      CombatPipeline.deterministicRoll(`${seed}:template`),
    );
    if (!chosen) return { item: null, dropChance, roll: dropRoll };

    const item = instantiateEquipment(chosen.templateId);
    if (!item) return { item: null, dropChance, roll: dropRoll };

    item.level = Math.max(1, context.globalStageIndex);
    const qualityRoll = 0.9 + CombatPipeline.deterministicRoll(`${seed}:quality`) * 0.2;
    const levelScale = 1 + Math.min(1.5, (item.level - 1) * 0.02);
    const statScale = qualityRoll * levelScale;
    for (const key of Object.keys(item.baseStats) as Array<keyof typeof item.baseStats>) {
      const value = item.baseStats[key];
      if (typeof value !== 'number' || value <= 0) continue;
      item.baseStats[key] = key === 'attack' || key === 'defense' || key === 'hp'
        ? Math.max(1, Math.round(value * statScale))
        : Number((value * qualityRoll).toFixed(4));
    }

    const extraAffixCount = RARITY_AFFIX_COUNT[rarity];
    for (let i = 0; i < extraAffixCount; i += 1) {
      const rolled = createRolledAffix(seed, i);
      if (!item.affixes.some((affix) => affix.target === rolled.target && affix.id === rolled.id)) {
        item.affixes.push(rolled);
      }
    }

    return { item, dropChance, roll: dropRoll };
  }
}
