import {
  CraftingMaterialId,
  CraftingSaveState,
  EquipmentItem,
  EquipmentSlot,
  BlacksmithId,
} from '../core/crafting/CraftingTypes';
import { getCraftingRecipe } from '../content/craftingRecipesCatalog';
import { getBlacksmithDef } from '../content/blacksmithCatalog';
import {
  getEquipmentTemplate,
  instantiateEquipment,
  getNextEvolutionTemplateId,
} from '../content/equipmentCatalog';
import { settlementSystem } from './SettlementSystem';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { store } from '../core/GameState';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';
import { t } from '../services/i18n/I18nService';

export class CraftingEquipmentSystem {
  private static instance: CraftingEquipmentSystem;

  private state: CraftingSaveState = {
    materials: {
      material_iron_ore: 50,
      material_rare_meteorite: 15,
      material_arcane_essence: 8,
      material_boss_dragon_scale: 2,
    },
    inventory: [],
    unlockedRecipes: [
      'recipe_wpn_sword_s1',
      'recipe_wpn_bow_s1',
      'recipe_wpn_staff_s1',
      'recipe_wpn_dagger_s1',
      'recipe_arm_plate_s1',
      'recipe_arm_leather_s1',
      'recipe_acc_ring_s1',
      'recipe_acc_amulet_s1',
    ],
    unlockedBlacksmiths: {
      blacksmith_goran: true,
      blacksmith_kazador: false,
      blacksmith_elenya: false,
      blacksmith_vane: false,
    },
    activeBlacksmithId: 'blacksmith_goran',
    totalCraftedCount: 0,
    totalEvolvedCount: 0,
  };

  private constructor() {
    this.reapplyEquipmentModifiers();

    // Auto-discover blacksmiths through adventure and combat events
    events.on('adventure:choice_executed' as any, (data: any) => {
      if (data?.choiceId === 'rescue_dwarf_miner') {
        this.unlockBlacksmith('blacksmith_kazador');
      }
    });

    events.on('tower:floorCleared' as any, (data: any) => {
      if (data?.floor >= 10 && !this.state.unlockedBlacksmiths.blacksmith_elenya) {
        this.unlockBlacksmith('blacksmith_elenya');
      }
    });

    events.on('karma:shifted' as any, (data: any) => {
      if (data?.newScore <= -20 && !this.state.unlockedBlacksmiths.blacksmith_vane) {
        this.unlockBlacksmith('blacksmith_vane');
      }
    });
  }

  public static getInstance(): CraftingEquipmentSystem {
    if (!CraftingEquipmentSystem.instance) {
      CraftingEquipmentSystem.instance = new CraftingEquipmentSystem();
    }
    return CraftingEquipmentSystem.instance;
  }

  /* --------------------------------------------------------------------- */
  /* MATERIALS MANAGEMENT                                                  */
  /* --------------------------------------------------------------------- */
  public getMaterials(): Record<CraftingMaterialId, number> {
    return { ...this.state.materials };
  }

  public getMaterialCount(matId: CraftingMaterialId): number {
    return this.state.materials[matId] || 0;
  }

  public addMaterial(matId: CraftingMaterialId, count: number): void {
    if (count <= 0) return;
    this.state.materials[matId] = (this.state.materials[matId] || 0) + count;
    events.emit('crafting:material_added' as any, { matId, count });
  }

  public deductMaterial(matId: CraftingMaterialId, count: number): boolean {
    if ((this.state.materials[matId] || 0) < count) return false;
    this.state.materials[matId] -= count;
    return true;
  }

  /* --------------------------------------------------------------------- */
  /* BLACKSMITH MANAGEMENT                                                 */
  /* --------------------------------------------------------------------- */
  public getActiveBlacksmithId(): BlacksmithId {
    return this.state.activeBlacksmithId;
  }

  public setActiveBlacksmith(id: BlacksmithId): boolean {
    if (!this.state.unlockedBlacksmiths[id]) return false;
    this.state.activeBlacksmithId = id;
    events.emit('crafting:blacksmith_changed' as any, { activeBlacksmithId: id });
    return true;
  }

