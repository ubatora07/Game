import { store } from '../core/GameState';
import { calculateReincarnationSouls, getSoulSkillById, calculateSoulSkillCost } from '../content/soulTree';
import { events } from '../core/EventBus';
import { sound } from '../services/audio/SoundService';
import { CampaignProgressionSystem } from './CampaignProgressionSystem';
import { getRankById, RankDefinition } from '../content/ranks';
import { settlementSystem } from './SettlementSystem';
import { craftingEquipmentSystem } from './CraftingEquipmentSystem';
import { marketSystem } from './MarketSystem';
import { mercenarySystem } from './MercenarySystem';
import { titleSystem } from './TitleSystem';
import { settlementDefenseSystem } from './SettlementDefenseSystem';
import { settlementStorySystem } from './SettlementStorySystem';
import { legacyEndingSystem } from './LegacyEndingSystem';
import { karmaSystem } from './KarmaSystem';
import { worldStateManager } from './WorldStateManager';

export class ReincarnationSystem {
  public static getRequiredRank(): RankDefinition {
    return getRankById('S');
  }

  public static getPotentialSouls(): number {
    const state = store.get();
    const rebirthLevel = state.soulSkills['soul_rebirth'] || 0;
    return calculateReincarnationSouls(state.stats.lifetimePower, state.towerFloor, rebirthLevel);
  }

  public static canReincarnate(): boolean {
    const state = store.get();
    const requiredRank = this.getRequiredRank();
    return state.rankIndex >= requiredRank.index && this.getPotentialSouls() > 0;
  }

  public static reincarnate(): boolean {
    const soulsGained = this.getPotentialSouls();
    if (soulsGained <= 0) return false;

    store.set((draft) => {
      draft.souls += soulsGained;
      draft.reincarnationCount += 1;
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
      CampaignProgressionSystem.onReincarnationReset(draft);
    });

    settlementSystem.resetForSamsara();
    craftingEquipmentSystem.resetForSamsara();
    marketSystem.resetForSamsara();
    mercenarySystem.resetForSamsara();
    titleSystem.resetForSamsara();
    settlementDefenseSystem.resetForSamsara();
    settlementStorySystem.resetForSamsara();
    legacyEndingSystem.resetForSamsara();
    karmaSystem.resetCurrentLifeKarma();
    worldStateManager.resetForSamsara();

    sound.playReincarnation();

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
