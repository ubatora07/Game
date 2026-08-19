import { store } from '../core/GameState';
import { getExpeditionById } from '../content/expeditions';
import { getHeroById } from '../content/heroes';
import { EconomyEngine } from '../economy/EconomyEngine';
import { events } from '../core/EventBus';

export class ExpeditionSystem {
  
  public static dispatch(templateId: string, heroId: string): boolean {
    const state = store.get();
    
    // Check if hero is owned
    if (!state.heroes[heroId]) {
      return false;
    }

    // Check if hero is already on an expedition
    const isBusy = state.expeditions.some(e => e.heroId === heroId);
    if (isBusy) {
      return false;
    }

    const template = getExpeditionById(templateId);
    if (!template) {
      return false;
    }

    // Check requirements
    const heroDef = getHeroById(heroId);
    if (!heroDef) return false;

    if (template.requiredElement && heroDef.element !== template.requiredElement) {
      return false;
    }
    
    const rarityValues = { 'common': 1, 'rare': 2, 'epic': 3, 'legendary': 4, 'mythic': 5 };
    if (template.requiredRarity && rarityValues[heroDef.rarity] < rarityValues[template.requiredRarity]) {
      return false;
    }

    const newExpedition = {
      id: Math.random().toString(36).substr(2, 9),
      templateId,
      heroId,
      startedAt: Date.now(),
      durationMs: template.durationHours * 3600 * 1000
    };

    store.set(draft => {
      draft.expeditions.push(newExpedition);
    });

    events.emit('toast:show', { message: `Hero dispatched on expedition!`, type: 'info' });
    return true;
  }

  public static claim(expeditionId: string): boolean {
    const state = store.get();
    const exp = state.expeditions.find(e => e.id === expeditionId);
    if (!exp) return false;

    const now = Date.now();
    if (now < exp.startedAt + exp.durationMs) {
      return false; // Not finished yet
    }

    const template = getExpeditionById(exp.templateId);
    if (!template) return false;

    const heroData = state.heroes[exp.heroId];
    // Hero star multiplier: 1 star = 1x, 2 star = 1.1x, 3 star = 1.2x, etc.
    const starMult = heroData ? 1.0 + (heroData.stars - 1) * 0.1 : 1.0;

    const crystals = Math.floor(template.rewards.crystals * starMult);
    const essence = Math.floor(template.rewards.essence * starMult);
    
    const metrics = EconomyEngine.calculateMetrics(state, now);
    const gold = Math.floor((template.rewards.goldEquivalentMinutes * 60) * metrics.passiveGoldPerSec * starMult);

    store.set(draft => {
      draft.crystals += crystals;
      draft.essence += essence;
      draft.gold += gold;
      draft.stats.lifetimeGold += gold;
      
      draft.expeditions = draft.expeditions.filter(e => e.id !== expeditionId);
    });

    events.emit('toast:show', { 
      message: `Expedition Complete! +${crystals} Crystals, +${essence} Essence, +${gold} Gold`, 
      type: 'success' 
    });

    return true;
  }
}
