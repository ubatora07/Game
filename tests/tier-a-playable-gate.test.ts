import { describe, it, expect, beforeEach } from 'vitest';
import { classSystem } from '../src/systems/ClassSystem';
import { skillTreeSystem } from '../src/systems/SkillTreeSystem';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';
import { rhythmAttackSystem } from '../src/systems/RhythmAttackSystem';
import { adventureEventSystem } from '../src/systems/AdventureEventSystem';
import { karmaSystem } from '../src/systems/KarmaSystem';
import { marketSystem } from '../src/systems/MarketSystem';
import { store, createInitialState } from '../src/core/GameState';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { MAGE_NODES } from '../src/content/skillTrees/mageTree';

describe('Phase 91 — Tier A Playable Gate End-to-End Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    modifierResolver.clearAll();
    classSystem.respec(true);
    skillTreeSystem.deserialize();
    partyTeamSystem.deserialize({
      characters: {
        char_1: {
          slotId: 'char_1',
          name: 'Hero 1',
          isUnlocked: true,
          classId: 'mage',
          level: 1,
          skillPoints: 4,
          unlockedSkillNodeIds: [],
        },
        char_2: {
          slotId: 'char_2',
          name: 'Partner 2',
          isUnlocked: false,
          classId: null,
          level: 1,
          skillPoints: 4,
          unlockedSkillNodeIds: [],
        },
      },
      activeFocusSlot: 'char_1',
    });
    rhythmAttackSystem.resetStreak();
    adventureEventSystem.loadDefaultEvents();
    adventureEventSystem.resetAll();
    karmaSystem.resetAll();
    marketSystem.resetAll();
  });

  it('P91-01: 4 Classes & 15-node branching skill trees integrate cleanly', () => {
    classSystem.selectClass('mage');
    expect(classSystem.getSelectedClassId()).toBe('mage');

    const t1 = MAGE_NODES.find((n) => n.id === 'mage_t1_catalyst')!;
    const t2 = MAGE_NODES.find((n) => n.id === 'mage_t2_arcane')!;

    expect(skillTreeSystem.unlockNode(t1, MAGE_NODES)).toBe(true);
    expect(skillTreeSystem.unlockNode(t2, MAGE_NODES)).toBe(true);

    const unlockedIds = skillTreeSystem.getUnlockedNodeIds();
    expect(unlockedIds.length).toBe(2);
  });

  it('P91-02: 2 Main Characters operate simultaneously with independent classes and combined power', () => {
    partyTeamSystem.setCharacterClass('char_1', 'mage');
    partyTeamSystem.unlockSecondCharacter('Valkyrie', 'swordsman');

    const chars = partyTeamSystem.getAllCharacters();
    expect(chars.length).toBe(2);
    expect(chars[0].classId).toBe('mage');
    expect(chars[1].classId).toBe('swordsman');
    expect(chars[1].isUnlocked).toBe(true);
  });

  it('P91-03: Rhythm Attack Engine executes timing clicks and builds streak curve', () => {
    rhythmAttackSystem.setStartTime(0);
    // Streak 1
    const res1 = rhythmAttackSystem.evaluateHit(0);
    expect(res1.rating).toBe('PERFECT');

    // Build streak to 20
    for (let i = 1; i <= 19; i++) {
      rhythmAttackSystem.evaluateHit(i * 500);
    }
    expect(rhythmAttackSystem.getStreak()).toBe(20);
  });

  it('P91-04: Random Events & Village Choices shift Karma and set narrative story flags', () => {
    const oakhaven = adventureEventSystem.getEventById('evt_village_oakhaven_dilemma')!;
    const defendChoice = oakhaven.choices.find((c) => c.id === 'oakhaven_defend')!;

    adventureEventSystem.executeChoice(oakhaven, defendChoice);
    expect(karmaSystem.getScore()).toBe(20);
    expect(karmaSystem.getKarmaBand()).toBe('positive');
    expect(karmaSystem.hasMajorChoiceFlag('followup_evt_village_oakhaven_gratitude')).toBe(true);
  });

  it('P91-05: Narrative Hero Recruitment & Small Market transactions complete successfully', () => {
    // 1. Recruit
    store.set((draft) => {
      delete draft.heroes['lin'];
      draft.gold = 50000;
      draft.crystals = 100;
    });

    const recruitEvent = adventureEventSystem.getEventById('evt_recruit_sorceress')!;
    const choice = recruitEvent.choices.find((c) => c.id === 'welcome_sorceress')!;
    adventureEventSystem.executeChoice(recruitEvent, choice);

    expect(store.get().heroes['lin']).toBeDefined();
    expect(store.get().heroes['lin'].stars).toBe(1);

    // 2. Market Purchase
    const slots = marketSystem.getSlots();
    const goldSlot = slots.find((s) => s.currency === 'gold')!;
    const initialGold = store.get().gold;

    const purchaseRes = marketSystem.purchaseItem(goldSlot.slotId);
    expect(purchaseRes.success).toBe(true);
    expect(store.get().gold).toBe(initialGold - goldSlot.price);
  });
});
