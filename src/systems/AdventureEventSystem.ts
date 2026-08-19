import {
  AdventureEventDefinition,
  AdventureEventChoice,
  AdventureEventContext,
  AdventureEventOutcome,
  AdventureEventSaveState,
} from '../core/events/AdventureEventTypes';
import { modifierResolver } from '../core/modifiers/ModifierResolver';
import { events } from '../core/EventBus';
import { analytics } from '../services/analytics/AnalyticsService';
import { store } from '../core/GameState';
import { HEROES } from '../content/heroes';
import { ADVENTURE_EVENTS } from '../content/adventureEvents';
import { VILLAGE_CHOICE_EVENTS } from '../content/villageEvents';
import { karmaSystem } from './KarmaSystem';
import { petSystem } from './PetSystem';
import { titleSystem } from './TitleSystem';
import { craftingEquipmentSystem } from './CraftingEquipmentSystem';
import { CraftingMaterialId } from '../core/crafting/CraftingTypes';
import { t } from '../services/i18n/I18nService';

export class AdventureEventSystem {
  private static instance: AdventureEventSystem;

  private registeredEvents: Map<string, AdventureEventDefinition> = new Map();
  private completedOnceOnlyEvents: Set<string> = new Set();
  private eventCooldowns: Map<string, number> = new Map();

  private constructor() {
    this.loadDefaultEvents();
  }

  public static getInstance(): AdventureEventSystem {
    if (!AdventureEventSystem.instance) {
      AdventureEventSystem.instance = new AdventureEventSystem();
    }
    return AdventureEventSystem.instance;
  }

  public registerEvents(eventsList: AdventureEventDefinition[]): void {
    for (const evt of eventsList) {
      this.registeredEvents.set(evt.id, evt);
    }
  }

  public getEventById(id: string): AdventureEventDefinition | undefined {
    return this.registeredEvents.get(id);
  }

  public getAllEvents(): AdventureEventDefinition[] {
    return Array.from(this.registeredEvents.values());
  }

  public getKarma(): number {
    return karmaSystem.getScore();
  }

  public setKarma(karma: number): void {
    karmaSystem.setScore(karma);
  }

  public modifyKarma(delta: number): number {
    return karmaSystem.modifyKarma(delta).newScore;
  }

  public isEventEligible(eventDef: AdventureEventDefinition, context: AdventureEventContext, now: number = Date.now()): boolean {
    const req = eventDef.requirements;

    // Once-only check
    if (req?.onceOnly && this.completedOnceOnlyEvents.has(eventDef.id)) {
      return false;
    }

    // Cooldown check
    const cooldownEnd = this.eventCooldowns.get(eventDef.id);
    if (cooldownEnd && now < cooldownEnd) {
      return false;
    }

    // World ID check
    if (req?.minWorldId !== undefined && context.worldId < req.minWorldId) {
      return false;
    }
    if (req?.maxWorldId !== undefined && context.worldId > req.maxWorldId) {
      return false;
    }

    // Karma check
    if (req?.minKarma !== undefined && context.currentKarma < req.minKarma) {
      return false;
    }
    if (req?.maxKarma !== undefined && context.currentKarma > req.maxKarma) {
      return false;
    }

    // Class requirement check
    if (req?.requiredClasses && req.requiredClasses.length > 0) {
      const hasClass = req.requiredClasses.some((c) => context.activeClasses.includes(c));
      if (!hasClass) return false;
    }

    // Pet requirement check
    if (req?.requiredPetId) {
      const activePet = petSystem.getActivePet();
      if (!activePet || activePet.id !== req.requiredPetId) return false;
    }

    // Flag requirement check
    if (req?.requiredFlag) {
      if (!karmaSystem.getMajorChoiceFlag(req.requiredFlag)) return false;
    }

    return true;
  }

  public getEligibleEvents(context: AdventureEventContext, now: number = Date.now()): AdventureEventDefinition[] {
    return this.getAllEvents().filter((evt) => this.isEventEligible(evt, context, now));
  }

  public selectWeightedEvent(context: AdventureEventContext, now: number = Date.now()): AdventureEventDefinition | null {
    const eligible = this.getEligibleEvents(context, now);
    if (eligible.length === 0) return null;

    const rareEventMult = modifierResolver.resolve('rareEventChance', 1.0);

    let totalWeight = 0;
    const weightedItems: { event: AdventureEventDefinition; effectiveWeight: number }[] = [];

    for (const evt of eligible) {
      let weight = evt.weight;
      if (evt.category === 'rare_item' || evt.category === 'strange_npc') {
        weight *= rareEventMult;
      }
      totalWeight += weight;
      weightedItems.push({ event: evt, effectiveWeight: weight });
    }

    if (totalWeight <= 0) return null;

    let roll = Math.random() * totalWeight;
    for (const item of weightedItems) {
      if (roll < item.effectiveWeight) {
        return item.event;
      }
      roll -= item.effectiveWeight;
    }

    return weightedItems[weightedItems.length - 1].event;
  }

