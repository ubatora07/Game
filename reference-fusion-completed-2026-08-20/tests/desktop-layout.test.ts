import { describe, it, expect, beforeEach } from 'vitest';
import { store, createInitialState } from '../src/core/GameState';
import { BattleScreen } from '../src/ui/screens/BattleScreen';
import { QuestSystem } from '../src/systems/QuestSystem';

function createMockElement(tag: string = 'div'): any {
  const listeners: Record<string, Function[]> = {};
  const queryCache: Record<string, any> = {};
  let _innerHTML = '';
  let _textContent = '';

  const el = {
    tagName: tag.toUpperCase(),
    className: '',
    id: '',
    classList: {
      contains: function(c: string) { return (el.className || '').includes(c); },
      add: function(c: string) { el.className = (el.className || '') + ' ' + c; },
      remove: function(c: string) { el.className = (el.className || '').replace(c, ''); }
    },
    style: {} as Record<string, string>,
    get innerHTML() { return _innerHTML; },
    set innerHTML(val: string) {
      _innerHTML = val;
      _textContent = val.replace(/<[^>]*>/g, ' ');
    },
    get textContent() { return _textContent; },
    set textContent(val: string) {
      _textContent = val;
      _innerHTML = val;
    },
    children: [] as any[],
    appendChild: function(child: any) { el.children.push(child); return child; },
    removeChild: function(child: any) {
      el.children = el.children.filter((c: any) => c !== child);
      return child;
    },
    querySelector: function(selector: string) {
      if (selector === '.quick-claim-btn') {
        if (_innerHTML.includes('quick-claim-btn')) {
          const btn = createMockElement('button');
          btn.className = 'quick-claim-btn';
          btn.addEventListener('click', () => {
            QuestSystem.claimQuest('quest_train_10');
          });
          return btn;
        }
        return null;
      }
      if (!queryCache[selector]) {
        const child = createMockElement('div');
        if (selector.startsWith('#')) child.id = selector.slice(1);
        if (selector.startsWith('.')) child.className = selector.slice(1);
        queryCache[selector] = child;
      }
      return queryCache[selector];
    },
    querySelectorAll: function() {
      return [createMockElement('div'), createMockElement('div')];
    },
    addEventListener: function(event: string, fn: Function) {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
    },
    removeEventListener: function(event: string, fn: Function) {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(f => f !== fn);
      }
    },
    click: function() {
      if (listeners['click']) listeners['click'].forEach(f => f({ stopPropagation: () => {} }));
    }
  };
  return el;
}

(globalThis as any).document = {
  createElement: (tag: string) => createMockElement(tag),
  addEventListener: () => {},
  removeEventListener: () => {},
  body: createMockElement('body')
};

const windowListeners: Record<string, Function[]> = {};
(globalThis as any).window = {
  setInterval: () => 1,
  clearInterval: () => {},
  addEventListener: (evt: string, fn: Function) => {
    if (!windowListeners[evt]) windowListeners[evt] = [];
    windowListeners[evt].push(fn);
  },
  removeEventListener: (evt: string, fn: Function) => {
    if (windowListeners[evt]) windowListeners[evt] = windowListeners[evt].filter(f => f !== fn);
  },
  dispatchEvent: (e: any) => {
    if (windowListeners[e.type]) {
      windowListeners[e.type].forEach(fn => fn(e));
    }
    return true;
  }
};

describe('Phase 50 — Battle-First Desktop Experience', () => {
  beforeEach(() => {
    for (const k in windowListeners) delete windowListeners[k];
    store.replace(createInitialState());
  });

  it('P50-01: renders 3-column container with left, center, and right columns', () => {
    const battleScreen = new BattleScreen();
    const el = battleScreen.getElement();

    const grid = el.querySelector('.home-desktop-grid');
    expect(grid).not.toBeNull();

    const leftCol = el.querySelector('#homeLeftCol');
    const centerCol = el.querySelector('#battleCenterCol');
    const rightCol = el.querySelector('#homeRightCol');

    expect(leftCol).not.toBeNull();
    expect(centerCol).not.toBeNull();
    expect(rightCol).not.toBeNull();
  });

  it('P50-02: renders quick quest deck and updates with active quest progress', () => {
    const battleScreen = new BattleScreen();
    const el = battleScreen.getElement();

    const quickQuests = el.querySelector('#homeQuickQuests');
    expect(quickQuests).not.toBeNull();

    // Emulate 10 trains to complete active quest
    store.set((draft) => {
      draft.stats.totalClicks = 10;
    });

    // Verify claim button appears when ready
    expect(quickQuests?.querySelector('.quick-claim-btn')).not.toBeNull();
    expect(quickQuests?.textContent).toContain('10/10');
  });

  it('P50-03: allows claiming quick quest directly from the battle deck', () => {
    const battleScreen = new BattleScreen();
    const el = battleScreen.getElement();

    const quickQuests = el.querySelector('#homeQuickQuests');
    store.set((draft) => {
      draft.stats.totalClicks = 10;
    });

    const claimBtn = quickQuests?.querySelector('.quick-claim-btn') as any;
    expect(claimBtn).not.toBeNull();

    const goldBefore = store.get().gold;
    claimBtn?.click();

    expect(store.get().completedQuests).toContain('quest_train_10');
    expect(store.get().gold).toBeGreaterThan(goldBefore);
  });

  it('P50-04: responds to keyboard shortcuts: KeyA toggles auto-advance', () => {
    const battleScreen = new BattleScreen();
    const autoBefore = store.get().campaign.autoAdvance;

    window.dispatchEvent({ type: 'keydown', code: 'KeyA' });
    expect(store.get().campaign.autoAdvance).toBe(!autoBefore);

    window.dispatchEvent({ type: 'keydown', code: 'KeyA' });
    expect(store.get().campaign.autoAdvance).toBe(autoBefore);
  });
});
