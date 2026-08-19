import { RhythmEvaluation, RhythmRating, RhythmConfig } from '../core/rhythm/RhythmTypes';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';

export class RhythmAttackSystem {
  private static instance: RhythmAttackSystem;

  private config: RhythmConfig = {
    bpm: 120,
    perfectWindowMs: 80,
    goodWindowMs: 160,
    minClickIntervalMs: 90,
    streakTimeoutMs: 1500,
  };

  private startTime: number = Date.now();
  private lastHitTime: number = 0;
  private currentStreak: number = 0;
  private maxStreakAchieved: number = 0;
  private isEnabled: boolean = true;
  private easterEggClaimed: boolean = false;

  private constructor() {
    this.updateModifiers();
  }

  public static getInstance(): RhythmAttackSystem {
    if (!RhythmAttackSystem.instance) {
      RhythmAttackSystem.instance = new RhythmAttackSystem();
    }
    return RhythmAttackSystem.instance;
  }

  public getBeatIntervalMs(): number {
    return (60 / this.config.bpm) * 1000;
  }

  public getStreak(): number {
    return this.currentStreak;
  }

  public getMaxStreak(): number {
    return this.maxStreakAchieved;
  }

  public setStartTime(time: number): void {
    this.startTime = time;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.resetStreak();
    }
  }

  public isRhythmEnabled(): boolean {
    return this.isEnabled;
  }

  public getBeatPhase(now: number = Date.now()): number {
    const elapsed = now - this.startTime;
    const interval = this.getBeatIntervalMs();
    return (elapsed % interval) / interval; // 0.0 to 1.0
  }

  public evaluateHit(now: number = Date.now()): RhythmEvaluation {
    if (!this.isEnabled) {
      return {
        rating: 'MISS',
        deltaMs: 999,
        streak: 0,
        critDamageBonus: 0,
        critChanceBonus: 0,
        lootBonus: 0,
        isDebouncedSpam: false,
      };
    }

    // Anti-spam debounce check
    if (this.lastHitTime > 0 && now >= this.lastHitTime && now - this.lastHitTime < this.config.minClickIntervalMs) {
      return {
        rating: 'MISS',
        deltaMs: 999,
        streak: this.currentStreak,
        critDamageBonus: 0,
        critChanceBonus: 0,
        lootBonus: 0,
        isDebouncedSpam: true,
      };
    }

    // Streak timeout check
    if (this.lastHitTime > 0 && now - this.lastHitTime > this.config.streakTimeoutMs) {
      this.currentStreak = 0;
    }

    this.lastHitTime = now;

    // Calculate timing offset to nearest beat
    const elapsed = now - this.startTime;
    const interval = this.getBeatIntervalMs();
    const phaseMs = elapsed % interval;
    const deltaMs = Math.min(phaseMs, interval - phaseMs);

    let rating: RhythmRating = 'MISS';
    if (deltaMs <= this.config.perfectWindowMs) {
      rating = 'PERFECT';
      this.currentStreak += 1;
    } else if (deltaMs <= this.config.goodWindowMs) {
      rating = 'GOOD';
      this.currentStreak += 1;
    } else {
      rating = 'MISS';
      this.currentStreak = 0;
    }

    if (this.currentStreak > this.maxStreakAchieved) {
      this.maxStreakAchieved = this.currentStreak;
    }

    // Progressive Tiered Reward Curve with Diminishing Returns
    let critDamageBonus = 0;
    let critChanceBonus = 0;
    let attackSpeedBonus = 0;
    let lootBonus = 0;
    let goldBonus = 0;
    let allDamageMultiplier = 1.0;

    if (rating !== 'MISS') {
      const s = this.currentStreak;

      // Tier 1: 0-15s (Streak 1-30)
      if (s <= 30) {
        critDamageBonus = s * 0.01;
        critChanceBonus = s * 0.002;
      }
      // Tier 2: 15-60s (Streak 31-120)
      else if (s <= 120) {
        critDamageBonus = 0.30 + (s - 30) * 0.005;
        critChanceBonus = 0.06 + (s - 30) * 0.001;
        attackSpeedBonus = Math.min(0.25, (s - 30) * 0.003);
      }
      // Tier 3: 1-2 min (Streak 121-240)
      else if (s <= 240) {
        critDamageBonus = 0.75 + (s - 120) * 0.002;
        critChanceBonus = 0.15 + (s - 120) * 0.0004;
        attackSpeedBonus = 0.25;
        lootBonus = Math.min(0.60, ((s - 120) / 120) * 0.60);
        goldBonus = Math.min(0.50, ((s - 120) / 120) * 0.50);
      }
      // Tier 4: 2-5 min (Streak 241-600)
      else if (s <= 600) {
        critDamageBonus = Math.min(1.10, 0.99 + (s - 240) * 0.0003);
        critChanceBonus = Math.min(0.20, 0.198 + (s - 240) * 0.0001);
        attackSpeedBonus = 0.25;
        lootBonus = Math.min(0.70, 0.60 + (s - 240) * 0.0003);
        goldBonus = Math.min(0.65, 0.50 + (s - 240) * 0.0004);
        allDamageMultiplier = Math.min(1.35, 1.0 + (s - 240) * 0.001);
      }
      // Tier 5: 5+ min (Streak >600) — Hard Diminishing Caps
      else {
        critDamageBonus = 1.20;
        critChanceBonus = 0.20;
        attackSpeedBonus = 0.30;
        lootBonus = 0.75;
        goldBonus = 0.75;
        allDamageMultiplier = 1.40;
      }
    }

    this.updateModifiers(critDamageBonus, critChanceBonus, attackSpeedBonus, lootBonus, goldBonus, allDamageMultiplier);

    const evaluation: RhythmEvaluation = {
      rating,
      deltaMs,
      streak: this.currentStreak,
      critDamageBonus,
      critChanceBonus,
      lootBonus,
      isDebouncedSpam: false,
    };

    events.emit('rhythm:hit', evaluation);

    // Phase 84: Easter egg trigger at streak >= 500
    if (this.currentStreak >= 500 && !this.easterEggClaimed) {
      this.easterEggClaimed = true;
      events.emit('modal:open', { modalId: 'rhythm_master_easter_egg', data: { streak: this.currentStreak } });
      events.emit('toast:show', { message: '🏆 Easter Egg Unlocked: Rhythm God!', type: 'epic' });
      analytics.trackEvent('rhythm_easter_egg_unlocked', { streak: this.currentStreak });
    }

    if (this.currentStreak > 0 && this.currentStreak % 25 === 0) {
      analytics.trackEvent('rhythm_streak_milestone', {
        streak: this.currentStreak,
        rating,
      });
    }

    return evaluation;
  }

  public isEasterEggClaimed(): boolean {
    return this.easterEggClaimed;
  }

  public triggerEasterEggDebug(): void {
    this.easterEggClaimed = true;
    events.emit('modal:open', { modalId: 'rhythm_master_easter_egg', data: { streak: 500 } });
    events.emit('toast:show', { message: '🏆 Easter Egg Unlocked: Rhythm God!', type: 'epic' });
    analytics.trackEvent('rhythm_easter_egg_unlocked', { streak: 500, isDebug: true });
  }

  public resetStreak(): void {
    this.currentStreak = 0;
    this.lastHitTime = 0;
    this.updateModifiers(0, 0, 0, 0, 0, 1.0);
  }

  private updateModifiers(
    critDmg: number = 0,
    critChance: number = 0,
    atkSpeed: number = 0,
    loot: number = 0,
    gold: number = 0,
    allDmg: number = 1.0
  ): void {
    modifierResolver.clearBySourceType('rhythm');

    if (critDmg > 0) {
      modifierResolver.registerModifier({
        id: 'rhythm_crit_damage',
        target: 'critDamage',
        type: 'percent_add',
        value: critDmg,
        source: 'Rhythm Combo Streak',
        sourceType: 'rhythm',
      });
    }

    if (critChance > 0) {
      modifierResolver.registerModifier({
        id: 'rhythm_crit_chance',
        target: 'critChance',
        type: 'flat',
        value: critChance,
        source: 'Rhythm Combo Streak',
        sourceType: 'rhythm',
      });
    }

    if (atkSpeed > 0) {
      modifierResolver.registerModifier({
        id: 'rhythm_attack_speed',
        target: 'attackSpeed',
        type: 'percent_add',
        value: atkSpeed,
        source: 'Rhythm Combo Streak',
        sourceType: 'rhythm',
      });
    }

    if (loot > 0) {
      modifierResolver.registerModifier({
        id: 'rhythm_loot_bonus',
        target: 'lootMultiplier',
        type: 'percent_add',
        value: loot,
        source: 'Rhythm Combo Streak',
        sourceType: 'rhythm',
      });
    }

    if (gold > 0) {
      modifierResolver.registerModifier({
        id: 'rhythm_gold_bonus',
        target: 'goldMultiplier',
        type: 'percent_add',
        value: gold,
        source: 'Rhythm Combo Streak',
        sourceType: 'rhythm',
      });
    }

    if (allDmg > 1.0) {
      modifierResolver.registerModifier({
        id: 'rhythm_all_damage',
        target: 'attack',
        type: 'multiplier',
        value: allDmg,
        source: 'Rhythm Combo Streak',
        sourceType: 'rhythm',
      });
    }
  }

  public setConfig(customConfig: Partial<RhythmConfig>): void {
    this.config = { ...this.config, ...customConfig };
  }
}

export const rhythmAttackSystem = RhythmAttackSystem.getInstance();
