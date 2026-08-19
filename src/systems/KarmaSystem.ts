import { KarmaBand, KarmaState, KarmaBandInfo, KARMA_BANDS } from '../core/karma/KarmaTypes';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';

export class KarmaSystem {
  private static instance: KarmaSystem;

  private score: number = 0;
  private majorChoiceFlags: Record<string, boolean> = {};
  private factionReputation: Record<string, number> = {};
  private lifetimeKarmaPositive: number = 0;
  private lifetimeKarmaNegative: number = 0;

  private constructor() {
    this.reapplyKarmaModifiers();
  }

  public static getInstance(): KarmaSystem {
    if (!KarmaSystem.instance) {
      KarmaSystem.instance = new KarmaSystem();
    }
    return KarmaSystem.instance;
  }

  public getScore(): number {
    return this.score;
  }

  public setScore(score: number): void {
    const clamped = Math.max(-100, Math.min(100, Math.round(score)));
    this.score = clamped;
    this.reapplyKarmaModifiers();
  }

  public getKarmaBand(): KarmaBand {
    return KarmaSystem.calculateBand(this.score);
  }

  public getKarmaBandInfo(): KarmaBandInfo {
    return KARMA_BANDS[this.getKarmaBand()];
  }

  public static calculateBand(score: number): KarmaBand {
    if (score >= 50) return 'virtuous';
    if (score >= 15) return 'positive';
    if (score <= -50) return 'infamous';
    if (score <= -15) return 'negative';
    return 'neutral';
  }

  /* --------------------------------------------------------------------- */
  /* KARMA CONSEQUENCES V2: DYNAMIC MODIFIERS                             */
  /* --------------------------------------------------------------------- */
  public reapplyKarmaModifiers(): void {
    modifierResolver.clearBySourceType('karma');

    const band = this.getKarmaBand();
    if (band === 'virtuous') {
      modifierResolver.registerModifier({
        id: 'karma_v2_virtuous_power',
        target: 'powerMultiplier',
        type: 'percent_add',
        value: 0.15,
        source: 'Virtuous Alignment',
        sourceType: 'karma',
      });
      modifierResolver.registerModifier({
        id: 'karma_v2_virtuous_discount',
        target: 'merchantDiscount',
        type: 'flat',
        value: 0.10,
        source: 'Virtuous Alignment',
        sourceType: 'karma',
      });
      modifierResolver.registerModifier({
        id: 'karma_v2_virtuous_defense',
        target: 'settlementDefense',
        type: 'flat',
        value: 40,
        source: 'Virtuous Alignment',
        sourceType: 'karma',
      });
    } else if (band === 'positive') {
      modifierResolver.registerModifier({
        id: 'karma_v2_positive_power',
        target: 'powerMultiplier',
        type: 'percent_add',
        value: 0.08,
        source: 'Positive Alignment',
        sourceType: 'karma',
      });
      modifierResolver.registerModifier({
        id: 'karma_v2_positive_discount',
        target: 'merchantDiscount',
        type: 'flat',
        value: 0.05,
        source: 'Positive Alignment',
        sourceType: 'karma',
      });
      modifierResolver.registerModifier({
        id: 'karma_v2_positive_defense',
        target: 'settlementDefense',
        type: 'flat',
        value: 20,
        source: 'Positive Alignment',
        sourceType: 'karma',
      });
    } else if (band === 'infamous') {
      modifierResolver.registerModifier({
        id: 'karma_v2_infamous_crit_dmg',
        target: 'critDamage',
        type: 'percent_add',
        value: 0.30,
        source: 'Infamous Alignment',
        sourceType: 'karma',
      });
      modifierResolver.registerModifier({
        id: 'karma_v2_infamous_boss_dmg',
        target: 'bossDamage',
        type: 'percent_add',
        value: 0.15,
        source: 'Infamous Alignment',
        sourceType: 'karma',
      });
      modifierResolver.registerModifier({
        id: 'karma_v2_infamous_defense_penalty',
        target: 'settlementDefense',
        type: 'flat',
        value: -20,
        source: 'Infamous Alignment',
        sourceType: 'karma',
      });
    } else if (band === 'negative') {
      modifierResolver.registerModifier({
        id: 'karma_v2_negative_crit_dmg',
        target: 'critDamage',
        type: 'percent_add',
        value: 0.15,
        source: 'Negative Alignment',
        sourceType: 'karma',
      });
      modifierResolver.registerModifier({
        id: 'karma_v2_negative_boss_dmg',
        target: 'bossDamage',
        type: 'percent_add',
        value: 0.08,
        source: 'Negative Alignment',
        sourceType: 'karma',
      });
      modifierResolver.registerModifier({
        id: 'karma_v2_negative_defense_penalty',
        target: 'settlementDefense',
        type: 'flat',
        value: -10,
        source: 'Negative Alignment',
        sourceType: 'karma',
      });
    } else {
      // Neutral Path
      modifierResolver.registerModifier({
        id: 'karma_v2_neutral_speed',
        target: 'attackSpeed',
        type: 'percent_add',
        value: 0.12,
        source: 'Neutral Balance',
        sourceType: 'karma',
      });
      modifierResolver.registerModifier({
        id: 'karma_v2_neutral_loot',
        target: 'lootChance',
        type: 'percent_add',
        value: 0.10,
        source: 'Neutral Balance',
        sourceType: 'karma',
      });
    }
  }

