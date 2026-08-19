import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { liveOps, LiveOpsService, LIVEOPS_EVENTS } from '../src/services/liveops/LiveOpsService';
import { events } from '../src/core/EventBus';

describe('Phase 70 — LiveOps Events & In-Game Activities Suite', () => {
  const frameworkDocPath = path.join(__dirname, '..', 'docs', 'LIVEOPS_EVENT_FRAMEWORK.md');

  beforeEach(() => {
    liveOps.setActiveEvent('sakura_festival');
  });

  it('P70-01: LIVEOPS_EVENT_FRAMEWORK.md exists and defines all 3 events', () => {
    expect(fs.existsSync(frameworkDocPath)).toBe(true);
    const content = fs.readFileSync(frameworkDocPath, 'utf8');

    expect(content).toContain('LiveOps Event Framework');
    expect(content).toContain('Sakura Blossom Festival');
    expect(content).toContain('Void Invasion');
    expect(content).toContain('Endless Boss Rush');
    expect(content).toContain('Events reuse the existing engine');
  });

  it('P70-02: LiveOpsService registers all event configs cleanly', () => {
    expect(LIVEOPS_EVENTS.sakura_festival).toBeDefined();
    expect(LIVEOPS_EVENTS.sakura_festival.particleTheme).toBe('sakura');
    expect(LIVEOPS_EVENTS.sakura_festival.quests.length).toBeGreaterThan(0);

    expect(LIVEOPS_EVENTS.void_invasion).toBeDefined();
    expect(LIVEOPS_EVENTS.void_invasion.particleTheme).toBe('void');

    expect(LIVEOPS_EVENTS.boss_rush).toBeDefined();
    expect(LIVEOPS_EVENTS.boss_rush.particleTheme).toBe('fire');
  });

  it('P70-03: Dynamic event activation and particle theme resolution', () => {
    const emitSpy = vi.spyOn(events, 'emit');

    liveOps.setActiveEvent('void_invasion');
    expect(liveOps.getActiveParticleTheme()).toBe('void');
    expect(liveOps.isEventActive('void_invasion')).toBe(true);
    expect(liveOps.isEventActive('sakura_festival')).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith('liveops:event_changed', { eventId: 'void_invasion' });

    liveOps.setActiveEvent('boss_rush');
    expect(liveOps.getActiveParticleTheme()).toBe('fire');

    liveOps.setActiveEvent(null);
    expect(liveOps.getActiveEvent()).toBeNull();
    expect(liveOps.getActiveParticleTheme()).toBe('default');
  });
});
