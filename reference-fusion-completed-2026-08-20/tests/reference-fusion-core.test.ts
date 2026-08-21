import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState, store } from '../src/core/GameState';
import { modifierResolver } from '../src/core/modifiers/ModifierResolver';
import { getCampaignStageById } from '../src/content/campaignStages';
import { campaignCombatService } from '../src/systems/CampaignCombatService';
import { CampaignProgressionSystem } from '../src/systems/CampaignProgressionSystem';
import { CampaignLootSystem } from '../src/systems/CampaignLootSystem';
import { IdleProgressionSimulator } from '../src/systems/IdleProgressionSimulator';
import { partyTeamSystem } from '../src/systems/PartyTeamSystem';
import { petSystem } from '../src/systems/PetSystem';
import { craftingEquipmentSystem } from '../src/systems/CraftingEquipmentSystem';
import { sanitizeGameState } from '../src/services/save/SaveSchema';

describe('Reference fusion — core combat and idle contracts', () => {
  beforeEach(() => {
    modifierResolver.clearAll();
    partyTeamSystem.resetAll();
    petSystem.resetAll();
    craftingEquipmentSystem.resetAll();
    const fresh = createInitialState();
    fresh.settings.soundEnabled = false;
    fresh.settings.musicEnabled = false;
    store.replace(fresh);
    campaignCombatService.resetToStage('1-1');
    campaignCombatService.setPaused(false);
    campaignCombatService.setAutoAttackEnabled(true);
  });

  it('reserves the final encounter for an authored elite', () => {
    campaignCombatService.resetToStage('1-3');
    const stage = getCampaignStageById('1-3')!;
    store.set((draft) => {
      draft.campaign.currentEncounter = stage.enemyCount;
    });

    campaignCombatService.spawnCurrentEncounter();
    expect(campaignCombatService.getCombatState().activeEnemy?.archetype).toBe('elite');
  });

  it('keeps discrete auto-attack damage invariant across common frame rates', () => {
    const damageSamples: number[] = [];

    for (const fps of [30, 60, 144]) {
      store.replace(createInitialState());
      partyTeamSystem.resetAll();
      campaignCombatService.resetToStage('1-1');
      const enemy = campaignCombatService.getCombatState().activeEnemy!;
      const startingHp = enemy.currentHp;
      const dt = 1 / fps;

      for (let elapsed = 0; elapsed < 0.5 - 1e-9; elapsed += dt) {
        campaignCombatService.update(dt);
      }

      damageSamples.push(startingHp - campaignCombatService.getCombatState().activeEnemy!.currentHp);
    }

    expect(damageSamples[1]).toBe(damageSamples[0]);
    expect(damageSamples[2]).toBe(damageSamples[0]);
  });

  it('makes defense reduce real enemy attack damage', () => {
    campaignCombatService.resetToStage('1-1');
    let combat = campaignCombatService.getCombatState();
    combat.activeEnemy!.attackDamage = 8;
    combat.hero.defense = 0;
    const noDefenseStart = combat.hero.currentHp;
    (campaignCombatService as any).executeEnemyAttack();
    const noDefenseDamage = noDefenseStart - combat.hero.currentHp;

    campaignCombatService.resetToStage('1-1');
    combat = campaignCombatService.getCombatState();
    combat.activeEnemy!.attackDamage = 8;
    combat.hero.defense = 250;
    const defendedStart = combat.hero.currentHp;
    (campaignCombatService as any).executeEnemyAttack();
    const defendedDamage = defendedStart - combat.hero.currentHp;

    expect(defendedDamage).toBeLessThan(noDefenseDamage);
  });

  it('cannot grant the same kill twice while resolving reward/death', () => {
    const before = store.get().stats.campaignEnemiesDefeated;
    (campaignCombatService as any).handleEnemyDefeat(false);
    (campaignCombatService as any).handleEnemyDefeat(false);
    expect(store.get().stats.campaignEnemiesDefeated).toBe(before + 1);
  });

  it('transitions reward -> run -> combat with the next encounter', () => {
    (campaignCombatService as any).handleEnemyDefeat(false);
    expect(campaignCombatService.getCombatState().phase).toBe('reward');

    campaignCombatService.update(0.18);
    expect(campaignCombatService.getCombatState().phase).toBe('run');

    campaignCombatService.update(0.14);
    expect(campaignCombatService.getCombatState().phase).toBe('combat');
    expect(campaignCombatService.getCombatState().encounterIndex).toBe(2);
    expect(campaignCombatService.getCombatState().activeEnemy).not.toBeNull();
  });

  it('does not let one burst hit bypass a shield-boss threshold', () => {
    campaignCombatService.resetToStage('1-5');
    const enemy = campaignCombatService.getCombatState().activeEnemy!;
    campaignCombatService.applyDamageToEnemy(enemy.maxHp * 10);

    expect(enemy.currentHp).toBeGreaterThanOrEqual(Math.ceil(enemy.maxHp * 0.5));
    expect(enemy.maxShieldHp).toBeGreaterThan(0);
  });

  it('consumes a boss retry boost after a successful boss clear', () => {
    campaignCombatService.resetToStage('1-5');
    store.set((draft) => {
      draft.campaign.bossRetryState = {
        bossId: 'boss_1_5',
        failedAt: Date.now(),
        retryBoostActive: true,
      };
      CampaignProgressionSystem.onEnemyDefeated(draft, 'boss_1_5', true, { emitEvents: false });
    });

    expect(store.get().campaign.bossRetryState).toBeNull();
  });

  it('guarantees equipment on a boss first-clear and persists it through inventory save', () => {
    const roll = CampaignLootSystem.rollEquipmentDrop({
      stageId: '1-5',
      worldId: 1,
      globalStageIndex: 5,
      encounterIndex: 1,
      enemyId: 'boss_1_5',
      isBoss: true,
      isElite: false,
      isFirstClear: true,
      stageCleared: true,
      killSequence: 1,
    });

    expect(roll.dropChance).toBe(1);
    expect(roll.item).not.toBeNull();
    craftingEquipmentSystem.addItemToInventory(roll.item!);
    const saved = craftingEquipmentSystem.serialize();
    const id = roll.item!.id;
    craftingEquipmentSystem.resetAll();
    craftingEquipmentSystem.deserialize(saved);
    expect(craftingEquipmentSystem.getInventory().some((item) => item.id === id)).toBe(true);
  });

  it('persists campaign XP fields through save sanitization', () => {
    (campaignCombatService as any).handleEnemyDefeat(true);
    const partySave = partyTeamSystem.serialize();
    const raw = createInitialState();
    raw.partyTeam = partySave;
    const sanitized = sanitizeGameState(raw);

    expect(sanitized.partyTeam?.characters.char_1.level).toBe(partySave.characters.char_1.level);
    expect(sanitized.partyTeam?.characters.char_1.xp).toBe(partySave.characters.char_1.xp);
    expect(sanitized.partyTeam?.characters.char_1.xpToNextLevel).toBe(partySave.characters.char_1.xpToNextLevel);
  });

  it('splits offline economy exactly at temporary buff expiry boundaries', () => {
    const state = createInitialState();
    state.buildings.dojo = 10;
    const startAt = 1_000_000;
    state.buffs.celestialSurgeEndsAt = startAt + 30_000;

    const full = IdleProgressionSimulator.simulateEconomy(state, 60, {
      startAtMs: startAt,
      maxStepSeconds: 60,
    });
    const firstHalf = IdleProgressionSimulator.simulateEconomy(state, 30, {
      startAtMs: startAt,
      maxStepSeconds: 60,
    });
    const secondHalf = IdleProgressionSimulator.simulateEconomy(state, 30, {
      startAtMs: startAt + 30_000,
      maxStepSeconds: 60,
    });

    expect(full.powerGained).toBeCloseTo(firstHalf.powerGained + secondHalf.powerGained, 8);
    expect(full.goldGained).toBeCloseTo(firstHalf.goldGained + secondHalf.goldGained, 8);
  });

  it('advances from the final world-1 boss into world 2', () => {
    for (let stageNumber = 1; stageNumber <= 10; stageNumber += 1) {
      const stageId = `1-${stageNumber}`;
      const stage = getCampaignStageById(stageId)!;
      store.set((draft) => {
        draft.campaign.currentStageId = stageId;
        draft.campaign.currentWorldId = 1;
        draft.campaign.currentEncounter = 1;
        draft.campaign.campaignMode = 'progress';
        draft.campaign.autoAdvance = true;
      });

      for (let encounter = 0; encounter < stage.enemyCount; encounter += 1) {
        store.set((draft) => {
          CampaignProgressionSystem.onEnemyDefeated(
            draft,
            stage.isBoss ? stage.bossId : 'forest_goblin',
            stage.isBoss,
            { emitEvents: false },
          );
        });
      }
    }

    expect(store.get().campaign.currentStageId).toBe('2-1');
    expect(store.get().campaign.currentWorldId).toBe(2);
  });
});