  public unlockBlacksmith(id: BlacksmithId): boolean {
    if (this.state.unlockedBlacksmiths[id]) return false;
    this.state.unlockedBlacksmiths[id] = true;

    const def = getBlacksmithDef(id);
    events.emit('toast:show', {
      message: t('toast.crafting.blacksmith_unlocked', { name: def ? t(def.nameKey) : id }),
      type: 'epic',
    });

    events.emit('crafting:blacksmith_unlocked' as any, { blacksmithId: id });
    analytics.trackEvent('blacksmith_unlocked', { blacksmithId: id });
    return true;
  }

  public isBlacksmithUnlocked(id: BlacksmithId): boolean {
    return Boolean(this.state.unlockedBlacksmiths[id]);
  }

  /* --------------------------------------------------------------------- */
  /* RECIPE & CRAFTING ENGINE                                              */
  /* --------------------------------------------------------------------- */
  public isRecipeUnlocked(recipeId: string): boolean {
    return this.state.unlockedRecipes.includes(recipeId);
  }

  public unlockRecipe(recipeId: string): boolean {
    if (this.isRecipeUnlocked(recipeId)) return false;
    this.state.unlockedRecipes.push(recipeId);

    const recipe = getCraftingRecipe(recipeId);
    events.emit('toast:show', {
      message: t('toast.crafting.recipe_unlocked', { name: recipe ? t(recipe.nameKey) : recipeId }),
      type: 'success',
    });

    events.emit('crafting:recipe_unlocked' as any, { recipeId });
    return true;
  }

  public canCraftRecipe(recipeId: string): {
    canCraft: boolean;
    reason?: string;
  } {
    const recipe = getCraftingRecipe(recipeId);
    if (!recipe) return { canCraft: false, reason: 'Recipe not found' };

    if (!this.isRecipeUnlocked(recipeId) && !recipe.unlockedByDefault) {
      return { canCraft: false, reason: 'Recipe locked' };
    }

    // Check Forge level in Settlement
    const forgeState = settlementSystem.getBuildingState('forge');
    const currentForgeLevel = forgeState?.isConstructed ? forgeState.level : 0;
    if (currentForgeLevel < recipe.requiredForgeLevel) {
      return { canCraft: false, reason: `Requires Forge Level ${recipe.requiredForgeLevel}` };
    }

    // Check Blacksmith requirement
    if (recipe.requiredBlacksmithId && !this.isBlacksmithUnlocked(recipe.requiredBlacksmithId)) {
      const bDef = getBlacksmithDef(recipe.requiredBlacksmithId);
      return { canCraft: false, reason: `Requires ${bDef?.defaultName || 'Specialized Blacksmith'}` };
    }

    // Check Gold
    const currentGold = store.get().gold;
    if (currentGold < recipe.requiredGold) {
      return { canCraft: false, reason: 'Insufficient Gold' };
    }

    // Check Settlement Materials (wood/stone/iron)
    const sMats = settlementSystem.getMaterials();
    if (recipe.requiredWood && sMats.wood < recipe.requiredWood) {
      return { canCraft: false, reason: 'Insufficient Wood' };
    }
    if (recipe.requiredStone && sMats.stone < recipe.requiredStone) {
      return { canCraft: false, reason: 'Insufficient Stone' };
    }
    if (recipe.requiredIron && sMats.iron < recipe.requiredIron) {
      return { canCraft: false, reason: 'Insufficient Iron' };
    }

    // Check Crafting Materials
    for (const [matId, needed] of Object.entries(recipe.requiredMaterials)) {
      const current = this.state.materials[matId as CraftingMaterialId] || 0;
      if (current < (needed || 0)) {
        return { canCraft: false, reason: `Insufficient ${matId.replace('material_', '').replace('_', ' ')}` };
      }
    }

    return { canCraft: true };
  }

