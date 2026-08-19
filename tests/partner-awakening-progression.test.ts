import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState, store } from '../src/core/GameState';
import { events } from '../src/core/EventBus';
import { PARTNER_AWAKENING_EVENT_ID, PARTNER_AWAKENING_INVITATION_FLAG } from '../src/content/partnerUnlock';
import { adventureEventDirector } from '../src/systems/AdventureEventDirector';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { campaignCombatService } from '../src/systems/CampaignCombatService';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { partnerUnlockSystem } from '../src/systems/PartnerUnlockSystem';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';

describe('Partner Awakening progression contract', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    karmaSystem.resetAll();
    partyTeamSystem.resetAll();
    adventureEventSystem.resetAll();
    adventureEventSystem.clearEvents();
    adventureEventSystem.loadDefaultEvents();
    adventureEventDirector.releasePresentationPause();
    campaignCombatService.setPaused(false);
  });

  it('blocks fresh-save awakening until the story invitation is earned', () => {
    expect(partnerUnlockSystem.hasAwakeningInvitation()).toBe(false);
    expect(partnerUnlockSystem.canAwakenPartner()).toBe(false);
    expect(partnerUnlockSystem.completeAwakening('Rowan', 'swordsman')).toBe(false);
    expect(partyTeamSystem.getCharacter('char_2').isUnlocked).toBe(false);
  });

  it('prioritizes the dedicated Partner story on the first World 1 boss clear', () => {
    const selected = adventureEventDirector.tryScheduleForStageClear('1-10', true);
    expect(selected?.id).toBe(PARTNER_AWAKENING_EVENT_ID);
    expect(campaignCombatService.getCombatState().isPaused).toBe(true);
  });

  it('persists the invitation in Karma history and unlocks only through the gated completion path', () => {
    const eventDef = adventureEventSystem.getEventById(PARTNER_AWAKENING_EVENT_ID)!;
    const choice = eventDef.choices[0];
    let openedPartnerModal = false;
    const off = events.on('modal:open', ({ modalId }) => {
      if (modalId === 'partner_awakening') openedPartnerModal = true;
    });

    adventureEventSystem.executeChoice(eventDef, choice);
    expect(openedPartnerModal).toBe(true);
    expect(karmaSystem.hasMajorChoiceFlag(PARTNER_AWAKENING_INVITATION_FLAG)).toBe(true);
    expect(partnerUnlockSystem.canAwakenPartner()).toBe(true);

    const savedKarma = karmaSystem.serialize();
    karmaSystem.resetAll();
    expect(partnerUnlockSystem.canAwakenPartner()).toBe(false);
    karmaSystem.deserialize(savedKarma);
    expect(partnerUnlockSystem.canAwakenPartner()).toBe(true);

    expect(partnerUnlockSystem.completeAwakening('Rowan', 'archer')).toBe(true);
    expect(partyTeamSystem.getCharacter('char_2')).toMatchObject({
      isUnlocked: true,
      name: 'Rowan',
      classId: 'archer',
    });
    expect(partnerUnlockSystem.canAwakenPartner()).toBe(false);
    off();
  });
});
