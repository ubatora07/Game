import { MainCharacterSlotId, MainCharacterState, DualTeamSaveState } from '../core/characters/MainCharacterTypes';
import { CharacterClassId, getClassById } from '../content/classes';
import { SkillNodeDefinition } from '../content/skillTrees';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';
import { t } from '../services/i18n/I18nService';

export class PartyTeamSystem {
  private static instance: PartyTeamSystem;

  private characters: Record<MainCharacterSlotId, MainCharacterState> = {
    char_1: {
      slotId: 'char_1',
      name: 'Ascendant Hero',
      isUnlocked: true,
      classId: null,
      level: 1,
      skillPoints: 4,
      unlockedSkillNodeIds: [],
    },
    char_2: {
      slotId: 'char_2',
      name: 'Soul Partner',
      isUnlocked: false,
      classId: null,
      level: 1,
      skillPoints: 4,
      unlockedSkillNodeIds: [],
    },
  };

  private activeFocusCharId: MainCharacterSlotId = 'char_1';

  private constructor() {
    this.reapplyAllModifiers();
  }

  public static getInstance(): PartyTeamSystem {
    if (!PartyTeamSystem.instance) {
      PartyTeamSystem.instance = new PartyTeamSystem();
    }
    return PartyTeamSystem.instance;
  }

  public getCharacter(slotId: MainCharacterSlotId): MainCharacterState {
    return this.characters[slotId];
  }

  public getAllCharacters(): MainCharacterState[] {
    return Object.values(this.characters);
  }

  public getActiveFocusSlot(): MainCharacterSlotId {
    return this.activeFocusCharId;
  }

  public setActiveFocusSlot(slotId: MainCharacterSlotId): void {
    if (this.characters[slotId].isUnlocked) {
      this.activeFocusCharId = slotId;
      events.emit('toast:show', {
        message: t('toast.party.focus', { name: this.characters[slotId].name }),
        type: 'info',
      });
    }
  }

  public unlockSecondCharacter(name: string = 'Soul Partner', classId?: CharacterClassId): boolean {
    if (this.characters.char_2.isUnlocked) {
      return false; // Already unlocked
    }

    this.characters.char_2.isUnlocked = true;
    this.characters.char_2.name = name;
    if (classId) {
      this.characters.char_2.classId = classId;
    }

    this.reapplyAllModifiers();

    events.emit('toast:show', {
      message: t('toast.party.partner_unlocked', { name }),
      type: 'epic',
    });

    analytics.trackEvent('second_character_unlocked', {
      slotId: 'char_2',
      name,
      classId: classId ?? 'none',
    });

    events.emit('party:second_character_unlocked', {
      slotId: 'char_2',
      name,
      classId,
    });

    return true;
  }

  public setCharacterClass(
    slotId: MainCharacterSlotId,
    classId: CharacterClassId,
    emitFeedback: boolean = true
  ): boolean {
    const char = this.characters[slotId];
    if (!char.isUnlocked) return false;

    char.classId = classId;
    char.unlockedSkillNodeIds = []; // reset tree upon class change
    char.skillPoints = 4;

    this.reapplyAllModifiers();

    if (emitFeedback) {
      events.emit('toast:show', {
        message: t('toast.party.class_selected', { name: char.name, className: t(getClassById(classId)?.nameKey || classId) }),
        type: 'epic',
      });

      analytics.trackEvent('character_class_selected', {
        slotId,
        classId,
      });
    }

    events.emit('party:character_class_selected', {
      slotId,
      classId,
    });

    return true;
  }

  public clearCharacterClass(slotId: MainCharacterSlotId): boolean {
    const char = this.characters[slotId];
    if (!char.isUnlocked) return false;

    char.classId = null;
    char.unlockedSkillNodeIds = [];
    char.skillPoints = 4;
    this.reapplyAllModifiers();
    return true;
  }

  public unlockSkillNode(
    slotId: MainCharacterSlotId,
    node: SkillNodeDefinition,
    allNodes: SkillNodeDefinition[]
  ): boolean {
    const char = this.characters[slotId];
    if (!char.isUnlocked || char.classId !== node.classId) return false;

    if (char.unlockedSkillNodeIds.includes(node.id)) return false;
    if (char.skillPoints < node.costPoints) return false;

    // Prerequisite check
    if (node.tier > 1) {
      if (!node.parentId || !char.unlockedSkillNodeIds.includes(node.parentId)) {
        return false;
      }
    }

    // Mutual exclusivity
    const sameTier = allNodes.filter((n) => n.tier === node.tier && char.unlockedSkillNodeIds.includes(n.id));
    if (sameTier.length > 0) {
      return false;
    }

    char.unlockedSkillNodeIds.push(node.id);
    char.skillPoints -= node.costPoints;

    this.reapplyAllModifiers();
    return true;
  }