  public craftItem(recipeId: string): { success: boolean; item?: EquipmentItem; reason?: string } {
    const check = this.canCraftRecipe(recipeId);
    if (!check.canCraft) {
      return { success: false, reason: check.reason };
    }

    const recipe = getCraftingRecipe(recipeId)!;

    // Deduct Gold
    store.set((draft) => {
      draft.gold -= recipe.requiredGold;
    });

    // Deduct Settlement Materials
    settlementSystem.addMaterials(
      -(recipe.requiredWood || 0),
      -(recipe.requiredStone || 0),
      -(recipe.requiredIron || 0)
    );

    // Deduct Crafting Materials
    for (const [matId, needed] of Object.entries(recipe.requiredMaterials)) {
      this.deductMaterial(matId as CraftingMaterialId, needed || 0);
    }

    // Instantiate equipment item
    const item = instantiateEquipment(recipe.resultTemplateId);
    if (!item) {
      return { success: false, reason: 'Failed to create item template' };
    }

    // Apply active blacksmith bonus multiplier
    const activeSmith = getBlacksmithDef(this.state.activeBlacksmithId);
    if (activeSmith && activeSmith.preferredSlots.includes(item.slot)) {
      if (item.baseStats.attack) {
        item.baseStats.attack = Math.round(item.baseStats.attack * activeSmith.qualityBonusMultiplier);
      }
      if (item.baseStats.defense) {
        item.baseStats.defense = Math.round(item.baseStats.defense * activeSmith.qualityBonusMultiplier);
      }
    }

    this.state.inventory.push(item);
    this.state.totalCraftedCount += 1;

    events.emit('toast:show', {
      message: t('toast.crafting.forged', { name: t(getEquipmentTemplate(item.templateId)?.nameKey || item.name), rarity: t(`equipment.rarity.${item.rarity}`) }),
      type: 'success',
    });

    events.emit('crafting:item_crafted', {
      item,
      recipeId,
      totalCraftedCount: this.state.totalCraftedCount,
    });
    analytics.trackEvent('item_crafted', { itemId: item.id, templateId: item.templateId, rarity: item.rarity });

    return { success: true, item };
  }

  /* --------------------------------------------------------------------- */
  /* INVENTORY & EQUIPMENT MANAGEMENT                                      */
  /* --------------------------------------------------------------------- */
  public getInventory(slotFilter?: EquipmentSlot): EquipmentItem[] {
    if (!slotFilter) return [...this.state.inventory];
    return this.state.inventory.filter((i) => i.slot === slotFilter);
  }

  public addItemToInventory(item: EquipmentItem): void {
    this.state.inventory.push(item);
    this.reapplyEquipmentModifiers();
  }

  public getItemById(itemId: string): EquipmentItem | undefined {
    return this.state.inventory.find((i) => i.id === itemId);
  }

  public getEquippedItem(characterSlot: 'char_1' | 'char_2', slot: EquipmentSlot): EquipmentItem | undefined {
    return this.state.inventory.find(
      (i) => i.equippedCharacterSlot === characterSlot && i.slot === slot
    );
  }

  public equipItem(itemId: string, characterSlot: 'char_1' | 'char_2'): boolean {
    const item = this.getItemById(itemId);
    if (!item) return false;

    // Unequip currently equipped item in that slot for this character
    const existing = this.getEquippedItem(characterSlot, item.slot);
    if (existing) {
      existing.equippedCharacterSlot = null;
    }

    item.equippedCharacterSlot = characterSlot;
    this.reapplyEquipmentModifiers();

    events.emit('toast:show', {
      message: t('toast.crafting.equipped', { name: t(getEquipmentTemplate(item.templateId)?.nameKey || item.name), target: t(characterSlot === 'char_1' ? 'team.protagonist' : 'team.partner') }),
      type: 'info',
    });

    events.emit('equipment:equipped' as any, { itemId, characterSlot, slot: item.slot });
    analytics.trackEvent('item_equipped', { itemId, characterSlot, templateId: item.templateId });
    return true;
  }

  public unequipItem(characterSlot: 'char_1' | 'char_2', slot: EquipmentSlot): boolean {
    const item = this.getEquippedItem(characterSlot, slot);
    if (!item) return false;

    item.equippedCharacterSlot = null;
    this.reapplyEquipmentModifiers();

    events.emit('equipment:unequipped' as any, { itemId: item.id, characterSlot, slot });
    return true;
  }

