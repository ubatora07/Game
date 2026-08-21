import { describe, it, expect, beforeEach } from 'vitest';
import { craftingEquipmentSystem } from '../src/systems/CraftingEquipmentSystem';
import { settlementSystem } from '../src/systems/SettlementSystem';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { store } from '../src/core/GameState';
import { EconomySimulator } from '../src/economy/EconomySimulator';
import { getAllCraftingMaterialDefs } from '../src/content/craftingMaterialsCatalog';
import { getAllBlacksmithDefs, getBlacksmithDef } from '../src/content/blacksmithCatalog';
import { getAllEquipmentTemplates, getEquipmentTemplate } from '../src/content/equipmentCatalog';
import { getAllCraftingRecipes } from '../src/content/craftingRecipesCatalog';

describe('Milestone B — Phases 99–102: Crafting Foundation, Blacksmith Discovery, Equipment & Evolution Suite', () => {
  beforeEach(() => {
    settlementSystem.resetAll();
    settlementSystem.unlockSettlement('Mountain Haven');
    settlementSystem.upgradeBuilding('forge'); // Ensure Forge Lv.1
    craftingEquipmentSystem.resetAll();
  });

  /* --------------------------------------------------------------------- */
  /* SAFEGUARDS                                                            */
  /* --------------------------------------------------------------------- */
  it('Safeguard 1: NPC affinity cannot be infinitely farmed via repeated spam', () => {
    settlementSystem.upgradeBuilding('forge');
    const npcId = 'npc_blacksmith_goran';

    // 1st talk: +2 affinity
    const talk1 = settlementSystem.interactWithNPC(npcId);
    expect(talk1.affinityGained).toBe(2);

    // 2nd talk: +2 affinity
    const talk2 = settlementSystem.interactWithNPC(npcId);
    expect(talk2.affinityGained).toBe(2);

    // 3rd talk: +2 affinity
    const talk3 = settlementSystem.interactWithNPC(npcId);
    expect(talk3.affinityGained).toBe(2);

    // 4th talk (exceeds daily cap): +0 affinity
    const talk4 = settlementSystem.interactWithNPC(npcId);
    expect(talk4.affinityGained).toBe(0);
    expect(settlementSystem.getState().npcs[npcId].affinity).toBe(11); // 5 initial + 3*2
  });

  it('Safeguard 2: Settlement materials & crafting economy are modeled and balanced in simulator', () => {
    const simRes = EconomySimulator.simulateCraftingAndEquipmentEconomy();
    expect(simRes.ironOrePerMinute).toBeGreaterThan(1.0);
    expect(simRes.timeToFirstCraftMinutes).toBeLessThanOrEqual(10);
    expect(simRes.timeToStage2EvolutionMinutes).toBeLessThanOrEqual(20);
    expect(simRes.equipmentDpsContributionPct).toBeGreaterThanOrEqual(20);
    expect(simRes.equipmentDpsContributionPct).toBeLessThanOrEqual(50);
    expect(simRes.settlementMaterialConsumptionSustainable).toBe(true);
    expect(simRes.warnings.length).toBe(0);
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 99: CRAFTING FOUNDATION                                         */
  /* --------------------------------------------------------------------- */
  it('P99-01: Crafting blocks when materials or gold are insufficient', () => {
    // Empty player materials and gold
    craftingEquipmentSystem.deductMaterial('material_iron_ore', 50);
    store.set((draft) => {
      draft.gold = 0;
    });

    const check = craftingEquipmentSystem.canCraftRecipe('recipe_wpn_sword_s1');
    expect(check.canCraft).toBe(false);
    expect(check.reason).toBeDefined();

    const craftRes = craftingEquipmentSystem.craftItem('recipe_wpn_sword_s1');
    expect(craftRes.success).toBe(false);
    expect(craftRes.item).toBeUndefined();
  });

  it('P99-02: Successful crafting executes atomic transaction and produces equipment item', () => {
    store.set((draft) => {
      draft.gold = 10000;
    });
    settlementSystem.addMaterials(100, 100, 100);
    craftingEquipmentSystem.addMaterial('material_iron_ore', 20);

    const initialOre = craftingEquipmentSystem.getMaterialCount('material_iron_ore');
    const initialInvCount = craftingEquipmentSystem.getInventory().length;

    const craftRes = craftingEquipmentSystem.craftItem('recipe_wpn_sword_s1');
    expect(craftRes.success).toBe(true);
    expect(craftRes.item).toBeDefined();
    expect(craftRes.item!.name).toContain('Apprentice Greatsword');
    expect(craftRes.item!.slot).toBe('weapon');
    expect(craftRes.item!.evolutionStage).toBe(1);

    // Resources deducted
    expect(craftingEquipmentSystem.getMaterialCount('material_iron_ore')).toBe(initialOre - 10);
    expect(craftingEquipmentSystem.getInventory().length).toBe(initialInvCount + 1);
  });

  it('P99-03: Recipe unlock gating prevents crafting locked higher-tier blueprints', () => {
    expect(craftingEquipmentSystem.isRecipeUnlocked('recipe_wpn_sword_s2_direct')).toBe(false);

    const check = craftingEquipmentSystem.canCraftRecipe('recipe_wpn_sword_s2_direct');
    expect(check.canCraft).toBe(false);
    expect(check.reason).toContain('Recipe locked');

    // Unlocking blueprint allows progression
    craftingEquipmentSystem.unlockRecipe('recipe_wpn_sword_s2_direct');
    expect(craftingEquipmentSystem.isRecipeUnlocked('recipe_wpn_sword_s2_direct')).toBe(true);
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 100: BLACKSMITH DISCOVERY                                       */
  /* --------------------------------------------------------------------- */
  it('P100-01: 4 distinct Blacksmith archetypes exist with specialized bonuses', () => {
    const smiths = getAllBlacksmithDefs();
    expect(smiths.length).toBe(4);

    const goran = getBlacksmithDef('blacksmith_goran')!;
    const kazador = getBlacksmithDef('blacksmith_kazador')!;
    const elenya = getBlacksmithDef('blacksmith_elenya')!;
    const vane = getBlacksmithDef('blacksmith_vane')!;

    expect(goran.archetype).toBe('common');
    expect(kazador.archetype).toBe('dwarf');
    expect(elenya.archetype).toBe('arcane');
    expect(vane.archetype).toBe('shadow');

    expect(goran.qualityBonusMultiplier).toBeGreaterThan(1.0);
    expect(kazador.qualityBonusMultiplier).toBeGreaterThan(1.0);
  });

  it('P100-02: Recruiting Blacksmiths unlocks specialized forge perks', () => {
    expect(craftingEquipmentSystem.isBlacksmithUnlocked('blacksmith_kazador')).toBe(false);
    craftingEquipmentSystem.unlockBlacksmith('blacksmith_kazador');
    expect(craftingEquipmentSystem.isBlacksmithUnlocked('blacksmith_kazador')).toBe(true);

    const switched = craftingEquipmentSystem.setActiveBlacksmith('blacksmith_kazador');
    expect(switched).toBe(true);
    expect(craftingEquipmentSystem.getActiveBlacksmithId()).toBe('blacksmith_kazador');
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 101: EQUIPMENT SYSTEM & MODIFIER INTEGRATION                    */
  /* --------------------------------------------------------------------- */
  it('P101-01: Equipping items attaches to character slot and updates ModifierResolver', () => {
    store.set((draft) => {
      draft.gold = 10000;
    });
    settlementSystem.addMaterials(100, 100, 100);
    const craftRes = craftingEquipmentSystem.craftItem('recipe_wpn_sword_s1');
    const item = craftRes.item!;

    const baseAtkBefore = modifierResolver.resolve('attack', 100);
    craftingEquipmentSystem.equipItem(item.id, 'char_1');

    const baseAtkAfter = modifierResolver.resolve('attack', 100);
    expect(baseAtkAfter).toBeGreaterThan(baseAtkBefore);

    // Unequipping restores stats
    craftingEquipmentSystem.unequipItem('char_1', 'weapon');
    expect(modifierResolver.resolve('attack', 100)).toBe(baseAtkBefore);
  });

  it('P101-02: Slot replacement automatically unequips previous item in same slot', () => {
    store.set((draft) => {
      draft.gold = 20000;
    });
    settlementSystem.addMaterials(200, 200, 200);

    const sword1 = craftingEquipmentSystem.craftItem('recipe_wpn_sword_s1').item!;
    const bow1 = craftingEquipmentSystem.craftItem('recipe_wpn_bow_s1').item!;

    craftingEquipmentSystem.equipItem(sword1.id, 'char_1');
    expect(craftingEquipmentSystem.getEquippedItem('char_1', 'weapon')?.id).toBe(sword1.id);

    craftingEquipmentSystem.equipItem(bow1.id, 'char_1');
    expect(craftingEquipmentSystem.getEquippedItem('char_1', 'weapon')?.id).toBe(bow1.id);
    expect(craftingEquipmentSystem.getItemById(sword1.id)?.equippedCharacterSlot).toBeNull();
  });

  /* --------------------------------------------------------------------- */
  /* PHASE 102: EQUIPMENT EVOLUTION ENGINE                                  */
  /* --------------------------------------------------------------------- */
  it('P102-01: Equipment evolves across stages, upgrading base stats and awakening new affixes', () => {
    store.set((draft) => {
      draft.gold = 50000;
    });
    settlementSystem.addMaterials(300, 300, 300);
    craftingEquipmentSystem.addMaterial('material_rare_meteorite', 20);

    const sword = craftingEquipmentSystem.craftItem('recipe_wpn_sword_s1').item!;
    expect(sword.evolutionStage).toBe(1);
    expect(sword.rarity).toBe('common');
    expect(sword.baseStats.attack).toBe(28); // 25 + 10% Goran bonus

    // Evolve to Stage 2
    const canEvolve = craftingEquipmentSystem.canEvolveItem(sword.id);
    expect(canEvolve.canEvolve).toBe(true);

    const evolveRes = craftingEquipmentSystem.evolveItem(sword.id);
    expect(evolveRes.success).toBe(true);
    expect(evolveRes.evolvedItem!.evolutionStage).toBe(2);
    expect(evolveRes.evolvedItem!.rarity).toBe('rare');
    expect(evolveRes.evolvedItem!.name).toContain('Reinforced Runesword');
    expect(evolveRes.evolvedItem!.baseStats.attack).toBe(65);
    expect(evolveRes.evolvedItem!.affixes.some((a) => a.id === 'sword_s2_boss')).toBe(true);
  });

  it('P102-02: Samsara reset preserves legendary/evolved gear while resetting raw materials cleanly', () => {
    store.set((draft) => {
      draft.gold = 50000;
    });
    settlementSystem.addMaterials(300, 300, 300);
    craftingEquipmentSystem.addMaterial('material_iron_ore', 100);

    const sword = craftingEquipmentSystem.craftItem('recipe_wpn_sword_s1').item!;
    craftingEquipmentSystem.equipItem(sword.id, 'char_1');

    // Trigger Samsara Rebirth
    craftingEquipmentSystem.resetForSamsara();

    expect(craftingEquipmentSystem.getInventory().length).toBeGreaterThan(0);
    expect(craftingEquipmentSystem.getEquippedItem('char_1', 'weapon')?.id).toBe(sword.id);
    expect(craftingEquipmentSystem.getMaterialCount('material_iron_ore')).toBeGreaterThanOrEqual(30);
  });
});
