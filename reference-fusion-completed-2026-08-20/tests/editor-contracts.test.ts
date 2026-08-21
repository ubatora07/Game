import { describe, it, expect, beforeEach } from 'vitest';
import { DraftStore } from '../src/editor/DraftStore';
import { UndoManager } from '../src/editor/UndoManager';
import { Exporter } from '../src/editor/Exporter';
import { createMockStatePreset } from '../src/editor/preview/MockStatePresets';
import { ScreenLayoutDraft } from '../src/editor/EditorTypes';

describe('Visual UI Editor — Contracts & Core Engine', () => {
  let draftStore: DraftStore;
  let undoManager: UndoManager;

  beforeEach(() => {
    draftStore = new DraftStore();
    undoManager = new UndoManager(50);
  });

  describe('1. Mock State Presets', () => {
    it('generates valid, isolated state snapshots for all presets', () => {
      const presets = ['real_snapshot', 'mock_normal', 'mock_rich', 'mock_boss', 'mock_empty', 'mock_maxed'] as const;

      presets.forEach((preset) => {
        const state = createMockStatePreset(preset);
        expect(state).toBeDefined();
        expect(state.version).toBe(7);
        expect(typeof state.power).toBe('number');
        expect(typeof state.gold).toBe('number');
        expect(state.campaign).toBeDefined();
      });

      const empty = createMockStatePreset('mock_empty');
      expect(empty.power).toBe(0);
      expect(empty.gold).toBe(0);

      const rich = createMockStatePreset('mock_rich');
      expect(rich.gold).toBeGreaterThan(100000000);
      expect(rich.rankId).toBe('S');

      const maxed = createMockStatePreset('mock_maxed');
      expect(maxed.rankId).toBe('IMMORTAL');
    });
  });

  describe('2. DraftStore & Style Overrides', () => {
    it('creates and manages empty screen drafts', () => {
      const draft = draftStore.createEmptyDraft('battle');
      expect(draft.schemaVersion).toBe(1);
      expect(draft.screenId).toBe('battle');
      expect(draft.elements).toEqual({});
      expect(draftStore.getIsDirty()).toBe(false);
    });

    it('updates element base and responsive overrides independently', () => {
      draftStore.setDraft(draftStore.createEmptyDraft('battle'));

      draftStore.updateElementStyle('battlefield.heroes', { width: '400px', height: '250px' }, 'base');
      expect(draftStore.getIsDirty()).toBe(true);

      let draft = draftStore.getDraft();
      expect(draft.elements['battlefield.heroes'].base.width).toBe('400px');
      expect(draft.elements['battlefield.heroes'].base.height).toBe('250px');

      // Update mobile override
      draftStore.updateElementStyle('battlefield.heroes', { width: '100%', height: '180px' }, 'mobile');
      draft = draftStore.getDraft();
      expect(draft.elements['battlefield.heroes'].base.width).toBe('400px');
      expect(draft.elements['battlefield.heroes'].mobile?.width).toBe('100%');
      expect(draft.elements['battlefield.heroes'].mobile?.height).toBe('180px');
    });

    it('toggles visibility and locking state', () => {
      draftStore.setDraft(draftStore.createEmptyDraft('hero'));

      const isHidden = draftStore.toggleElementVisibility('hero.stats');
      expect(isHidden).toBe(true);
      expect(draftStore.getDraft().elements['hero.stats'].hidden).toBe(true);

      const isHiddenNow = draftStore.toggleElementVisibility('hero.stats');
      expect(isHiddenNow).toBe(false);
      expect(draftStore.getDraft().elements['hero.stats'].hidden).toBe(false);

      const isLocked = draftStore.toggleElementLock('hero.portrait');
      expect(isLocked).toBe(true);
      expect(draftStore.getDraft().elements['hero.portrait'].locked).toBe(true);
    });

    it('resets a single element or the whole draft', () => {
      draftStore.setDraft(draftStore.createEmptyDraft('world'));
      draftStore.updateElementStyle('world.map', { opacity: '0.8' });
      draftStore.updateElementStyle('world.nodes', { display: 'grid' });

      expect(Object.keys(draftStore.getDraft().elements).length).toBe(2);

      draftStore.resetElement('world.map');
      expect(draftStore.getDraft().elements['world.map']).toBeUndefined();
      expect(draftStore.getDraft().elements['world.nodes']).toBeDefined();

      draftStore.resetScreenDraft();
      expect(Object.keys(draftStore.getDraft().elements).length).toBe(0);
    });
  });

  describe('3. UndoManager', () => {
    it('pushes, undoes, and redoes draft states accurately', () => {
      const d1: ScreenLayoutDraft = {
        schemaVersion: 1,
        screenId: 'battle',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        elements: { a: { id: 'a', tagName: 'div', base: { width: '100px' } } },
      };

      const d2: ScreenLayoutDraft = {
        schemaVersion: 1,
        screenId: 'battle',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        elements: { a: { id: 'a', tagName: 'div', base: { width: '200px' } } },
      };

      undoManager.push(d1);
      undoManager.push(d2);

      expect(undoManager.canUndo()).toBe(true);
      expect(undoManager.canRedo()).toBe(false);

      const undone = undoManager.undo(d2);
      expect(undone?.elements['a'].base.width).toBe('100px');
      expect(undoManager.canRedo()).toBe(true);

      const redone = undoManager.redo(undone!);
      expect(redone?.elements['a'].base.width).toBe('200px');
    });
  });

  describe('4. Exporter Engine', () => {
    it('generates complete AI specification bundle with asset requirements', () => {
      const draft: ScreenLayoutDraft = {
        schemaVersion: 1,
        screenId: 'battle',
        screenNotes: 'Enhance hero stage layout for mobile landscape.',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
        elements: {
          'battle.hero_stage': {
            id: 'battle.hero_stage',
            tagName: 'div',
            name: 'Hero Stage Container',
            aiNote: 'Center align heroes and add glowing background aura.',
            base: {
              width: '600px',
              height: '300px',
              position: 'relative',
            },
            mobile: {
              width: '100%',
              height: '220px',
            },
          },
          'battle.boss_sprite': {
            id: 'battle.boss_sprite',
            tagName: 'img',
            name: 'World Boss Sprite',
            needsAsset: true,
            aiNote: 'Generate new dark dragon sprite.',
            targetAssetDimensions: {
              cssWidth: 120,
              cssHeight: 120,
              recommendedSourceWidth: 240,
              recommendedSourceHeight: 240,
            },
            base: {
              width: '120px',
              height: '120px',
            },
          },
        },
      };

      const pkg = Exporter.generateExportPackage(draft);

      expect(pkg.screenId).toBe('battle');
      expect(pkg.elementsJson.length).toBe(2);
      expect(pkg.notesMd).toContain('Enhance hero stage layout');
      expect(pkg.notesMd).toContain('Center align heroes');
      expect(pkg.changesMd).toContain('battle.hero_stage');
      expect(pkg.changesMd).toContain('battle.boss_sprite');
      expect(pkg.aiTaskMd).toContain('# AI Implementation Task: Update BATTLE UI');
      expect(pkg.assetsJson.missingAssetTasks.length).toBe(1);
      expect(pkg.assetsJson.missingAssetTasks[0].dimensions).toContain('240x240 px');
      expect(pkg.sourceMapJson['battle.hero_stage'].suggestedFile).toBe('src/ui/screens/BattleScreen.ts');
    });
  });
});