  /* --------------------------------------------------------------------- */
  /* PHASE 102: EQUIPMENT EVOLUTION ENGINE                                  */
  /* --------------------------------------------------------------------- */
  public canEvolveItem(itemId: string): {
    canEvolve: boolean;
    nextTemplate?: any;
    reason?: string;
  } {
    const item = this.getItemById(itemId);
    if (!item) return { canEvolve: false, reason: 'Item not found' };

    if (item.evolutionStage >= item.maxEvolutionStage) {
      return { canEvolve: false, reason: 'Max Evolution Stage reached' };
    }

    const nextTemplateId = getNextEvolutionTemplateId(item.templateId);
    if (!nextTemplateId) {
      return { canEvolve: false, reason: 'No higher evolution tier defined' };
    }

    const currentTemplate = getEquipmentTemplate(item.templateId);
    const cost = currentTemplate?.evolutionCost;
    if (!cost) {
      return { canEvolve: false, reason: 'No evolution cost configured' };
    }

    // Check Forge Level
    const forgeState = settlementSystem.getBuildingState('forge');
    const currentForgeLevel = forgeState?.isConstructed ? forgeState.level : 0;
    if (currentForgeLevel < cost.requiredForgeLevel) {
      return { canEvolve: false, reason: `Requires Forge Level ${cost.requiredForgeLevel}` };
    }

    // Check Gold
    if (store.get().gold < cost.gold) {
      return { canEvolve: false, reason: 'Insufficient Gold for Evolution' };
    }

    // Check Materials
    for (const [matId, needed] of Object.entries(cost.materials)) {
      const current = this.state.materials[matId as CraftingMaterialId] || 0;
      if (current < (needed || 0)) {
        return { canEvolve: false, reason: `Insufficient ${matId.replace('material_', '')}` };
      }
    }

    const nextTemplate = getEquipmentTemplate(nextTemplateId);
    return { canEvolve: true, nextTemplate };
  }

  public evolveItem(itemId: string): { success: boolean; evolvedItem?: EquipmentItem; reason?: string } {
    const check = this.canEvolveItem(itemId);
    if (!check.canEvolve) {
      return { success: false, reason: check.reason };
    }

    const item = this.getItemById(itemId)!;
    const currentTemplate = getEquipmentTemplate(item.templateId)!;
    const nextTemplate = check.nextTemplate!;
    const cost = currentTemplate.evolutionCost!;

    // Deduct Gold
    store.set((draft) => {
      draft.gold -= cost.gold;
    });

    // Deduct Materials
    for (const [matId, needed] of Object.entries(cost.materials)) {
      this.deductMaterial(matId as CraftingMaterialId, needed || 0);
    }

    // Transform item attributes while preserving custom/rolled affixes
    item.templateId = nextTemplate.templateId;
    item.name = nextTemplate.defaultName;
    item.rarity = nextTemplate.rarity;
    item.evolutionStage = nextTemplate.evolutionStage;
    item.baseStats = { ...nextTemplate.baseStats };
    item.iconSvg = nextTemplate.iconSvg;
    item.flavorText = nextTemplate.flavorText;

    // Merge next stage affixes without duplicate ids
    for (const newAffix of nextTemplate.affixes) {
      if (!item.affixes.some((a) => a.id === newAffix.id)) {
        item.affixes.push({ ...newAffix });
      }
    }

    this.state.totalEvolvedCount += 1;
    this.reapplyEquipmentModifiers();

    events.emit('toast:show', {
      message: t('toast.crafting.evolved', { name: t(nextTemplate.nameKey), stage: item.evolutionStage }),
      type: 'epic',
    });

    events.emit('equipment:evolved' as any, { item, newStage: item.evolutionStage });
    analytics.trackEvent('item_evolved', { itemId: item.id, templateId: item.templateId, stage: item.evolutionStage });

    return { success: true, evolvedItem: item };
  }

