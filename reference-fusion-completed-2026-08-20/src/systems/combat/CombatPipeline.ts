import { modifierResolver } from '../../core/modifiers/ModifierResolver';
import type { ModifierContext, ModifierTarget } from '../../core/modifiers/ModifierTypes';

export type CombatDamageSource = 'manual' | 'auto' | 'skill' | 'pet';

export interface CombatTargetContext {
  id: string;
  isBoss: boolean;
  isElite: boolean;
}

export interface CombatAttackRequest {
  source: CombatDamageSource;
  baseDamage: number;
  target: CombatTargetContext;
  stageId: string;
  worldId: number;
  characterClass?: string;
  critChance?: number;
  critMultiplier?: number;
  forceCrit?: boolean;
  canCrit?: boolean;
  roll?: number;
  attackAlreadyIncludesCrit?: boolean;
}

export interface CombatAttackResolution {
  damage: number;
  isCrit: boolean;
  critChance: number;
  critMultiplier: number;
  preCritDamage: number;
  context: ModifierContext;
}

const SOURCE_DAMAGE_TARGET: Partial<Record<CombatDamageSource, ModifierTarget>> = {
  manual: 'manualAttackDamage',
  auto: 'autoAttackDamage',
  skill: 'spellAttack',
  pet: 'petDamage',
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Stateless combat action pipeline.
 *
 * The simulation owns *when* an action happens; this module owns only the
 * deterministic stat/modifier/critical-hit calculation for that action.
 * Rendering never participates in damage resolution.
 */
export class CombatPipeline {
  public static resolveAttack(request: CombatAttackRequest): CombatAttackResolution {
    const context: ModifierContext = {
      characterClass: request.characterClass,
      isBoss: request.target.isBoss,
      isElite: request.target.isElite,
      isManual: request.source === 'manual',
      currentWorld: request.worldId,
      currentStage: request.stageId,
      damageSource: request.source,
      targetId: request.target.id,
    };

    let damage = Math.max(0, request.baseDamage);

    // Shared outgoing attack layer, then source-specific action layer.
    damage = modifierResolver.resolve('attack', damage, context);
    const sourceTarget = SOURCE_DAMAGE_TARGET[request.source];
    if (sourceTarget) {
      damage = modifierResolver.resolve(sourceTarget, damage, context);
    }

    // Target-specific layers are represented as multipliers around a neutral 1.
    if (request.target.isBoss) {
      damage *= modifierResolver.resolve('bossDamage', 1, context);
    } else if (request.target.isElite) {
      damage *= modifierResolver.resolve('eliteDamage', 1, context);
    }

    const requestedCritChance = request.critChance ?? 0;
    const requestedCritMultiplier = request.critMultiplier ?? 1;
    const critChance = clamp(modifierResolver.resolve('critChance', requestedCritChance, context), 0, 0.95);
    const critMultiplier = Math.max(1, modifierResolver.resolve('critDamage', requestedCritMultiplier, context));

    const preCritDamage = Math.max(0, damage);
    const canCrit = request.canCrit !== false && !request.attackAlreadyIncludesCrit;
    const roll = clamp(request.roll ?? 1, 0, 1);
    const isCrit = request.attackAlreadyIncludesCrit
      ? Boolean(request.forceCrit)
      : canCrit && (request.forceCrit === true || roll < critChance);

    if (isCrit && !request.attackAlreadyIncludesCrit) {
      damage *= critMultiplier;
    }

    return {
      damage: Math.max(0, Math.floor(damage)),
      isCrit,
      critChance,
      critMultiplier,
      preCritDamage,
      context,
    };
  }

  public static expectedCritFactor(critChance: number, critMultiplier: number): number {
    const chance = clamp(critChance, 0, 0.95);
    const multiplier = Math.max(1, critMultiplier);
    return 1 + chance * (multiplier - 1);
  }

  /** Stable pseudo-random roll tied to an action identity, not to frame count. */
  public static deterministicRoll(seed: string): number {
    let hash = 2166136261;
    for (let i = 0; i < seed.length; i += 1) {
      hash ^= seed.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 0x100000000;
  }
}
