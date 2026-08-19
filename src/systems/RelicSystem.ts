import { store, GameStateData } from '../core/GameState';
import { getRelicById, calculateRelicEffect, RelicEffectType } from '../content/relics';
import { events } from '../core/EventBus';
import { t } from '../services/i18n/I18nService';

export class RelicSystem {
  /**
   * Retrieves the current effective value of a specific relic effect type across all equipped relics.
   */
  public static getEquippedEffectValue(state: GameStateData, effectType: RelicEffectType): number {
    let total = 0;
    
    for (const relicId of state.equippedRelics) {
      if (!relicId) continue;
      
      const relicDef = getRelicById(relicId);
      if (relicDef && relicDef.modifier.type === effectType) {
        const relicData = state.relics[relicId];
        if (relicData) {
          total += calculateRelicEffect(relicId, relicData.level);
        }
      }
    }
    
    return total;
  }

  /**
   * Grant a relic to the player (e.g. from a boss drop)
   */
  public static grantRelic(relicId: string): void {
    const def = getRelicById(relicId);
    if (!def) return;

    store.set(draft => {
      if (!draft.relics) {
        draft.relics = {};
      }

      const existing = draft.relics[relicId];
      if (existing) {
        existing.duplicates += 1;
        // Check for level up (e.g., 2 dupes for lvl 2, 4 for lvl 3, etc. - simple linear for now)
        const requiredDupes = existing.level * 2;
        if (existing.duplicates >= requiredDupes && existing.level < def.maxLevel) {
          existing.duplicates -= requiredDupes;
          existing.level += 1;
          events.emit('toast:show', { message: t('toast.relic.level_up', { name: t(def.nameKey), level: existing.level }), type: 'success' });
        } else {
          events.emit('toast:show', { message: t('toast.relic.duplicate', { name: t(def.nameKey) }), type: 'info' });
        }
      } else {
        draft.relics[relicId] = { level: 1, duplicates: 0 };
        events.emit('toast:show', { message: t('toast.relic.found', { name: t(def.nameKey) }), type: 'success' });
      }
    });

    events.emit('relic:grant', { relicId });
  }

  public static equipRelic(relicId: string, slotIndex: number): void {
    store.set(draft => {
      if (slotIndex < 0 || slotIndex >= draft.equippedRelics.length) return;
      if (!draft.relics[relicId]) return; // Don't own it

      // If it's already equipped somewhere else, remove it from there
      const existingSlot = draft.equippedRelics.indexOf(relicId);
      if (existingSlot !== -1) {
        draft.equippedRelics[existingSlot] = null;
      }

      draft.equippedRelics[slotIndex] = relicId;
    });
  }

  public static unequipRelic(slotIndex: number): void {
    store.set(draft => {
      if (slotIndex >= 0 && slotIndex < draft.equippedRelics.length) {
        draft.equippedRelics[slotIndex] = null;
      }
    });
  }
}
