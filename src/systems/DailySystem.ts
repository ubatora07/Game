import { store } from '../core/GameState';
import { TimeService } from '../services/TimeService';
import { DAILY_QUESTS, getDailyQuestTemplate, DailyQuestType } from '../content/dailyQuests';
import { events } from '../core/EventBus';
import { t } from '../services/i18n/I18nService';

export class DailySystem {
  public static checkDailyReset(): void {
    const state = store.get();
    const now = TimeService.now();
    const currentMidnight = TimeService.getMidnight(now);

    if (state.lastDailyResetAt === 0) {
      // First time ever playing
      store.set(draft => {
        draft.lastDailyResetAt = currentMidnight;
        draft.loginStreak = 1;
        draft.loginRewardClaimed = false;
      });
      this.generateDailyQuests();
      return;
    }

    if (currentMidnight > state.lastDailyResetAt) {
      // A new day has started
      const daysPassed = Math.round((currentMidnight - state.lastDailyResetAt) / (24 * 3600 * 1000));
      
      store.set(draft => {
        if (daysPassed === 1) {
          draft.loginStreak += 1;
        } else {
          // Missed a day, reset streak
          draft.loginStreak = 1;
        }
        draft.lastDailyResetAt = currentMidnight;
        draft.loginRewardClaimed = false;
      });

      this.generateDailyQuests();
      events.emit('toast:show', { message: t('toast.daily.reset'), type: 'info' });
    }
  }

  private static generateDailyQuests(): void {
    // Pick 3 random quests
    const shuffled = [...DAILY_QUESTS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    store.set(draft => {
      draft.dailyQuests = selected.map(q => ({
        id: Math.random().toString(36).substr(2, 9),
        templateId: q.id,
        progress: 0,
        claimed: false
      }));
    });
  }

  public static claimLoginReward(): boolean {
    const state = store.get();
    if (state.loginRewardClaimed) return false;

    // Simple reward logic based on streak
    // E.g. 50 crystals base + 10 per day, massive bump on day 7/14/30
    let crystals = 50 + (state.loginStreak % 30) * 10;
    
    if (state.loginStreak % 30 === 7) crystals += 500;
    if (state.loginStreak % 30 === 14) crystals += 1500;
    if (state.loginStreak % 30 === 0) crystals += 5000; // Day 30

    store.set(draft => {
      draft.loginRewardClaimed = true;
      draft.crystals += crystals;
    });

    events.emit('toast:show', { message: t('toast.daily.login_claimed', { crystals }), type: 'success' });
    return true;
  }

  public static trackQuestProgress(type: DailyQuestType, amount: number = 1): void {
    store.set(draft => {
      for (const quest of draft.dailyQuests) {
        if (quest.claimed) continue;
        
        const template = getDailyQuestTemplate(quest.templateId);
        if (template && template.type === type) {
          if (quest.progress < template.target) {
            quest.progress += amount;
            if (quest.progress >= template.target) {
              quest.progress = template.target;
              // Auto-claim or let user claim? Let's just emit event that it's complete
              events.emit('toast:show', { message: t('toast.daily.quest_complete'), type: 'success' });
            }
          }
        }
      }
    });
  }

  public static claimQuest(questId: string): boolean {
    const state = store.get();
    const quest = state.dailyQuests.find(q => q.id === questId);
    if (!quest || quest.claimed) return false;

    const template = getDailyQuestTemplate(quest.templateId);
    if (!template || quest.progress < template.target) return false;

    store.set(draft => {
      const q = draft.dailyQuests.find(dq => dq.id === questId);
      if (q) {
        q.claimed = true;
        draft.crystals += template.rewardCrystals;
      }
    });

    events.emit('toast:show', { message: t('toast.daily.reward_claimed', { crystals: template.rewardCrystals }), type: 'success' });
    return true;
  }
}
