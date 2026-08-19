import { events } from '../core/EventBus';
import { AdventureEventDefinition, AdventureEventContext } from '../core/events/AdventureEventTypes';
import { getCampaignStageById } from '../content/campaignStages';
import { getCampaignWorldById } from '../content/campaignWorlds';
import { PARTNER_AWAKENING_EVENT_ID, PARTNER_AWAKENING_TRIGGER_STAGE_ID } from '../content/partnerUnlock';
import { FIRST_PET_EVENT_ID, FIRST_PET_TRIGGER_STAGE_ID } from '../content/petUnlock';
import { store } from '../core/GameState';
import { analytics } from '../services/analytics/AnalyticsService';
import { adventureEventSystem } from './AdventureEventSystem';
import { campaignCombatService } from './CampaignCombatService';
import { karmaSystem } from './KarmaSystem';
import { partyTeamSystem } from './PartyTeamSystem';
import { partnerUnlockSystem } from './PartnerUnlockSystem';
import { petSystem } from './PetSystem';

/**
 * Bridges Campaign progression into the Adventure Event framework.
 *
 * The initial production cadence is intentionally conservative and deterministic:
 * one scheduling opportunity after the FIRST clear of each world's final boss stage.
 * This prevents farm-mode event spam while making the existing event system reachable.
 */
export class AdventureEventDirector {
  private initialized = false;
  private presentationActive = false;
  private previousCombatPauseState = false;

  public init(): void {
    if (this.initialized) return;
    this.initialized = true;

    events.on('campaign:stage_cleared', ({ stageId, isFirstClear }) => {
      this.tryScheduleForStageClear(stageId, isFirstClear);
    });
  }

  public tryScheduleForStageClear(stageId: string, isFirstClear: boolean): AdventureEventDefinition | null {
    if (!isFirstClear || this.presentationActive) return null;

    const stage = getCampaignStageById(stageId);
    if (!stage) return null;

    const world = getCampaignWorldById(stage.worldId);
    if (!world || stage.stageNumber !== world.stageCount) return null;

    const state = store.get();
    const context: AdventureEventContext = {
      worldId: stage.worldId,
      activeClasses: partyTeamSystem
        .getAllCharacters()
        .filter((character) => character.isUnlocked && character.classId)
        .map((character) => character.classId!),
      currentKarma: karmaSystem.getScore(),
      rank: state.rankId,
      gold: state.gold,
    };

    const selected = this.selectMilestoneEvent(stageId, context) ?? adventureEventSystem.selectWeightedEvent(
      context,
      Date.now(),
      (eventDef) => eventDef.choices.some((choice) => adventureEventSystem.isChoiceEligible(choice))
    );
    if (!selected) return null;

    this.previousCombatPauseState = campaignCombatService.getCombatState().isPaused;
    this.presentationActive = true;
    campaignCombatService.setPaused(true);

    analytics.trackEvent('adventure_event_scheduled', {
      eventId: selected.id,
      stageId,
      worldId: stage.worldId,
      cadence: 'first_world_boss_clear',
    });

    events.emit('modal:open', {
      modalId: 'adventure_event_modal',
      data: { event: selected },
    });

    return selected;
  }

  private selectMilestoneEvent(stageId: string, context: AdventureEventContext): AdventureEventDefinition | null {
    if (stageId === PARTNER_AWAKENING_TRIGGER_STAGE_ID && !partnerUnlockSystem.isPartnerUnlocked() && !partnerUnlockSystem.hasAwakeningInvitation()) {
      const partnerEvent = this.getEligibleMilestoneEvent(PARTNER_AWAKENING_EVENT_ID, context);
      if (partnerEvent) return partnerEvent;
    }

    if (stageId === FIRST_PET_TRIGGER_STAGE_ID && petSystem.getOwnedPets().length === 0) {
      const petEvent = this.getEligibleMilestoneEvent(FIRST_PET_EVENT_ID, context);
      if (petEvent) return petEvent;
    }

    return null;
  }

  private getEligibleMilestoneEvent(eventId: string, context: AdventureEventContext): AdventureEventDefinition | null {
    const eventDef = adventureEventSystem.getEventById(eventId);
    if (!eventDef || !adventureEventSystem.isEventEligible(eventDef, context)) return null;
    if (!eventDef.choices.some((choice) => adventureEventSystem.isChoiceEligible(choice))) return null;
    return eventDef;
  }

  public releasePresentationPause(): void {
    if (!this.presentationActive) return;
    this.presentationActive = false;
    campaignCombatService.setPaused(this.previousCombatPauseState);
    this.previousCombatPauseState = false;
  }

  public isPresentationActive(): boolean {
    return this.presentationActive;
  }
}

export const adventureEventDirector = new AdventureEventDirector();