  /* --------------------------------------------------------------------- */
  /* MODIFIER RESOLVER INTEGRATION                                         */
  /* --------------------------------------------------------------------- */
  public reapplyEquipmentModifiers(): void {
    modifierResolver.clearBySourceType('equipment' as any);

    for (const item of this.state.inventory) {
      if (!item.equippedCharacterSlot) continue;

      const charLabel = item.equippedCharacterSlot === 'char_1' ? 'Protagonist' : 'Partner';

      // 1. Base Stats
      if (item.baseStats.attack) {
        modifierResolver.registerModifier({
          id: `equip_${item.id}_atk`,
          target: 'attack',
          type: 'flat',
          value: item.baseStats.attack,
          source: `${charLabel} Equipment: ${item.name}`,
          sourceType: 'equipment' as any,
        });
      }

      if (item.baseStats.defense) {
        modifierResolver.registerModifier({
          id: `equip_${item.id}_def`,
          target: 'settlementDefense',
          type: 'flat',
          value: item.baseStats.defense,
          source: `${charLabel} Equipment: ${item.name}`,
          sourceType: 'equipment' as any,
        });
      }

      if (item.baseStats.speed) {
        modifierResolver.registerModifier({
          id: `equip_${item.id}_spd`,
          target: 'attackSpeed',
          type: 'percent_add',
          value: item.baseStats.speed,
          source: `${charLabel} Equipment: ${item.name}`,
          sourceType: 'equipment' as any,
        });
      }

      if (item.baseStats.critChance) {
        modifierResolver.registerModifier({
          id: `equip_${item.id}_crit`,
          target: 'critChance',
          type: 'percent_add',
          value: item.baseStats.critChance,
          source: `${charLabel} Equipment: ${item.name}`,
          sourceType: 'equipment' as any,
        });
      }

      if (item.baseStats.critDamage) {
        modifierResolver.registerModifier({
          id: `equip_${item.id}_cdmg`,
          target: 'critDamage',
          type: 'percent_add',
          value: item.baseStats.critDamage,
          source: `${charLabel} Equipment: ${item.name}`,
          sourceType: 'equipment' as any,
        });
      }

      if (item.baseStats.bossDamage) {
        modifierResolver.registerModifier({
          id: `equip_${item.id}_boss`,
          target: 'bossDamage',
          type: 'percent_add',
          value: item.baseStats.bossDamage,
          source: `${charLabel} Equipment: ${item.name}`,
          sourceType: 'equipment' as any,
        });
      }

      // 2. Custom Affixes
      for (const affix of item.affixes) {
        modifierResolver.registerModifier({
          id: `equip_${item.id}_${affix.id}`,
          target: affix.target,
          type: affix.type,
          value: affix.value,
          source: `${charLabel} Affix: ${affix.label}`,
          sourceType: 'equipment' as any,
        });
      }
    }
  }

  /* --------------------------------------------------------------------- */
  /* SERIALIZATION & SAMSARA LIFECYCLE                                     */
  /* --------------------------------------------------------------------- */
  public resetForSamsara(): void {
    // Retains legendary/evolved equipment and recipes, resets base raw ores to starter values
    this.state.materials.material_iron_ore = Math.max(30, Math.floor(this.state.materials.material_iron_ore * 0.5));
    this.state.materials.material_rare_meteorite = Math.max(10, Math.floor(this.state.materials.material_rare_meteorite * 0.5));
    this.reapplyEquipmentModifiers();
  }

  public resetAll(): void {
    this.state = {
      materials: {
        material_iron_ore: 50,
        material_rare_meteorite: 15,
        material_arcane_essence: 8,
        material_boss_dragon_scale: 2,
      },
      inventory: [],
      unlockedRecipes: [
        'recipe_wpn_sword_s1',
        'recipe_wpn_bow_s1',
        'recipe_wpn_staff_s1',
        'recipe_wpn_dagger_s1',
        'recipe_arm_plate_s1',
        'recipe_arm_leather_s1',
        'recipe_acc_ring_s1',
        'recipe_acc_amulet_s1',
      ],
      unlockedBlacksmiths: {
        blacksmith_goran: true,
        blacksmith_kazador: false,
        blacksmith_elenya: false,
        blacksmith_vane: false,
      },
      activeBlacksmithId: 'blacksmith_goran',
      totalCraftedCount: 0,
      totalEvolvedCount: 0,
    };
    this.reapplyEquipmentModifiers();
  }

  public serialize(): CraftingSaveState {
    return {
      ...this.state,
      materials: { ...this.state.materials },
      inventory: this.state.inventory.map((i) => ({ ...i, baseStats: { ...i.baseStats }, affixes: [...i.affixes] })),
      unlockedRecipes: [...this.state.unlockedRecipes],
      unlockedBlacksmiths: { ...this.state.unlockedBlacksmiths },
    };
  }

  public deserialize(data?: Partial<CraftingSaveState>): void {
    if (!data) return;
    this.state = {
      ...this.state,
      ...data,
      materials: { ...this.state.materials, ...(data.materials || {}) },
      inventory: (data.inventory || []).map((i) => ({ ...i, baseStats: { ...i.baseStats }, affixes: [...(i.affixes || [])] })),
      unlockedRecipes: [...(data.unlockedRecipes || this.state.unlockedRecipes)],
      unlockedBlacksmiths: { ...this.state.unlockedBlacksmiths, ...(data.unlockedBlacksmiths || {}) },
      activeBlacksmithId: data.activeBlacksmithId || 'blacksmith_goran',
    };
    this.reapplyEquipmentModifiers();
  }
}

export const craftingEquipmentSystem = CraftingEquipmentSystem.getInstance();
