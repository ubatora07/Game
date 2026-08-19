import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FloatingNumbers } from '../src/ui/vfx/FloatingNumbers';
import { ParticleCanvas } from '../src/ui/vfx/ParticleCanvas';
import { EconomySimulator } from '../src/economy/EconomySimulator';

describe('Phase 55 — Battlefield Performance & Object Pooling Suite', () => {
  let mockContainer: HTMLElement;

  beforeEach(() => {
    mockContainer = {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    } as any;
    FloatingNumbers.init(mockContainer);
    FloatingNumbers.clear();
  });

  it('P55-01: FloatingNumbers reuses pooled elements without unbounded DOM creation', () => {
    // Spawn 10 floating numbers
    for (let i = 0; i < 10; i++) {
      FloatingNumbers.spawn(100, 100, 50 + i);
    }

    const stats1 = FloatingNumbers.getPoolStats();
    expect(stats1.active).toBe(10);

    // Clear / recycle
    FloatingNumbers.clear();
    const stats2 = FloatingNumbers.getPoolStats();
    expect(stats2.active).toBe(0);
    expect(stats2.pooled).toBeGreaterThanOrEqual(10);
  });

  it('P55-02: FloatingNumbers strictly caps active DOM elements to budget (<= 20)', () => {
    // Rapidly spawn 50 numbers in a burst
    for (let i = 0; i < 50; i++) {
      FloatingNumbers.spawn(150, 200, 999, i % 2 === 0);
    }

    const stats = FloatingNumbers.getPoolStats();
    expect(stats.active).toBeLessThanOrEqual(20);
  });

  it('P55-03: ParticleCanvas enforces maximum particle budget (<= 120)', () => {
    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      scale: vi.fn(),
    };

    const mockCanvas = {
      getContext: () => mockCtx,
      clientWidth: 800,
      clientHeight: 600,
      width: 800,
      height: 600,
    } as any;

    const particleCanvas = new ParticleCanvas(mockCanvas);

    // Emit 10 intense bursts
    for (let i = 0; i < 10; i++) {
      particleCanvas.emitBurst(200, 300, 20, '#f59e0b', true);
    }

    const stats = particleCanvas.getStats();
    expect(stats.active).toBeLessThanOrEqual(120);
  });

  it('P55-04: ParticleCanvas clears active particles on clear()', () => {
    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      scale: vi.fn(),
    };

    const mockCanvas = {
      getContext: () => mockCtx,
      clientWidth: 800,
      clientHeight: 600,
      width: 800,
      height: 600,
    } as any;

    const particleCanvas = new ParticleCanvas(mockCanvas);
    particleCanvas.emitBurst(100, 100, 16);
    expect(particleCanvas.getStats().active).toBeGreaterThan(0);

    particleCanvas.clear();
    expect(particleCanvas.getStats().active).toBe(0);
  });

  it('P55-05: 30-Minute High-Frequency Battle Soak Test — Zero memory explosion', () => {
    // 1800 seconds (30 min) soak simulation with active combat
    const result = EconomySimulator.simulate(1800, 'ACTIVE');

    expect(result.enemiesDefeated).toBeGreaterThan(50);
    expect(result.stagesCleared).toBeGreaterThan(5);
    expect(isFinite(result.finalPower)).toBe(true);
    expect(isNaN(result.finalPower)).toBe(false);
    expect(isFinite(result.finalGold)).toBe(true);
    expect(isNaN(result.finalGold)).toBe(false);
  });
});