  public modifyKarma(delta: number, reason?: string): { oldScore: number; newScore: number; oldBand: KarmaBand; newBand: KarmaBand } {
    const oldScore = this.score;
    const oldBand = this.getKarmaBand();

    const newScore = Math.max(-100, Math.min(100, this.score + delta));
    this.score = newScore;

    if (delta > 0) {
      this.lifetimeKarmaPositive += delta;
    } else if (delta < 0) {
      this.lifetimeKarmaNegative += Math.abs(delta);
    }

    const newBand = this.getKarmaBand();
    this.reapplyKarmaModifiers();

    // Trigger toast & event if band changed
    if (oldBand !== newBand) {
      const bandInfo = KARMA_BANDS[newBand];
      events.emit('toast:show', {
        message: `Alignment Shifted: ${bandInfo.badge} ${newBand.toUpperCase()}`,
        type: newBand === 'virtuous' || newBand === 'positive' ? 'epic' : 'info',
      });
    }

    events.emit('karma:changed', {
      score: this.score,
      band: newBand,
      delta,
      reason,
    });

    analytics.trackEvent('karma_shifted', {
      delta,
      newScore: this.score,
      band: newBand,
      reason: reason ?? 'event_choice',
    });

    return { oldScore, newScore, oldBand, newBand };
  }

  public setMajorChoiceFlag(flagId: string, value: boolean = true): void {
    this.majorChoiceFlags[flagId] = value;
    analytics.trackEvent('major_choice_recorded', { flagId, value });
  }

  public hasMajorChoiceFlag(flagId: string): boolean {
    return !!this.majorChoiceFlags[flagId];
  }

  public getMajorChoiceFlag(flagId: string): boolean {
    return this.hasMajorChoiceFlag(flagId);
  }

  public getAllMajorChoiceFlags(): Record<string, boolean> {
    return { ...this.majorChoiceFlags };
  }

  public modifyFactionReputation(factionId: string, delta: number): number {
    const current = this.factionReputation[factionId] ?? 0;
    const updated = current + delta;
    this.factionReputation[factionId] = updated;
    return updated;
  }

  public getFactionReputation(factionId: string): number {
    return this.factionReputation[factionId] ?? 0;
  }

  public resetCurrentLifeKarma(): void {
    // Samsara legacy rules: resets current-life alignment score to 0, but retains historical majorChoiceFlags
    this.score = 0;
  }

  public resetAll(): void {
    this.score = 0;
    this.majorChoiceFlags = {};
    this.factionReputation = {};
    this.lifetimeKarmaPositive = 0;
    this.lifetimeKarmaNegative = 0;
  }

  public serialize(): KarmaState {
    return {
      score: this.score,
      band: this.getKarmaBand(),
      majorChoiceFlags: { ...this.majorChoiceFlags },
      factionReputation: { ...this.factionReputation },
      lifetimeKarmaPositive: this.lifetimeKarmaPositive,
      lifetimeKarmaNegative: this.lifetimeKarmaNegative,
    };
  }

  public deserialize(data?: Partial<KarmaState>): void {
    if (!data) return;
    if (data.score !== undefined) {
      this.score = Math.max(-100, Math.min(100, data.score));
    }
    if (data.majorChoiceFlags) {
      this.majorChoiceFlags = { ...data.majorChoiceFlags };
    }
    if (data.factionReputation) {
      this.factionReputation = { ...data.factionReputation };
    }
    if (data.lifetimeKarmaPositive !== undefined) {
      this.lifetimeKarmaPositive = data.lifetimeKarmaPositive;
    }
    if (data.lifetimeKarmaNegative !== undefined) {
      this.lifetimeKarmaNegative = data.lifetimeKarmaNegative;
    }
    this.reapplyKarmaModifiers();
  }
}

export const karmaSystem = KarmaSystem.getInstance();
