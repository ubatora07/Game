import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { NAV_TABS, Navigation } from '../src/ui/components/Navigation';
import { MoreMenuModal } from '../src/ui/modals/MoreMenuModal';
import { getPrimaryDomainForScreen, PRIMARY_DOMAINS } from '../src/ui/navigation/PrimaryDomains';

// Node DOM mock
function createMockElement(tag: string = 'div'): any {
  const attributes: Record<string, string> = {};
  return {
    tagName: tag.toUpperCase(),
    className: '',
    classList: {
      contains: (_c: string) => false,
      add: (_c: string) => {},
      remove: (_c: string) => {},
      toggle: (_c: string, _force?: boolean) => false,
    },
    style: {} as Record<string, string>,
    dataset: {} as Record<string, string>,
    innerHTML: '',
    textContent: '',
    children: [] as any[],
    appendChild: function(child: any) { this.children.push(child); return child; },
    removeChild: function(child: any) {
      this.children = this.children.filter((c: any) => c !== child);
      return child;
    },
    querySelector: function() {
      return createMockElement('div');
    },
    querySelectorAll: function() {
      return [];
    },
    getAttribute: (attr: string) => attributes[attr] ?? null,
    setAttribute: (attr: string, value: string) => { attributes[attr] = value; },
    removeAttribute: (attr: string) => { delete attributes[attr]; },
    addEventListener: () => {},
    removeEventListener: () => {}
  };
}

(globalThis as any).document = {
  createElement: (tag: string) => createMockElement(tag),
  addEventListener: () => {},
  removeEventListener: () => {},
  body: createMockElement('body')
};

(globalThis as any).window = {
  setInterval: () => 1,
  clearInterval: () => {}
};

describe('Phase 114 — UX Information Architecture V3', () => {
  beforeEach(() => {
    store.replace(createInitialState());
  });

  it('P114-01: primary navigation is exactly Hero / Team / Battle / Settlement / World / More', () => {
    expect(NAV_TABS).toBe(PRIMARY_DOMAINS);
    expect(NAV_TABS.map((tab) => tab.id)).toEqual([
      'hero',
      'team',
      'battle',
      'settlement',
      'world',
      'more',
    ]);
  });

  it('P114-02: deep routes resolve to one coherent primary domain', () => {
    expect(getPrimaryDomainForScreen('home')).toBe('battle');
    expect(getPrimaryDomainForScreen('ascension')).toBe('hero');
    expect(getPrimaryDomainForScreen('heroes')).toBe('team');
    expect(getPrimaryDomainForScreen('summon')).toBe('team');
    expect(getPrimaryDomainForScreen('tower')).toBe('world');
    expect(getPrimaryDomainForScreen('expeditions')).toBe('world');
    expect(getPrimaryDomainForScreen('quests')).toBe('world');
    expect(getPrimaryDomainForScreen('sect')).toBe('more');
    expect(getPrimaryDomainForScreen('souls')).toBe('more');
    expect(getPrimaryDomainForScreen('unknown-route')).toBeNull();
  });

  it('P114-03: More contains legacy/meta systems instead of primary-domain overflow', () => {
    expect(MoreMenuModal.id).toBe('more_menu');
    const modalEl = MoreMenuModal.render();
    expect(modalEl).toBeDefined();

    expect(modalEl.innerHTML).toContain('data-id="sect"');
    expect(modalEl.innerHTML).toContain('data-id="souls"');
    expect(modalEl.innerHTML).toContain('data-id="relics"');
    expect(modalEl.innerHTML).toContain('data-id="dailies"');
    expect(modalEl.innerHTML).toContain('data-id="legacy_codex_modal"');
    expect(modalEl.innerHTML).toContain('data-id="stats"');
    expect(modalEl.innerHTML).toContain('data-id="settings"');

    expect(modalEl.innerHTML).not.toContain('data-id="settlement"');
    expect(modalEl.innerHTML).not.toContain('data-id="tower"');
    expect(modalEl.innerHTML).not.toContain('data-id="expeditions"');
    expect(modalEl.innerHTML).not.toContain('data-id="market_modal"');
    expect(modalEl.innerHTML).not.toContain('data-id="pet_modal"');
  });

  it('P114-04: Navigation instantiates with the badge polling lifecycle', () => {
    const nav = new Navigation();
    expect(nav.getElement()).toBeDefined();
    expect(() => nav.destroy()).not.toThrow();
  });
});
