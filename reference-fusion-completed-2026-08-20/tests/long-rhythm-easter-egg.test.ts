import { describe, it, expect, beforeEach } from 'vitest';
import { rhythmAttackSystem } from '../src/systems/RhythmAttackSystem';
import { RhythmMasterEasterEggModal } from '../src/ui/modals/RhythmMasterEasterEggModal';
import { events } from '../src/core/EventBus';

describe('Phase 84 — Long-Rhythm Easter Egg Suite', () => {
  beforeEach(() => {
    rhythmAttackSystem.resetStreak();
    rhythmAttackSystem.setEnabled(true);
    rhythmAttackSystem.setConfig({
      bpm: 120,
      perfectWindowMs: 80,
      goodWindowMs: 160,
      minClickIntervalMs: 90,
      streakTimeoutMs: 1500,
    });
  });

  it('P84-01: RhythmMasterEasterEggModal is properly defined', () => {
    expect(RhythmMasterEasterEggModal.id).toBe('rhythm_master_easter_egg');
    expect(typeof RhythmMasterEasterEggModal.render).toBe('function');
  });

  it('P84-02: Reaching 500 rhythm streak unlocks the easter egg and emits modal:open', () => {
    const baseTime = 10000;
    rhythmAttackSystem.setStartTime(baseTime);

    let modalOpened = false;
    events.on('modal:open', (data: any) => {
      if (data.modalId === 'rhythm_master_easter_egg') {
        modalOpened = true;
      }
    });

    for (let i = 0; i < 500; i++) {
      rhythmAttackSystem.evaluateHit(baseTime + i * 500);
    }

    expect(rhythmAttackSystem.getStreak()).toBe(500);
    expect(rhythmAttackSystem.isEasterEggClaimed()).toBe(true);
    expect(modalOpened).toBe(true);
  });

  it('P84-03: Debug trigger allows QA and testing without grinding 500 hits', () => {
    let debugOpened = false;
    events.on('modal:open', (data: any) => {
      if (data.modalId === 'rhythm_master_easter_egg') {
        debugOpened = true;
      }
    });

    rhythmAttackSystem.triggerEasterEggDebug();
    expect(rhythmAttackSystem.isEasterEggClaimed()).toBe(true);
    expect(debugOpened).toBe(true);
  });
});