  public executeChoice(eventDef: AdventureEventDefinition, choice: AdventureEventChoice): AdventureEventOutcome {
    const outcome = choice.outcome;

    // Apply currency changes to game state
    if (outcome.goldDelta || outcome.crystalsDelta || outcome.powerDelta || outcome.soulsDelta || outcome.unlockHeroId) {
      store.set((draft) => {
        if (outcome.goldDelta) draft.gold = Math.max(0, draft.gold + outcome.goldDelta);
        if (outcome.crystalsDelta) draft.crystals = Math.max(0, draft.crystals + outcome.crystalsDelta);
        if (outcome.powerDelta) draft.power = Math.max(0, draft.power + outcome.powerDelta);
        if (outcome.soulsDelta) draft.souls = Math.max(0, draft.souls + outcome.soulsDelta);

        // Phase 89: Hero Recruitment outcome
        if (outcome.unlockHeroId) {
          const heroId = outcome.unlockHeroId;
          const heroDef = HEROES.find((h) => h.id === heroId);
          let isDuplicate = false;
          if (!draft.heroes[heroId]) {
            draft.heroes[heroId] = { stars: 1, duplicates: 0 };
          } else {
            draft.heroes[heroId].duplicates = (draft.heroes[heroId].duplicates || 0) + 5;
            isDuplicate = true;
          }

          if (heroDef) {
            events.emit('modal:open', {
              modalId: 'hero_recruitment_modal',
              data: { hero: heroDef, isDuplicate },
            });
          }

          analytics.trackEvent('hero_recruited_via_event', {
            heroId,
            isDuplicate,
            eventId: eventDef.id,
            choiceId: choice.id,
          });
        }
      });
    }

    // Phase 94: Pet Acquisition outcome
    if (outcome.unlockPetId) {
      const petId = outcome.unlockPetId;
      const alreadyOwned = !!petSystem.getPetInstance(petId);
      if (!alreadyOwned) {
        petSystem.acquirePet(petId);
      } else {
        petSystem.addPetXp(petId, 300);
      }

      events.emit('modal:open', {
        modalId: 'pet_modal',
        data: { petId, isDuplicate: alreadyOwned },
      });

      analytics.trackEvent('pet_acquired_via_event', {
        petId,
        isDuplicate: alreadyOwned,
        eventId: eventDef.id,
        choiceId: choice.id,
      });
    }

    if (outcome.karmaDelta) {
      this.modifyKarma(outcome.karmaDelta);
    }

    if (outcome.unlockTitleId) {
      titleSystem.unlockTitle(outcome.unlockTitleId);
    }

    if (outcome.materialId && outcome.materialCount) {
      craftingEquipmentSystem.addMaterial(outcome.materialId as CraftingMaterialId, outcome.materialCount);
    }

    if (outcome.flagId && outcome.flagValue !== undefined) {
      karmaSystem.setMajorChoiceFlag(outcome.flagId, outcome.flagValue);
    }

    // Set cooldown
    if (eventDef.cooldownSeconds > 0) {
      this.eventCooldowns.set(eventDef.id, Date.now() + eventDef.cooldownSeconds * 1000);
    }

    // Record once-only completion
    if (eventDef.requirements?.onceOnly) {
      this.completedOnceOnlyEvents.add(eventDef.id);
    }

    // Record major choice in karma system
    karmaSystem.setMajorChoiceFlag(`${eventDef.id}:${choice.id}`, true);
    if (outcome.followUpEventId) {
      karmaSystem.setMajorChoiceFlag(`followup_${outcome.followUpEventId}`, true);
    }

    // Analytics
    analytics.trackEvent('adventure_event_resolved', {
      eventId: eventDef.id,
      choiceId: choice.id,
      category: eventDef.category,
      karmaDelta: outcome.karmaDelta ?? 0,
    });

    events.emit('toast:show', {
      message: t('toast.adventure.resolved', { result: t(choice.outcome.resultTextKey) }),
      type: 'info',
    });

    return outcome;
  }

  public clearEvents(): void {
    this.registeredEvents.clear();
  }

  public loadDefaultEvents(): void {
    this.registerEvents(ADVENTURE_EVENTS);
    this.registerEvents(VILLAGE_CHOICE_EVENTS);
  }

  public resetAll(): void {
    this.completedOnceOnlyEvents.clear();
    this.eventCooldowns.clear();
  }

  public serialize(): AdventureEventSaveState {
    return {
      completedOnceOnly: Array.from(this.completedOnceOnlyEvents),
      eventCooldowns: Object.fromEntries(this.eventCooldowns.entries()),
    };
  }

  public deserialize(data?: Partial<AdventureEventSaveState>, now: number = Date.now()): void {
    this.completedOnceOnlyEvents = new Set(
      Array.isArray(data?.completedOnceOnly)
        ? data.completedOnceOnly.filter((id): id is string => typeof id === 'string')
        : []
    );

    this.eventCooldowns.clear();
    if (data?.eventCooldowns && typeof data.eventCooldowns === 'object') {
      for (const [eventId, cooldownEnd] of Object.entries(data.eventCooldowns)) {
        if (typeof cooldownEnd === 'number' && Number.isFinite(cooldownEnd) && cooldownEnd > now) {
          this.eventCooldowns.set(eventId, cooldownEnd);
        }
      }
    }
  }
}

export const adventureEventSystem = AdventureEventSystem.getInstance();
