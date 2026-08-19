import { GameStateData } from '../../core/GameState';
import { calculateReincarnationSouls, REINCARNATION_MIN_LIFETIME_POWER } from '../../content/soulTree';
import { getRankById, RankDefinition } from '../../content/ranks';

export type RebirthBlockReasonCode = 'required_rank' | 'lifetime_power';

export interface RebirthBlockReason {
  code: RebirthBlockReasonCode;
  current: number;
  required: number;
}

export interface RebirthRequirementStatus {
  canRebirth: boolean;
  requiredRank: RankDefinition;
  minimumLifetimePower: number;
  potentialSouls: number;
  reasons: RebirthBlockReason[];
}

export class RebirthRequirements {
  public static getRequiredRank(): RankDefinition {
    return getRankById('S');
  }

  public static evaluate(state: Readonly<GameStateData>): RebirthRequirementStatus {
    const requiredRank = this.getRequiredRank();
    const rebirthLevel = state.soulSkills['soul_rebirth'] || 0;
    const potentialSouls = calculateReincarnationSouls(
      state.stats.lifetimePower,
      state.towerFloor,
      rebirthLevel,
    );
    const reasons: RebirthBlockReason[] = [];

    if (state.rankIndex < requiredRank.index) {
      reasons.push({
        code: 'required_rank',
        current: state.rankIndex,
        required: requiredRank.index,
      });
    }

    if (state.stats.lifetimePower < REINCARNATION_MIN_LIFETIME_POWER) {
      reasons.push({
        code: 'lifetime_power',
        current: state.stats.lifetimePower,
        required: REINCARNATION_MIN_LIFETIME_POWER,
      });
    }

    return {
      canRebirth: reasons.length === 0 && potentialSouls > 0,
      requiredRank,
      minimumLifetimePower: REINCARNATION_MIN_LIFETIME_POWER,
      potentialSouls,
      reasons,
    };
  }
}
