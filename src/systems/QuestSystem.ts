import { store } from '../core/GameState';
import { ACHIEVEMENTS } from '../content/achievements';
import { QUESTS } from '../content/quests';
import { EconomyEngine } from '../economy/EconomyEngine';
import { events } from '../core/EventBus';
import { sound } from '../services/audio/SoundService';
import { t } from '../services/i18n/I18nService';
import { RelicSystem } from './RelicSystem';

export class QuestSystem {
  public static checkAchievements(): void {
    const state = store.get();
    const claimed = new Set(state.claimedAchievements);

    for (const ach of ACHIEVEMENTS) {
      if (!claimed.has(ach.id) && ach.check(state)) {
        store.set((draft) => {
          draft.claimedAchievements.push(ach.id);
          draft.crystals += ach.rewardCrystals;
        });

        sound.playVictory();

        events.emit('achievement:unlocked', {
          achievementId: ach.id,
          title: ach.nameKey,
          rewardCrystals: ach.rewardCrystals
        });

        events.emit('toast:show', {
          message: t('toast.achievement.unlocked', { name: t(ach.nameKey), crystals: ach.rewardCrystals }),
          type: 'gold'
        });
      }
    }
  }

  public static isQuestReadyToClaim(questId: string): boolean {
    const state = store.get();
    const quest = QUESTS.find(q => q.id === questId);
    if (!quest || state.completedQuests.includes(questId)) {
      return false;
    }
    return quest.getProgress(state) >= quest.targetCount;
  }

  public static claimQuest(questId: string): boolean {
    const state = store.get();
    const quest = QUESTS.find(q => q.id === questId);
    if (!quest || state.completedQuests.includes(questId)) {
      return false;
    }

    const progress = quest.getProgress(state);
    if (progress < quest.targetCount) {
      return false;
    }

    const metrics = EconomyEngine.calculateMetrics(state);
    const soulQuestLevel = state.soulSkills['soul_quest'] || 0;
    const soulQuestMult = 1.0 + soulQuestLevel * 0.15;

    let goldReward = quest.reward.gold ? Math.floor(quest.reward.gold * soulQuestMult) : 0;
    if (quest.reward.goldSeconds) {
      const dynamicGold = Math.max(50, Math.floor(metrics.passiveGoldPerSec * quest.reward.goldSeconds * soulQuestMult));
      goldReward += dynamicGold;
    }

    const questGoldChance = RelicSystem.getEquippedEffectValue(state, 'quest_gold');
    if (questGoldChance > 0 && Math.random() < questGoldChance) {
      goldReward += Math.floor(metrics.passiveGoldPerSec * 60);
    }

    let powerReward = 0;
    if (quest.reward.powerSeconds) {
      const dynamicPower = Math.max(100, Math.floor(metrics.passivePowerPerSec * quest.reward.powerSeconds * soulQuestMult));
      powerReward += dynamicPower;
    }

    const crystalReward = quest.reward.crystals ? Math.floor(quest.reward.crystals * soulQuestMult) : 0;
    const essenceReward = quest.reward.essence ? Math.floor(quest.reward.essence * soulQuestMult) : 0;
    const soulReward = quest.reward.souls || 0;

    store.set((draft) => {
      draft.completedQuests.push(questId);
      if (goldReward > 0) {
        draft.gold += goldReward;
        draft.stats.lifetimeGold += goldReward;
      }
      if (powerReward > 0) {
        draft.power += powerReward;
        draft.stats.lifetimePower += powerReward;
      }
      if (crystalReward > 0) draft.crystals += crystalReward;
      if (essenceReward > 0) draft.essence += essenceReward;
      if (soulReward > 0) draft.souls += soulReward;
    });

    sound.playUpgrade();

    events.emit('quest:completed', {
      questId,
      reward: {
        gold: goldReward,
        crystals: crystalReward,
        essence: essenceReward,
        souls: soulReward
      }
    });

    return true;
  }
}