  public respecTree(slotId: MainCharacterSlotId, allNodes: SkillNodeDefinition[]): void {
    const char = this.characters[slotId];
    if (!char.isUnlocked) return;

    let refunded = 0;
    for (const nodeId of char.unlockedSkillNodeIds) {
      const def = allNodes.find((n) => n.id === nodeId);
      if (def) refunded += def.costPoints;
    }

    char.unlockedSkillNodeIds = [];
    char.skillPoints += refunded;

    this.reapplyAllModifiers();
  }

  public reapplyAllModifiers(): void {
    modifierResolver.clearBySourceType('class');
    modifierResolver.clearBySourceType('skill_node');

    for (const slotId of ['char_1', 'char_2'] as MainCharacterSlotId[]) {
      const char = this.characters[slotId];
      if (!char.isUnlocked || !char.classId) continue;

      const classDef = getClassById(char.classId);
      if (classDef) {
        // Base Class Multipliers
        const stats = classDef.baseStats;
        modifierResolver.registerModifier({
          id: `${slotId}_class_atk`,
          target: 'attack',
          type: 'multiplier',
          value: stats.attackMultiplier,
          source: `${char.name} Class: ${classDef.defaultName}`,
          sourceType: 'class',
          classTag: char.classId,
        });

        modifierResolver.registerModifier({
          id: `${slotId}_class_spd`,
          target: 'attackSpeed',
          type: 'multiplier',
          value: stats.attackSpeedMultiplier,
          source: `${char.name} Class: ${classDef.defaultName}`,
          sourceType: 'class',
          classTag: char.classId,
        });

        if (stats.critChanceBonus > 0) {
          modifierResolver.registerModifier({
            id: `${slotId}_class_crit_ch`,
            target: 'critChance',
            type: 'flat',
            value: stats.critChanceBonus,
            source: `${char.name} Class: ${classDef.defaultName}`,
            sourceType: 'class',
            classTag: char.classId,
          });
        }

        if (stats.critDamageBonus > 0) {
          modifierResolver.registerModifier({
            id: `${slotId}_class_crit_dmg`,
            target: 'critDamage',
            type: 'percent_add',
            value: stats.critDamageBonus,
            source: `${char.name} Class: ${classDef.defaultName}`,
            sourceType: 'class',
            classTag: char.classId,
          });
        }

        if (stats.bossDamageBonus > 0) {
          modifierResolver.registerModifier({
            id: `${slotId}_class_boss`,
            target: 'bossDamage',
            type: 'percent_add',
            value: stats.bossDamageBonus,
            source: `${char.name} Class: ${classDef.defaultName}`,
            sourceType: 'class',
            classTag: char.classId,
          });
        }

        if (stats.lootBonus > 0) {
          modifierResolver.registerModifier({
            id: `${slotId}_class_loot`,
            target: 'lootChance',
            type: 'percent_add',
            value: stats.lootBonus,
            source: `${char.name} Class: ${classDef.defaultName}`,
            sourceType: 'class',
            classTag: char.classId,
          });
        }
      }
    }
  }

  public getCombinedProtagonistPower(): number {
    let totalBase = 0;
    if (this.characters.char_1.isUnlocked) totalBase += 100 * this.characters.char_1.level;
    if (this.characters.char_2.isUnlocked) totalBase += 100 * this.characters.char_2.level;

    return modifierResolver.resolve('attack', totalBase);
  }

  public serialize(): DualTeamSaveState {
    return {
      characters: {
        char_1: { ...this.characters.char_1 },
        char_2: { ...this.characters.char_2 },
      },
      activeFocusCharId: this.activeFocusCharId,
    };
  }

  public deserialize(state?: Partial<DualTeamSaveState>): void {
    if (state?.characters?.char_1) {
      this.characters.char_1 = { ...state.characters.char_1 };
    }
    if (state?.characters?.char_2) {
      this.characters.char_2 = { ...state.characters.char_2 };
    }
    if (state?.activeFocusCharId) {
      this.activeFocusCharId = state.activeFocusCharId;
    }
    this.reapplyAllModifiers();
  }

  public resetAll(): void {
    this.characters = {
      char_1: {
        slotId: 'char_1',
        name: 'Ascendant Hero',
        isUnlocked: true,
        classId: null,
        level: 1,
        skillPoints: 4,
        unlockedSkillNodeIds: [],
      },
      char_2: {
        slotId: 'char_2',
        name: 'Soul Partner',
        isUnlocked: false,
        classId: null,
        level: 1,
        skillPoints: 4,
        unlockedSkillNodeIds: [],
      },
    };
    this.activeFocusCharId = 'char_1';
    this.reapplyAllModifiers();
  }
}

export const partyTeamSystem = PartyTeamSystem.getInstance();
