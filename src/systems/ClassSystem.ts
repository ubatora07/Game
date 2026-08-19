import { CharacterClassId, CharacterClassDefinition, getClassById } from '../content/classes';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';

export class ClassSystem {
  private static instance: ClassSystem;
  private selectedClassId: CharacterClassId | null = null;

  private constructor() {
    // Reset/re-apply on Reincarnation
    events.on('reincarnate:complete', () => {
      // Keep or let player re-select on reincarnation
    });
  }

  public static getInstance(): ClassSystem {
    if (!ClassSystem.instance) {
      ClassSystem.instance = new ClassSystem();
    }
    return ClassSystem.instance;
  }

  public getSelectedClass(): CharacterClassDefinition | null {
    if (!this.selectedClassId) return null;
    return getClassById(this.selectedClassId);
  }

  public getSelectedClassId(): CharacterClassId | null {
    return this.selectedClassId;
  }

  public selectClass(classId: CharacterClassId, force: boolean = false): boolean {
    if (this.selectedClassId && !force) {
      console.warn(`[ClassSystem] Class already chosen: ${this.selectedClassId}. Respec required.`);
      return false;
    }

    const def = getClassById(classId);
    if (!def) return false;

    this.selectedClassId = classId;
    this.applyClassModifiers();

    events.emit('toast:show', {
      message: `Path Chosen: ${def.defaultName}!`,
      type: 'epic',
    });

    analytics.trackEvent('class_selected', {
      classId,
      className: def.defaultName,
    });

    return true;
  }

  public applyClassModifiers(): void {
    // Clear previous class modifiers
    modifierResolver.clearBySourceType('class');

    if (!this.selectedClassId) return;
    const def = getClassById(this.selectedClassId);
    if (!def) return;

    const stats = def.baseStats;

    // 1. Attack Multiplier
    modifierResolver.registerModifier({
      id: `class_${def.id}_atk`,
      target: 'attack',
      type: 'multiplier',
      value: stats.attackMultiplier,
      source: `Class: ${def.defaultName}`,
      sourceType: 'class',
      classTag: def.id,
    });

    // 2. Attack Speed Multiplier
    modifierResolver.registerModifier({
      id: `class_${def.id}_spd`,
      target: 'attackSpeed',
      type: 'multiplier',
      value: stats.attackSpeedMultiplier,
      source: `Class: ${def.defaultName}`,
      sourceType: 'class',
      classTag: def.id,
    });

    // 3. Crit Chance Bonus
    if (stats.critChanceBonus > 0) {
      modifierResolver.registerModifier({
        id: `class_${def.id}_crit_chance`,
        target: 'critChance',
        type: 'flat',
        value: stats.critChanceBonus,
        source: `Class: ${def.defaultName}`,
        sourceType: 'class',
        classTag: def.id,
      });
    }

    // 4. Crit Damage Bonus
    if (stats.critDamageBonus > 0) {
      modifierResolver.registerModifier({
        id: `class_${def.id}_crit_dmg`,
        target: 'critDamage',
        type: 'percent_add',
        value: stats.critDamageBonus,
        source: `Class: ${def.defaultName}`,
        sourceType: 'class',
        classTag: def.id,
      });
    }

    // 5. Boss Damage Bonus
    if (stats.bossDamageBonus > 0) {
      modifierResolver.registerModifier({
        id: `class_${def.id}_boss_dmg`,
        target: 'bossDamage',
        type: 'percent_add',
        value: stats.bossDamageBonus,
        source: `Class: ${def.defaultName}`,
        sourceType: 'class',
        classTag: def.id,
      });
    }

    // 6. Loot Bonus
    if (stats.lootBonus > 0) {
      modifierResolver.registerModifier({
        id: `class_${def.id}_loot`,
        target: 'lootChance',
        type: 'percent_add',
        value: stats.lootBonus,
        source: `Class: ${def.defaultName}`,
        sourceType: 'class',
        classTag: def.id,
      });
    }
  }

  public respec(_force: boolean = false): boolean {
    this.selectedClassId = null;
    modifierResolver.clearBySourceType('class');
    return true;
  }
}

export const classSystem = ClassSystem.getInstance();
