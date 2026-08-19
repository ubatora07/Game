import { RhythmEvaluation } from './rhythm/RhythmTypes';

export type GameEventMap = {
  // Rhythm Events
  'rhythm:hit': RhythmEvaluation;

  // Gameplay Events
  'game_start': { saveVersion: number };
  'train:click': { powerGained: number; goldGained?: number; isCrit: boolean; x?: number; y?: number };
  'building:buy': { buildingId: string; count: number; totalCost: number };
  'upgrade:buy': { upgradeId: string; newLevel: number; cost: number };
  'ascension:rankUp': { oldRank: string; newRank: string; multiplier: number };
  'tower:floorClear': { floor: number; rewards: { gold: number; crystals: number; essence: number } };
  'tower:bossDefeat': { floor: number; bossName: string };
  'tower:milestoneClaimed': { floor: number; rewards: { crystals: number; essence: number } };
  'tower:loss': { floor: number };
  'hero:unlocked': { heroId: string; rarity: string; isNew: boolean };
  'hero:starUp': { heroId: string; newStars: number };
  'relic:grant': { relicId: string };
  'reincarnate:complete': { soulsGained: number; totalSouls: number };
  'quest:completed': { questId: string; reward: { gold?: number; crystals?: number; essence?: number; souls?: number } };
  'achievement:unlocked': { achievementId: string; title: string; rewardCrystals: number };
  'event:celestialSurge': { durationSec: number; multiplier: number };
  
  // Platform & Ads
  'ad:rewarded_completed': { placement: string };
  'ad:rewarded_failed': { placement: string; error?: string };
  'save:saved': { timestamp: number };
  'save:loaded': { offlineTimeSec: number; offlineGold: number; offlinePower: number };
  'liveops:event_changed': { eventId: string | null };
  
  // Campaign Events
  'campaign:enemy_defeated': { stageId: string; rewards: any; isFirstClear: boolean; stageCleared: boolean; worldCleared: boolean };
  'campaign:stage_cleared': { stageId: string; isFirstClear: boolean; nextStageId?: string };
  'campaign:world_cleared': { worldId: number };
  'campaign:boss_failed': { bossId: string; failedStageId: string; fallbackStageId: string };
  'campaign:boss_retry': { stageId: string; retryBoostActive: boolean };
  'campaign:mode_changed': { mode: string };
  'campaign:auto_advance_toggled': { autoAdvance: boolean };
  'campaign:rush_started': { stageId: string };
  'campaign:rush_ended': { stageId: string };

  // Character / Party contract events
  'class:selected': { classId: string };
  'class:respec': {};
  'party:character_class_selected': { slotId: string; classId: string };
  'party:second_character_unlocked': { slotId: 'char_2'; name: string; classId?: string };
  'party:active_focus_changed': { slotId: 'char_1' | 'char_2' };

  // Real-time Combat Events
  'combat:enemy_spawned': { enemy: any; stageId: string; encounterIndex: number };
  'combat:player_attack': { damage: number; isCrit: boolean; remainingHp: number; enemyId: string; x?: number; y?: number };
  'combat:auto_attack': { damage: number; isCrit: boolean; remainingHp: number; enemyId: string };
  'combat:samsara_rush_kill': { enemyId: string; stageId: string };
  'combat:hero_skill': { heroId: string; heroName: string; skillName: string; skillIcon: string; type: string; damage: number; gold: number; power: number; remainingHp: number };
  'combat:pet_action': { petId: string; actionName: string; damage: number; remainingHp: number };
  'combat:boss_warning': { bossName: string; stageId: string };
  'combat:boss_mechanic': { bossId: string; mechanic: 'shield' | 'enrage' | 'damage_reduction'; active: boolean };
  'combat:reward_dropped': { rewards: { gold: number; power: number; crystals?: number; soulEssence?: number }; x?: number; y?: number };
  'combat:enemy_killed': { enemyId: string; rewards: any; stageCleared: boolean; worldCleared: boolean };
  
  // UI & Nav
  'screen:change': { screenId: string };
  'toast:show': { message: string; type?: 'info' | 'success' | 'warning' | 'gold' | 'epic' };
  'modal:open': { modalId: string; data?: any };
  'modal:close': { modalId: string };
  'karma:changed': { score: number; band: string; delta: number; reason?: string };
  'karma:major_choice_recorded': { flagId: string; value: boolean };
  'pet:acquired': { petId: string };
  'pet:active_changed': { activePetId: string | null };
  'pet:evolved': { petId: string; stage: number };
  'crafting:item_crafted': { item: any; recipeId: string; totalCraftedCount: number };
  'market:purchased': { offerId: string; isBlackMarket: boolean; totalPurchasesCount: number };
  'mercenary:hired': { mercId: string; durationMinutes: number };
  'mercenary:expired': { mercId: string };
  'settlement:unlocked': { name: string };
  'settlement:building_upgraded': { buildingId: string; level: number };
  'settlement:story_path_chosen': { path: 'lord' | 'adventurer' };
  'world:flag_changed': { flagId: string; value: boolean };
};

type EventCallback<T> = (data: T) => void;

export class EventBus {
  private listeners: Map<keyof GameEventMap, Set<EventCallback<any>>> = new Map();

  public on<K extends keyof GameEventMap>(event: K, callback: EventCallback<GameEventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unbind function
    return () => {
      this.off(event, callback);
    };
  }

  public off<K extends keyof GameEventMap>(event: K, callback: EventCallback<GameEventMap[K]>): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  public emit<K extends keyof GameEventMap>(event: K, data: GameEventMap[K]): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in event listener for ${String(event)}:`, err);
        }
      });
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const events = new EventBus();
