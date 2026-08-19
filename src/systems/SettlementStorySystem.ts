import {
  SettlementStorySaveState,
  SettlementStoryPath,
  StoryChapterDefinition,
  StoryObjective,
} from '../core/settlement/SettlementStoryTypes';
import { SETTLEMENT_CHAPTERS, getAllChapters, getChapterDefinition } from '../content/settlementStoryCatalog';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { settlementSystem } from './SettlementSystem';
import { settlementDefenseSystem } from './SettlementDefenseSystem';
import { craftingEquipmentSystem } from './CraftingEquipmentSystem';
import { mercenarySystem } from './MercenarySystem';
import { titleSystem } from './TitleSystem';
import { store } from '../core/GameState';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';

export class SettlementStorySystem {
  private static instance: SettlementStorySystem;

  private state: SettlementStorySaveState = {
    currentChapterId: 'chap_1_haven_reclaimed',
    completedChapterIds: [],
    chosenPath: null,
  };

  private constructor() {
    this.reapplyPathModifiers();
  }

  public static getInstance(): SettlementStorySystem {
    if (!SettlementStorySystem.instance) {
      SettlementStorySystem.instance = new SettlementStorySystem();
    }
    return SettlementStorySystem.instance;
  }

  public getCurrentChapter(): StoryChapterDefinition {
    return getChapterDefinition(this.state.currentChapterId) || SETTLEMENT_CHAPTERS[0];
  }

  public isChapterCompleted(chapterId: string): boolean {
    return this.state.completedChapterIds.includes(chapterId);
  }

  public getChosenPath(): SettlementStoryPath | null {
    return this.state.chosenPath;
  }

  public choosePath(path: SettlementStoryPath): boolean {
    if (this.state.chosenPath === path) return false;
    this.state.chosenPath = path;

    if (path === 'lord') {
      titleSystem.unlockTitle('title_high_lord');
      events.emit('toast:show', {
        message: '👑 OATH SWORN: You are now the High Lord of Mountain Haven!',
        type: 'epic',
      });
    } else {
      titleSystem.unlockTitle('title_unbound_vanguard');
      events.emit('toast:show', {
        message: '🦅 UNBOUND SPIRIT: You walk as an Independent Vanguard of the Realm!',
        type: 'epic',
      });
    }

    this.reapplyPathModifiers();
    events.emit('settlement:story_path_chosen' as any, { path });
    analytics.trackEvent('settlement_story_path_chosen', { path });
    return true;
  }

  public reapplyPathModifiers(): void {
    modifierResolver.unregisterModifier('settlement_path_lord_gold');
    modifierResolver.unregisterModifier('settlement_path_lord_def');
    modifierResolver.unregisterModifier('settlement_path_adv_spd');
    modifierResolver.unregisterModifier('settlement_path_adv_loot');

    if (this.state.chosenPath === 'lord') {
      modifierResolver.registerModifier({
        id: 'settlement_path_lord_gold',
        target: 'goldMultiplier',
        type: 'percent_add',
        value: 0.10,
        source: 'Oath of Lordship',
        sourceType: 'permanent_passive',
      });
      modifierResolver.registerModifier({
        id: 'settlement_path_lord_def',
        target: 'settlementDefense',
        type: 'flat',
        value: 30,
        source: 'Lord’s Citadel Guard',
        sourceType: 'permanent_passive',
      });
    } else if (this.state.chosenPath === 'adventurer') {
      modifierResolver.registerModifier({
        id: 'settlement_path_adv_spd',
        target: 'attackSpeed',
        type: 'percent_add',
        value: 0.10,
        source: 'Unbound Wanderer Swiftness',
        sourceType: 'permanent_passive',
      });
      modifierResolver.registerModifier({
        id: 'settlement_path_adv_loot',
        target: 'lootChance',
        type: 'percent_add',
        value: 0.10,
        source: 'Adventurer Keen Eye',
        sourceType: 'permanent_passive',
      });
    }
  }

  public getObjectiveProgress(obj: StoryObjective): { current: number; target: number; isDone: boolean } {
    let current = 0;
    switch (obj.type) {
      case 'settlement_level':
        current = settlementSystem.getSettlementLevel();
        break;
      case 'buildings_count':
        current = Object.values(settlementSystem.getBuildings()).filter((b) => b.isConstructed).length;
        break;
      case 'raids_defeated':
        current = settlementDefenseSystem.serialize().totalRaidsDefeated;
        break;
      case 'craft_equipment':
        current = craftingEquipmentSystem.getInventory().length;
        break;
      case 'hire_mercenary':
        current = mercenarySystem.serialize().totalHiresCount;
        break;
      default:
        current = 0;
    }

    const isDone = current >= obj.targetValue;
    return { current, target: obj.targetValue, isDone };
  }

  public canClaimChapter(chapterId: string): boolean {
    if (this.isChapterCompleted(chapterId)) return false;
    const chap = getChapterDefinition(chapterId);
    if (!chap) return false;

    return chap.objectives.every((obj) => this.getObjectiveProgress(obj).isDone);
  }

  public claimChapter(chapterId: string): boolean {
    if (!this.canClaimChapter(chapterId)) return false;
    const chap = getChapterDefinition(chapterId)!;

    this.state.completedChapterIds.push(chapterId);

    // Grant rewards
    store.set((draft) => {
      draft.gold += chap.rewards.gold;
      draft.crystals += chap.rewards.crystals;
    });

    if (chap.rewards.settlementWood || chap.rewards.settlementStone || chap.rewards.settlementIron) {
      settlementSystem.addMaterials(
        chap.rewards.settlementWood || 0,
        chap.rewards.settlementStone || 0,
        chap.rewards.settlementIron || 0
      );
    }

    if (chap.rewards.titleId) {
      titleSystem.unlockTitle(chap.rewards.titleId);
    }

    // Advance to next chapter if exists
    const all = getAllChapters();
    const currentIndex = all.findIndex((c) => c.id === chapterId);
    if (currentIndex >= 0 && currentIndex < all.length - 1) {
      this.state.currentChapterId = all[currentIndex + 1].id;
    }

    events.emit('toast:show', {
      message: `📜 STORY COMPLETED: ${chap.defaultTitle}!`,
      type: 'epic',
    });

    events.emit('settlement:story_chapter_completed' as any, { chapterId });
    analytics.trackEvent('settlement_story_chapter_completed', { chapterId, chapterNumber: chap.chapterNumber });

    return true;
  }

  /* --------------------------------------------------------------------- */
  /* SERIALIZATION & SAMSARA                                               */
  /* --------------------------------------------------------------------- */
  public resetAll(): void {
    this.state = {
      currentChapterId: 'chap_1_haven_reclaimed',
      completedChapterIds: [],
      chosenPath: null,
    };
    this.reapplyPathModifiers();
  }

  public resetForSamsara(): void {
    // Reincarnation preserves completed chapter chronicle records and path
    this.reapplyPathModifiers();
  }

  public serialize(): SettlementStorySaveState {
    return {
      currentChapterId: this.state.currentChapterId,
      completedChapterIds: [...this.state.completedChapterIds],
      chosenPath: this.state.chosenPath,
    };
  }

  public deserialize(data?: Partial<SettlementStorySaveState>): void {
    if (!data) return;
    this.state = {
      currentChapterId: data.currentChapterId || 'chap_1_haven_reclaimed',
      completedChapterIds: [...(data.completedChapterIds || [])],
      chosenPath: data.chosenPath || null,
    };
    this.reapplyPathModifiers();
  }
}

export const settlementStorySystem = SettlementStorySystem.getInstance();
