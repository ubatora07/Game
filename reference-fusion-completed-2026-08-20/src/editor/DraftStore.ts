import { ScreenLayoutDraft, ElementOverride, StyleOverride, BreakpointKey } from './EditorTypes';

export class DraftStore {
  private currentDraft: ScreenLayoutDraft | null = null;
  private isDirty: boolean = false;
  private autoSaveTimeout: number | null = null;
  private onStateChangeListeners: Set<(draft: ScreenLayoutDraft, isDirty: boolean) => void> = new Set();

  public createEmptyDraft(screenId: string, modalId?: string): ScreenLayoutDraft {
    const now = new Date().toISOString();
    return {
      schemaVersion: 1,
      screenId,
      modalId,
      screenNotes: '',
      createdAt: now,
      updatedAt: now,
      elements: {},
    };
  }

  public getDraft(): ScreenLayoutDraft {
    if (!this.currentDraft) {
      this.currentDraft = this.createEmptyDraft('battle');
    }
    return this.currentDraft;
  }

  public setDraft(draft: ScreenLayoutDraft, markDirty: boolean = false): void {
    this.currentDraft = draft;
    this.isDirty = markDirty;
    this.notify();
    if (markDirty) {
      this.scheduleAutoSave();
    }
  }

  public async loadDraft(screenId: string, modalId?: string): Promise<ScreenLayoutDraft> {
    const draftKey = this.getStorageKey(screenId, modalId);

    // 1. Try local storage first
    try {
      const stored = localStorage.getItem(draftKey);
      if (stored) {
        const parsed = JSON.parse(stored) as ScreenLayoutDraft;
        this.setDraft(parsed, false);
        return parsed;
      }
    } catch (e) {
      console.warn('[DraftStore] Failed to read from localStorage:', e);
    }

    // 2. Try dev API
    try {
      const query = new URLSearchParams({ screenId, ...(modalId ? { modalId } : {}) });
      const res = await fetch(`/__editor-api/layout/load?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.elements) {
          this.setDraft(data, false);
          return data;
        }
      }
    } catch (e) {
      // Dev API might not be running in tests
    }

    // 3. Fallback to empty draft
    const fresh = this.createEmptyDraft(screenId, modalId);
    this.setDraft(fresh, false);
    return fresh;
  }

  public async saveDraft(): Promise<boolean> {
    if (!this.currentDraft) return false;

    this.currentDraft.updatedAt = new Date().toISOString();
    const draftKey = this.getStorageKey(this.currentDraft.screenId, this.currentDraft.modalId);
    const serialized = JSON.stringify(this.currentDraft, null, 2);

    // 1. Save to LocalStorage
    try {
      localStorage.setItem(draftKey, serialized);
    } catch (e) {
      console.error('[DraftStore] Failed to save to localStorage:', e);
    }

    // 2. Save to dev API / filesystem (.editor/layouts/)
    try {
      await fetch('/__editor-api/layout/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serialized,
      });
    } catch (e) {
      // Dev API might be offline
    }

    this.isDirty = false;
    this.notify();
    return true;
  }

  public updateElementOverride(
    elementId: string,
    updater: (prev: ElementOverride) => ElementOverride
  ): ScreenLayoutDraft {
    const draft = this.getDraft();
    const existing = draft.elements[elementId] || {
      id: elementId,
      tagName: 'div',
      base: {},
    };

    const updated = updater(existing);
    draft.elements[elementId] = updated;
    this.setDraft(draft, true);
    return draft;
  }

  public updateElementStyle(
    elementId: string,
    styles: Partial<StyleOverride>,
    breakpoint: BreakpointKey = 'base'
  ): ScreenLayoutDraft {
    return this.updateElementOverride(elementId, (prev) => {
      if (breakpoint === 'base') {
        return {
          ...prev,
          base: { ...prev.base, ...styles },
        };
      } else if (breakpoint === 'tablet') {
        return {
          ...prev,
          tablet: { ...(prev.tablet || {}), ...styles },
        };
      } else {
        return {
          ...prev,
          mobile: { ...(prev.mobile || {}), ...styles },
        };
      }
    });
  }

  public toggleElementVisibility(elementId: string): boolean {
    let nowHidden = false;
    this.updateElementOverride(elementId, (prev) => {
      nowHidden = !prev.hidden;
      return { ...prev, hidden: nowHidden };
    });
    return nowHidden;
  }

  public toggleElementLock(elementId: string): boolean {
    let nowLocked = false;
    this.updateElementOverride(elementId, (prev) => {
      nowLocked = !prev.locked;
      return { ...prev, locked: nowLocked };
    });
    return nowLocked;
  }

  public resetElement(elementId: string): void {
    const draft = this.getDraft();
    if (draft.elements[elementId]) {
      delete draft.elements[elementId];
      this.setDraft(draft, true);
    }
  }

  public resetScreenDraft(): void {
    if (!this.currentDraft) return;
    const fresh = this.createEmptyDraft(this.currentDraft.screenId, this.currentDraft.modalId);
    this.setDraft(fresh, true);
  }

  public getIsDirty(): boolean {
    return this.isDirty;
  }

  public subscribe(listener: (draft: ScreenLayoutDraft, isDirty: boolean) => void): () => void {
    this.onStateChangeListeners.add(listener);
    return () => this.onStateChangeListeners.delete(listener);
  }

  private scheduleAutoSave(): void {
    if (this.autoSaveTimeout !== null) {
      globalThis.clearTimeout(this.autoSaveTimeout);
    }
    this.autoSaveTimeout = Number(globalThis.setTimeout(() => {
      this.saveDraft();
    }, 750));
  }

  private notify(): void {
    if (this.currentDraft) {
      this.onStateChangeListeners.forEach((l) => l(this.currentDraft!, this.isDirty));
    }
  }

  private getStorageKey(screenId: string, modalId?: string): string {
    return `editor_draft_${screenId}${modalId ? `_${modalId}` : ''}`;
  }
}
