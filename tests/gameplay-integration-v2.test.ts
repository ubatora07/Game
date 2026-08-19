import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState, store } from '../src/core/GameState';
import { events } from '../src/core/EventBus';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';
import { petSystem } from '../src/systems/PetSystem';
import { mercenarySystem } from '../src/systems/MercenarySystem';
import { settlementStorySystem } from '../src/systems/SettlementStorySystem';
import { worldStateManager } from '../src/systems/WorldStateManager';
import { titleSystem } from '../src/systems/TitleSystem';
import { campaignCombatService } from '../src/systems/CampaignCombatService';
import { SettlementVisualRenderer } from '../src/ui/art/SettlementVisualRenderer';
import { HEROES } from '../src/content/heroes';

describe('Game Consolidation V1 — Gameplay Integration Contracts', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    modifierResolver.clearAll();
    partyTeamSystem.resetAll();
    petSystem.resetAll();
    mercenarySystem.resetAll();
    titleSystem.resetAll();
    settlementStorySystem.resetAll();
    worldStateManager.resetAll();
    campaignCombatService.resetToStage('1-1');
  });

  it('P10-05: hero damage skills share the death guard and cannot duplicate kill rewards', () => {
    campaignCombatService.resetToStage('1-1');
    const directDamageHero = HEROES.find((hero) => hero.skill?.type === 'direct_damage')!;
    const combatEnemy = campaignCombatService.getCombatState().activeEnemy!;
    combatEnemy.currentHp = 1;
    const killsBefore = store.get().stats.campaignEnemiesDefeated;

    (campaignCombatService as any).executeHeroSkill(directDamageHero, 1);
    (campaignCombatService as any).executeHeroSkill(directDamageHero, 1);

    expect(store.get().stats.campaignEnemiesDefeated).toBe(killsBefore + 1);
  });

  it('P10-06/P10-20: party modifiers are idempotent and focus changes editing target only', () => {
    partyTeamSystem.setCharacterClass('char_1', 'archer');
    partyTeamSystem.unlockSecondCharacter('Vanguard', 'swordsman');

    const attackBefore = modifierResolver.resolve('attack', 100);
    const modifierCountBefore = modifierResolver.getModifierCount();

    partyTeamSystem.reapplyAllModifiers();
    partyTeamSystem.reapplyAllModifiers();

    expect(modifierResolver.resolve('attack', 100)).toBeCloseTo(attackBefore, 6);
    expect(modifierResolver.getModifierCount()).toBe(modifierCountBefore);

    expect(partyTeamSystem.setActiveFocusSlot('char_2')).toBe(true);
    expect(partyTeamSystem.getFocusedCharacter().slotId).toBe('char_2');
    expect(modifierResolver.resolve('attack', 100)).toBeCloseTo(attackBefore, 6);
  });

  it('P10-10/P10-11: expired mercenary contracts are removed together with their modifiers', () => {
    store.set((draft) => {
      draft.gold = 100_000;
    });

    expect(mercenarySystem.hireMercenary('merc_boran').success).toBe(true);
    expect(mercenarySystem.isMercenaryActive('merc_boran')).toBe(true);
    expect(modifierResolver.resolve('settlementDefense', 0)).toBeGreaterThan(0);

    const saved = mercenarySystem.serialize();
    saved.activeContracts.merc_boran.expiresAtTimestamp = Date.now() - 1;
    mercenarySystem.deserialize(saved);

    expect(mercenarySystem.isMercenaryActive('merc_boran')).toBe(false);
    expect(mercenarySystem.getContract('merc_boran')).toBeUndefined();
    expect(modifierResolver.resolve('settlementDefense', 0)).toBe(0);
  });

  it('P10-17/P10-18: story choice creates a world flag that is consumed by settlement visuals', () => {
    expect(worldStateManager.hasFlag('sovereign_citadel_erected')).toBe(false);
    expect(settlementStorySystem.choosePath('lord')).toBe(true);
    expect(worldStateManager.hasFlag('sovereign_citadel_erected')).toBe(true);

    const activeFlags = worldStateManager.getActiveVisualConsequences().map(({ flagId }) => flagId);
    const overlay = SettlementVisualRenderer.getWorldConsequenceOverlaySvg(activeFlags);
    expect(overlay).toContain('sovereign_citadel_erected');
    expect(overlay).toContain('data-consequence="legacy-citadel"');
  });

  it('P10-19: pet synergy activates when either unlocked party character matches', () => {
    partyTeamSystem.setCharacterClass('char_1', 'swordsman');
    partyTeamSystem.unlockSecondCharacter('Lyra', 'archer');
    petSystem.acquirePet('pet_sylph_sprite');
    petSystem.setActivePet('pet_sylph_sprite');

    const synergy = petSystem.getSynergyStatus('pet_sylph_sprite');
    expect(synergy.hasSynergy).toBe(true);
    expect(synergy.matchingClass).toBe('archer');

    petSystem.reapplyActivePetModifiers();
    expect(modifierResolver.resolve('attackSpeed', 1)).toBeGreaterThan(1);
  });

  it('P10-21: shared damage path applies boss shield mechanics to every damage source', () => {
    campaignCombatService.resetToStage('1-5');
    const enemy = campaignCombatService.getCombatState().activeEnemy!;
    expect(enemy.isBoss).toBe(true);
    expect(enemy.specialMechanic).toBe('shield');

    // Cross the 50% threshold through the same applyDamageToEnemy path used by
    // manual attacks, auto attacks, hero skills and pet actions.
    campaignCombatService.applyDamageToEnemy(Math.ceil(enemy.maxHp * 0.6));
    expect(enemy.shieldHp).toBeGreaterThan(0);

    const hpBefore = enemy.currentHp;
    const shieldBefore = enemy.shieldHp!;
    const applied = campaignCombatService.applyDamageToEnemy(Math.max(1, Math.floor(shieldBefore / 2)));
    expect(applied.appliedShieldDamage).toBeGreaterThan(0);
    expect(enemy.currentHp).toBe(hpBefore);
  });


  it('P10-22: campaign reward events fire only after the store transaction has notified subscribers', () => {
    campaignCombatService.resetToStage('1-1');
    let storeNotified = false;
    let eventObservedCommittedState = false;
    const unsubscribeStore = store.subscribe(() => {
      storeNotified = true;
    });
    storeNotified = false; // ignore the immediate subscribe snapshot callback
    const unsubscribeEvent = events.on('campaign:enemy_defeated', () => {
      eventObservedCommittedState = storeNotified && store.get().stats.campaignEnemiesDefeated === 1;
    });

    try {
      (campaignCombatService as any).handleEnemyDefeat(false);
    } finally {
      unsubscribeEvent();
      unsubscribeStore();
    }

    expect(eventObservedCommittedState).toBe(true);
  });

  it('P10-24: serialize/deserialize cycles reapply modifier sources without duplication or leaks', () => {
    store.set((draft) => {
      draft.gold = 100_000;
    });
    partyTeamSystem.setCharacterClass('char_1', 'swordsman');
    petSystem.acquirePet('pet_aegis_golem');
    petSystem.setActivePet('pet_aegis_golem');
    mercenarySystem.hireMercenary('merc_boran');
    settlementStorySystem.choosePath('adventurer');

    const partySave = partyTeamSystem.serialize();
    const petSave = petSystem.serialize();
    const mercSave = mercenarySystem.serialize();
    const storySave = settlementStorySystem.serialize();
    const expectedAttack = modifierResolver.resolve('attack', 100);
    const expectedSpeed = modifierResolver.resolve('attackSpeed', 1);
    const expectedBossDamage = modifierResolver.resolve('bossDamage', 1);
    const expectedCount = modifierResolver.getModifierCount();

    modifierResolver.clearAll();
    partyTeamSystem.deserialize(partySave);
    petSystem.deserialize(petSave);
    mercenarySystem.deserialize(mercSave);
    settlementStorySystem.deserialize(storySave);

    expect(modifierResolver.resolve('attack', 100)).toBeCloseTo(expectedAttack, 6);
    expect(modifierResolver.resolve('attackSpeed', 1)).toBeCloseTo(expectedSpeed, 6);
    expect(modifierResolver.resolve('bossDamage', 1)).toBeCloseTo(expectedBossDamage, 6);
    expect(modifierResolver.getModifierCount()).toBe(expectedCount);

    // Re-applying the same loaded state must overwrite/clear by source, never stack it.
    partyTeamSystem.deserialize(partySave);
    petSystem.deserialize(petSave);
    mercenarySystem.deserialize(mercSave);
    settlementStorySystem.deserialize(storySave);
    expect(modifierResolver.getModifierCount()).toBe(expectedCount);
  });

  it('P10-23: repeated death resolution cannot grant the same kill twice', () => {
    campaignCombatService.resetToStage('1-1');
    const beforeKills = store.get().stats.campaignEnemiesDefeated;
    let killEvents = 0;
    const unbind = events.on('combat:enemy_killed', () => {
      killEvents += 1;
    });

    try {
      (campaignCombatService as any).handleEnemyDefeat(false);
      (campaignCombatService as any).handleEnemyDefeat(false);
    } finally {
      unbind();
    }

    expect(store.get().stats.campaignEnemiesDefeated).toBe(beforeKills + 1);
    expect(killEvents).toBe(1);
  });
});
