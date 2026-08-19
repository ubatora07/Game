import { store } from '../core/GameState';
import { calculateReincarnationSouls, getSoulSkillById, calculateSoulSkillCost } from '../content/soulTree';
import { events } from '../core/EventBus';
import { sound } from '../services/audio/SoundService';
import { CampaignProgressionSystem } from './CampaignProgressionSystem';

export class ReincarnationSystem {
  public static getPotentialSouls(): number {
    const state = store.get();
    const rebirthLevel = state.soulSkills['soul_rebirth'] || 0;
    return calculateReincarnationSouls(state.stats.lifetimePower, state.towerFloor, rebirthLevel);
  }

  public static canReincarnate(): boolean {
    const state = store.get();
    // Must be at least Rank S (index >= 5) and have at least 1 soul reward
    return state.rankIndex >= 5 && this.getPotentialSouls() > 0;
  }

  public static reincarnate(): boolean {
    const soulsGained = this.getPotentialSouls();
    if (soulsGained <= 0) return false;

    store.set((draft) => {
      draft.souls += soulsGained;
      draft.reincarnationCount += 1;

      // Reset run economy
      draft.power = 0;
      draft.gold = 0;
      draft.rankId = 'E';
      draft.rankIndex = 0;
      draft.buildings = {};
      draft.upgrades = {};
      draft.towerFloor = 1;
      draft.combo = { count: 0, multiplier: 1.0, timer: 0 };
      draft.buffs.celestialSurgeEndsAt = 0;
      draft.buffs.adPowerSurgeEndsAt = 0;
      draft.buffs.frenzyEndsAt = 0;

      // Reset campaign to early traversal
      CampaignProgressionSystem.onReincarnationReset(draft);
    });

    sound.playAscension();

    events.emit('reincarnate:complete', {
      soulsGained,
      totalSouls: store.get().souls
    });

    return true;
  }

  public static buySoulSkill(skillId: string): boolean {
    const state = store.get();
    const skill = getSoulSkillById(skillId);
    if (!skill) return false;

    const currentLevel = state.soulSkills[skillId] || 0;
    if (currentLevel >= skill.maxLevel) return false;

    const cost = calculateSoulSkillCost(skill, currentLevel);
    if (state.souls < cost) return false;

    store.set((draft) => {
      draft.souls -= cost;
      draft.soulSkills[skillId] = currentLevel + 1;
    });

    sound.playUpgrade();
    return true;
  }
}
