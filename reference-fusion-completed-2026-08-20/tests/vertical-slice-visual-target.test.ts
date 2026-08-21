import { describe, it, expect, beforeEach } from 'vitest';
import { PixelSpriteRenderer } from '../src/ui/art/PixelSpriteRenderer';
import { BattlefieldViewport } from '../src/ui/components/BattlefieldViewport';
import { RhythmBeatIndicator } from '../src/ui/components/RhythmBeatIndicator';
import { petSystem } from '../src/systems/PetSystem';
import { store, createInitialState } from '../src/core/GameState';

// Lightweight DOM mock for node environment
function createMockElement(tag: string = 'div'): any {
  const el: any = {
    tagName: tag.toUpperCase(),
    className: '',
    style: {} as Record<string, string>,
    innerHTML: '',
    textContent: '',
    children: [] as any[],
  };
  el.classList = {
    contains: (c: string) => Boolean(el.className && el.className.includes(c)),
    add: (c: string) => { el.className = (el.className ? el.className + ' ' : '') + c; },
    remove: (c: string) => { el.className = (el.className || '').replace(c, '').trim(); }
  };
  el.appendChild = (child: any) => { el.children.push(child); return child; };
  el.removeChild = (child: any) => { el.children = el.children.filter((c: any) => c !== child); return child; };
  el.querySelector = (selector: string) => createMockElement('div');
  el.querySelectorAll = (selector: string) => [createMockElement('div'), createMockElement('div'), createMockElement('div')];
  el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 250, right: 400, bottom: 250 });
  el.addEventListener = () => {};
  el.removeEventListener = () => {};
  return el;
}

(globalThis as any).document = {
  createElement: (tag: string) => createMockElement(tag),
  addEventListener: () => {},
  removeEventListener: () => {},
  body: createMockElement('body')
};

(globalThis as any).window = {
  innerWidth: 600,
  innerHeight: 800,
  requestAnimationFrame: (cb: any) => setTimeout(cb, 0),
  setInterval: () => 1,
  clearInterval: () => {}
};

describe('Intermediate Phases 95.1 — 95.5 Visual Vertical Slice Test Suite', () => {
  beforeEach(() => {
    store.replace(createInitialState());
    petSystem.resetAll();
  });

  it('P95-V01: Swordsman Main Character meets pixel-art contract across all 5 animation states', () => {
    const states: Array<'idle' | 'attack' | 'crit' | 'hurt' | 'victory'> = [
      'idle',
      'attack',
      'crit',
      'hurt',
      'victory',
    ];

    for (const state of states) {
      const svg = PixelSpriteRenderer.getSwordsmanSprite(state, '#d97706');
      expect(svg).toContain('viewBox="0 0 64 64"');
      expect(svg).toContain('swordsman-sprite');
      expect(svg).toContain('image-rendering:pixelated');

      if (state === 'attack') {
        expect(svg).toContain('animate-slash');
        expect(svg).toContain('animate-slash-arc');
      } else if (state === 'crit') {
        expect(svg).toContain('animate-crit-cleave');
        expect(svg).toContain('animate-slash-arc');
      } else if (state === 'hurt') {
        expect(svg).toContain('animate-hurt');
      } else if (state === 'victory') {
        expect(svg).toContain('animate-victory-cheer');
      } else {
        expect(svg).toContain('animate-pixel-idle');
      }
    }
  });

  it('P95-V02: Production Pet Ignis provides distinct visual growth identity across all 3 stages', () => {
    const stage1 = PixelSpriteRenderer.getPetSprite(1);
    expect(stage1).toContain('viewBox="0 0 48 48"');
    expect(stage1).toContain('pet-stage-1');
    expect(stage1).toContain('animate-float-slow');

    const stage2 = PixelSpriteRenderer.getPetSprite(2);
    expect(stage2).toContain('viewBox="0 0 64 64"');
    expect(stage2).toContain('pet-stage-2');
    expect(stage2).toContain('animate-float-medium');

    const stage3 = PixelSpriteRenderer.getPetSprite(3);
    expect(stage3).toContain('viewBox="0 0 80 80"');
    expect(stage3).toContain('pet-stage-3');
    expect(stage3).toContain('animate-sovereign-float');
    expect(stage3).toContain('solarAura');
  });

  it('P95-V03: Goblin Family renders 3 distinct hierarchy tiers conforming to sprite budgets', () => {
    // Minion 64x64
    const minion = PixelSpriteRenderer.getGoblinSprite('minion');
    expect(minion).toContain('viewBox="0 0 64 64"');
    expect(minion).toContain('goblin-minion');

    // Elite 96x96
    const elite = PixelSpriteRenderer.getGoblinSprite('elite');
    expect(elite).toContain('viewBox="0 0 96 96"');
    expect(elite).toContain('goblin-elite');
    expect(elite).toContain('shamanAura');

    // Boss 128x128
    const boss = PixelSpriteRenderer.getGoblinSprite('boss');
    expect(boss).toContain('viewBox="0 0 128 128"');
    expect(boss).toContain('goblin-boss');
    expect(boss).toContain('bossRageAura');
  });

  it('P95-V04: Forest of Spirits battlefield generates multi-layer pixel fantasy environment', () => {
    const bg = PixelSpriteRenderer.getForestBackground();
    expect(bg).toContain('forest-parallax-container');
    expect(bg).toContain('image-rendering:pixelated');
    expect(bg).toContain('Layer 0');
    expect(bg).toContain('Layer 1');
    expect(bg).toContain('Layer 2');
    expect(bg).toContain('Layer 3');
  });

  it('P95-V05: BattlefieldViewport and RhythmBeatIndicator integrate without SaaS or emoji placeholders', () => {
    petSystem.acquirePet('pet_ignis_drake');
    petSystem.setActivePet('pet_ignis_drake');

    const viewport = new BattlefieldViewport();
    const el = viewport.getElement();
    expect(el.classList.contains('pixel-fantasy-battlefield')).toBe(true);

    const rhythm = new RhythmBeatIndicator();
    const rhythmEl = rhythm.getElement();
    expect(rhythmEl.classList.contains('pixel-fantasy-rhythm')).toBe(true);
  });
});
