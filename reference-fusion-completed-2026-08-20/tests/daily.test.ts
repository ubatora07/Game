import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { DailySystem } from '../src/systems/DailySystem';
import { TimeService } from '../src/services/TimeService';

describe('Daily System', () => {
  let mockNow: number;

  beforeEach(() => {
    store.replace(createInitialState());
    
    mockNow = new Date('2026-08-18T12:00:00Z').getTime();
    vi.spyOn(TimeService, 'now').mockImplementation(() => mockNow);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize first time play', () => {
    DailySystem.checkDailyReset();
    
    const state = store.get();
    expect(state.loginStreak).toBe(1);
    expect(state.dailyQuests.length).toBe(3);
    expect(state.lastDailyResetAt).toBe(TimeService.getMidnight(mockNow));
  });

  it('should increment streak if 1 day passes', () => {
    DailySystem.checkDailyReset(); // Day 1
    
    // Fast forward 1 day
    mockNow += 24 * 3600 * 1000;
    DailySystem.checkDailyReset(); // Day 2
    
    const state = store.get();
    expect(state.loginStreak).toBe(2);
  });

  it('should reset streak if 2 days pass', () => {
    DailySystem.checkDailyReset(); // Day 1
    
    // Fast forward 2 days (missed a day)
    mockNow += 2 * 24 * 3600 * 1000;
    DailySystem.checkDailyReset(); // Reset!
    
    const state = store.get();
    expect(state.loginStreak).toBe(1);
  });

  it('should not increment if same day', () => {
    DailySystem.checkDailyReset(); // Day 1
    
    // Fast forward 12 hours (still same day technically if midnight is same, wait, 12 hours from 12:00Z is 00:00Z next day)
    // Let's forward 6 hours
    mockNow += 6 * 3600 * 1000;
    DailySystem.checkDailyReset(); // Same day
    
    const state = store.get();
    expect(state.loginStreak).toBe(1);
  });

  it('should claim login reward', () => {
    DailySystem.checkDailyReset();
    const success = DailySystem.claimLoginReward();
    expect(success).toBe(true);
    
    const state = store.get();
    expect(state.crystals).toBe(150 + 60); // Base 50 + (1%30)*10 = 60
    expect(state.loginRewardClaimed).toBe(true);
    
    // Can't claim twice
    const success2 = DailySystem.claimLoginReward();
    expect(success2).toBe(false);
  });
});
