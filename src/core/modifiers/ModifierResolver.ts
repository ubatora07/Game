import {
  GameModifier,
  ModifierTarget,
  ModifierContext,
  ModifierBreakdown,
  ModifierSourceType,
} from './ModifierTypes';

export class ModifierResolver {
  private static instance: ModifierResolver;
  private modifiers: Map<string, GameModifier> = new Map();

  private constructor() {}

  public static getInstance(): ModifierResolver {
    if (!ModifierResolver.instance) {
      ModifierResolver.instance = new ModifierResolver();
    }
    return ModifierResolver.instance;
  }

  /**
   * Registers a modifier. If a modifier with the same ID exists, it is overwritten.
   */
  public registerModifier(modifier: GameModifier): void {
    if (!Number.isFinite(modifier.value)) {
      console.warn(`[ModifierResolver] Non-finite modifier value for ${modifier.id}: ${modifier.value}`);
      return;
    }
    this.modifiers.set(modifier.id, modifier);
  }

  /**
   * Unregisters a modifier by ID.
   */
  public unregisterModifier(id: string): void {
    this.modifiers.delete(id);
  }

  /**
   * Clears all modifiers of a specific source type (e.g. 'temporary', 'skill_node').
   */
  public clearBySourceType(sourceType: ModifierSourceType): void {
    for (const [id, mod] of this.modifiers.entries()) {
      if (mod.sourceType === sourceType) {
        this.modifiers.delete(id);
      }
    }
  }

  /**
   * Clears all registered modifiers.
   */
  public clearAll(): void {
    this.modifiers.clear();
  }

  /**
   * Resolves the final value for a given target stat.
   * Formula: (Base + sum(Flat)) * (1 + sum(PercentAdd)) * prod(Multipliers)
   */
  public resolve(target: ModifierTarget, baseValue: number, context: ModifierContext = {}): number {
    const breakdown = this.getBreakdown(target, baseValue, context);
    return breakdown.finalValue;
  }

  /**
   * Provides a detailed breakdown of base, flat, percent additions, multipliers, and applied sources.
   */
  public getBreakdown(
    target: ModifierTarget,
    baseValue: number,
    context: ModifierContext = {}
  ): ModifierBreakdown {
    let flatTotal = 0;
    let percentAddTotal = 0;
    let multiplierTotal = 1.0;
    const appliedModifiers: ModifierBreakdown['appliedModifiers'] = [];

    for (const mod of this.modifiers.values()) {
      if (mod.target !== target) continue;

      // Check class tag eligibility
      if (mod.classTag && context.characterClass && mod.classTag !== context.characterClass) {
        continue;
      }

      // Check custom condition
      if (mod.condition && !mod.condition(context)) {
        continue;
      }

      appliedModifiers.push({
        id: mod.id,
        source: mod.source,
        sourceType: mod.sourceType,
        type: mod.type,
        value: mod.value,
      });

      switch (mod.type) {
        case 'flat':
          flatTotal += mod.value;
          break;
        case 'percent_add':
          percentAddTotal += mod.value;
          break;
        case 'multiplier':
          multiplierTotal *= mod.value;
          break;
      }
    }

    const modifiedBase = Math.max(0, baseValue + flatTotal);
    const additiveScale = Math.max(0, 1 + percentAddTotal);
    const finalValue = Math.max(0, modifiedBase * additiveScale * multiplierTotal);

    return {
      target,
      baseValue,
      flatTotal,
      percentAddTotal,
      multiplierTotal,
      finalValue: Number.isFinite(finalValue) ? finalValue : baseValue,
      appliedModifiers,
    };
  }

  /**
   * Returns all currently active modifiers count.
   */
  public getModifierCount(): number {
    return this.modifiers.size;
  }
}

export const modifierResolver = ModifierResolver.getInstance();
