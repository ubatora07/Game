import { ScreenLayoutDraft } from './EditorTypes';

export class UndoManager {
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private maxHistory: number = 100;
  private onChangeListeners: Set<() => void> = new Set();

  constructor(maxHistory: number = 100) {
    this.maxHistory = maxHistory;
  }

  public push(draft: ScreenLayoutDraft): void {
    const serialized = JSON.stringify(draft);
    // Don't push identical consecutive states
    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === serialized) {
      return;
    }
    this.undoStack.push(serialized);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = [];
    this.notify();
  }

  public undo(currentDraft: ScreenLayoutDraft): ScreenLayoutDraft | null {
    if (this.undoStack.length === 0) return null;

    const currentSerialized = JSON.stringify(currentDraft);
    // If top of undo stack is the current state, pop it first
    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === currentSerialized) {
      this.undoStack.pop();
    }

    if (this.undoStack.length === 0) return null;

    this.redoStack.push(currentSerialized);
    const previousSerialized = this.undoStack.pop()!;
    this.notify();
    return JSON.parse(previousSerialized) as ScreenLayoutDraft;
  }

  public redo(currentDraft: ScreenLayoutDraft): ScreenLayoutDraft | null {
    if (this.redoStack.length === 0) return null;

    const currentSerialized = JSON.stringify(currentDraft);
    this.undoStack.push(currentSerialized);

    const nextSerialized = this.redoStack.pop()!;
    this.notify();
    return JSON.parse(nextSerialized) as ScreenLayoutDraft;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.onChangeListeners.add(listener);
    return () => this.onChangeListeners.delete(listener);
  }

  private notify(): void {
    this.onChangeListeners.forEach((l) => l());
  }
}
