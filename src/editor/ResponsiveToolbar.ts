import { DevicePresetId, ViewportConfig, BreakpointKey, EditorMode, PreviewStatePreset } from './EditorTypes';

export interface DevicePresetDefinition {
  id: DevicePresetId;
  label: string;
  width: number;
  height: number;
  breakpoint: BreakpointKey;
}

export const DEVICE_PRESETS: DevicePresetDefinition[] = [
  { id: 'desktop_fhd', label: '🖥️ Desktop FHD (1920 × 1080)', width: 1920, height: 1080, breakpoint: 'base' },
  { id: 'desktop_hd', label: '💻 Desktop HD (1280 × 720)', width: 1280, height: 720, breakpoint: 'base' },
  { id: 'tablet', label: '📱 Tablet (768 × 1024)', width: 768, height: 1024, breakpoint: 'tablet' },
  { id: 'mobile_iphone', label: '📱 iPhone (390 × 844)', width: 390, height: 844, breakpoint: 'mobile' },
  { id: 'mobile_android', label: '📱 Android (412 × 915)', width: 412, height: 915, breakpoint: 'mobile' },
];

export class ResponsiveToolbar {
  private container: HTMLElement;
  private screenSelect: HTMLSelectElement;
  private modalSelect: HTMLSelectElement;
  private stateSelect: HTMLSelectElement;
  private deviceSelect: HTMLSelectElement;
  private zoomSelect: HTMLSelectElement;
  private gridSelect: HTMLSelectElement;
  private modeBtn: HTMLButtonElement;
  private compareBtn: HTMLButtonElement;
  private pauseBtn: HTMLButtonElement;
  private undoBtn: HTMLButtonElement;
  private redoBtn: HTMLButtonElement;
  private saveBtn: HTMLButtonElement;
  private exportBtn: HTMLButtonElement;
  private dirtyIndicator: HTMLElement;

  private currentViewport: ViewportConfig = {
    width: 1280,
    height: 720,
    label: 'Desktop HD',
    preset: 'desktop_hd',
    orientation: 'landscape',
    showSafeArea: false,
    zoom: 1.0,
  };

  private currentMode: EditorMode = 'edit';
  private compareMode: 'edited' | 'original' | 'split' = 'edited';
  private isPaused: boolean = false;

  // Callbacks
  private onScreenChangeCallback: ((screenId: string) => void) | null = null;
  private onModalChangeCallback: ((modalId: string | null) => void) | null = null;
  private onStateChangeCallback: ((preset: PreviewStatePreset) => void) | null = null;
  private onViewportChangeCallback: ((config: ViewportConfig, breakpoint: BreakpointKey) => void) | null = null;
  private onModeChangeCallback: ((mode: EditorMode) => void) | null = null;
  private onCompareChangeCallback: ((mode: 'edited' | 'original' | 'split') => void) | null = null;
  private onPauseChangeCallback: ((paused: boolean) => void) | null = null;
  private onGridChangeCallback: ((size: number) => void) | null = null;
  private onUndoCallback: (() => void) | null = null;
  private onRedoCallback: (() => void) | null = null;
  private onSaveCallback: (() => void) | null = null;
  private onExportCallback: (() => void) | null = null;

  constructor() {
    this.container = document.createElement('header');
    this.container.className = 'editor-top-toolbar';
    this.container.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 44px;
      padding: 0 12px;
      background: #090d16;
      border-bottom: 1px solid #1e293b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      color: #cbd5e1;
      user-select: none;
      z-index: 100;
    `;

    // Left group: Screen & Modal & State selectors
    const leftGroup = document.createElement('div');
    leftGroup.style.cssText = 'display: flex; align-items: center; gap: 8px;';

    const logo = document.createElement('div');
    logo.style.cssText = 'font-weight: 800; font-size: 13px; color: #fde047; display: flex; align-items: center; gap: 4px;';
    logo.innerHTML = '<span>🥋</span> <span>UI EDITOR</span>';
    leftGroup.appendChild(logo);

    this.screenSelect = this.createSelect([
      { label: '⚔️ Screen: Battle', value: 'battle' },
      { label: '👤 Screen: Hero Hub', value: 'hero' },
      { label: '👥 Screen: Team Hub', value: 'team' },
      { label: '🏰 Screen: Settlement', value: 'settlement' },
      { label: '🗺️ Screen: World Hub', value: 'world' },
      { label: '⛩️ Screen: Sect (Home)', value: 'sect' },
      { label: '⚡ Screen: Ascension', value: 'ascension' },
      { label: '🗼 Screen: Tower', value: 'tower' },
      { label: '🦸 Screen: Heroes', value: 'heroes' },
      { label: '🔮 Screen: Summon', value: 'summon' },
      { label: '🌌 Screen: Soul Tree', value: 'souls' },
      { label: '📜 Screen: Quests', value: 'quests' },
      { label: '🏺 Screen: Relics', value: 'relics' },
      { label: '🧭 Screen: Expeditions', value: 'expeditions' },
      { label: '📅 Screen: Dailies', value: 'dailies' },
    ]);
    this.screenSelect.addEventListener('change', () => {
      this.onScreenChangeCallback?.(this.screenSelect.value);
    });
    leftGroup.appendChild(this.screenSelect);

    this.modalSelect = this.createSelect([
      { label: '🪟 Modal: None (Screen)', value: '' },
      { label: '⚙️ Modal: Settings', value: 'settings' },
      { label: '📊 Modal: Stats', value: 'stats' },
      { label: '🎒 Modal: Inventory', value: 'equipment_inventory' },
      { label: '🔨 Modal: Forge Crafting', value: 'forge_crafting' },
      { label: '✨ Modal: Equipment Evolution', value: 'equipment_evolution' },
      { label: '🐾 Modal: Pet Hub', value: 'pet_modal' },
      { label: '🏪 Modal: Market', value: 'market_modal' },
      { label: '🍻 Modal: Mercenary Guild', value: 'mercenary_guild' },
      { label: '👑 Modal: Title Selection', value: 'title_selection' },
      { label: '📖 Modal: Story & Lore', value: 'settlement_story' },
      { label: '🛡️ Modal: Settlement Raid', value: 'settlement_raid' },
      { label: '🏛️ Modal: Building Inspect', value: 'building_inspection' },
      { label: '💬 Modal: NPC Dialogue', value: 'npc_dialogue' },
      { label: '📜 Modal: Adventure Event', value: 'adventure_event_modal' },
      { label: '🤝 Modal: Partner Awakening', value: 'partner_awakening' },
      { label: '🧙 Modal: Class Selection', value: 'class_selection' },
      { label: '♻️ Modal: Reincarnation', value: 'reincarnate' },
      { label: '📚 Modal: Legacy Codex', value: 'legacy_codex' },
      { label: '🎁 Modal: Offline Reward', value: 'offline_reward' },
      { label: '🎲 Modal: Summon Result', value: 'summon_result' },
    ]);
    this.modalSelect.addEventListener('change', () => {
      this.onModalChangeCallback?.(this.modalSelect.value || null);
    });
    leftGroup.appendChild(this.modalSelect);

    this.stateSelect = this.createSelect([
      { label: '📊 State: Mock Normal', value: 'mock_normal' },
      { label: '💾 State: Real Snapshot', value: 'real_snapshot' },
      { label: '💰 State: Mock Rich', value: 'mock_rich' },
      { label: '👹 State: Mock Boss', value: 'mock_boss' },
      { label: '🌱 State: Mock Empty', value: 'mock_empty' },
      { label: '🌟 State: Mock Maxed', value: 'mock_maxed' },
    ]);
    this.stateSelect.addEventListener('change', () => {
      this.onStateChangeCallback?.(this.stateSelect.value as PreviewStatePreset);
    });
    leftGroup.appendChild(this.stateSelect);

    this.container.appendChild(leftGroup);

    // Center group: Viewport & Canvas Controls
    const centerGroup = document.createElement('div');
    centerGroup.style.cssText = 'display: flex; align-items: center; gap: 6px;';

    this.deviceSelect = this.createSelect(
      DEVICE_PRESETS.map((p) => ({ label: p.label, value: p.id }))
    );
    this.deviceSelect.value = 'desktop_hd';
    this.deviceSelect.addEventListener('change', () => {
      const preset = DEVICE_PRESETS.find((p) => p.id === this.deviceSelect.value);
      if (preset) {
        this.currentViewport.preset = preset.id;
        this.currentViewport.width = preset.width;
        this.currentViewport.height = preset.height;
        this.onViewportChangeCallback?.(this.currentViewport, preset.breakpoint);
      }
    });
    centerGroup.appendChild(this.deviceSelect);

    this.zoomSelect = this.createSelect([
      { label: 'Zoom: 25%', value: '0.25' },
      { label: 'Zoom: 50%', value: '0.5' },
      { label: 'Zoom: 75%', value: '0.75' },
      { label: 'Zoom: 100%', value: '1.0' },
      { label: 'Zoom: 125%', value: '1.25' },
      { label: 'Zoom: 150%', value: '1.5' },
    ]);
    this.zoomSelect.value = '1.0';
    this.zoomSelect.addEventListener('change', () => {
      this.currentViewport.zoom = parseFloat(this.zoomSelect.value);
      const currentPreset = DEVICE_PRESETS.find((p) => p.id === this.currentViewport.preset);
      this.onViewportChangeCallback?.(this.currentViewport, currentPreset?.breakpoint || 'base');
    });
    centerGroup.appendChild(this.zoomSelect);

    this.gridSelect = this.createSelect([
      { label: 'Grid: OFF', value: '0' },
      { label: 'Grid: 4px', value: '4' },
      { label: 'Grid: 8px', value: '8' },
      { label: 'Grid: 16px', value: '16' },
    ]);
    this.gridSelect.addEventListener('change', () => {
      this.onGridChangeCallback?.(parseInt(this.gridSelect.value, 10));
    });
    centerGroup.appendChild(this.gridSelect);

    this.compareBtn = this.createButton('EDITED', () => {
      if (this.compareMode === 'edited') {
        this.compareMode = 'original';
        this.compareBtn.textContent = 'ORIGINAL';
        this.compareBtn.style.color = '#f59e0b';
      } else {
        this.compareMode = 'edited';
        this.compareBtn.textContent = 'EDITED';
        this.compareBtn.style.color = '#38bdf8';
      }
      this.onCompareChangeCallback?.(this.compareMode);
    });
    this.compareBtn.title = 'Toggle comparison between edited draft and original production UI';
    this.compareBtn.style.color = '#38bdf8';
    centerGroup.appendChild(this.compareBtn);

    this.pauseBtn = this.createButton('⏸️ Pause', () => {
      this.isPaused = !this.isPaused;
      this.pauseBtn.textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
      this.onPauseChangeCallback?.(this.isPaused);
    });
    this.pauseBtn.title = 'Freeze game loop / animations to inspect battle layout easily';
    centerGroup.appendChild(this.pauseBtn);

    this.modeBtn = this.createButton('🛠️ EDIT', () => {
      this.currentMode = this.currentMode === 'edit' ? 'preview' : 'edit';
      this.modeBtn.textContent = this.currentMode === 'edit' ? '🛠️ EDIT' : '🎮 PREVIEW';
      this.modeBtn.style.background = this.currentMode === 'edit' ? '#1e293b' : '#059669';
      this.onModeChangeCallback?.(this.currentMode);
    });
    this.modeBtn.title = 'Switch between Design Edit Mode (select/move) and Interactive Game Preview';
    centerGroup.appendChild(this.modeBtn);

    this.container.appendChild(centerGroup);

    // Right group: History, Save, and Export
    const rightGroup = document.createElement('div');
    rightGroup.style.cssText = 'display: flex; align-items: center; gap: 6px;';

    this.undoBtn = this.createButton('↩️', () => this.onUndoCallback?.());
    this.undoBtn.title = 'Undo (Ctrl+Z)';
    rightGroup.appendChild(this.undoBtn);

    this.redoBtn = this.createButton('↪️', () => this.onRedoCallback?.());
    this.redoBtn.title = 'Redo (Ctrl+Shift+Z)';
    rightGroup.appendChild(this.redoBtn);

    this.dirtyIndicator = document.createElement('span');
    this.dirtyIndicator.style.cssText = 'width: 8px; height: 8px; border-radius: 50%; background: #10b981; margin: 0 4px;';
    this.dirtyIndicator.title = 'All changes saved';
    rightGroup.appendChild(this.dirtyIndicator);

    this.saveBtn = this.createButton('💾 Save', () => this.onSaveCallback?.());
    this.saveBtn.title = 'Save Layout Draft (Ctrl+S)';
    rightGroup.appendChild(this.saveBtn);

    this.exportBtn = document.createElement('button');
    this.exportBtn.textContent = '🚀 EXPORT FOR AI';
    this.exportBtn.style.cssText = `
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: #ffffff;
      font-weight: 700;
      font-size: 11px;
      padding: 5px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
      transition: transform 0.1s;
    `;
    this.exportBtn.addEventListener('mouseenter', () => (this.exportBtn.style.transform = 'scale(1.03)'));
    this.exportBtn.addEventListener('mouseleave', () => (this.exportBtn.style.transform = 'scale(1)'));
    this.exportBtn.addEventListener('click', () => this.onExportCallback?.());
    rightGroup.appendChild(this.exportBtn);

    this.container.appendChild(rightGroup);
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setDirtyState(isDirty: boolean): void {
    this.dirtyIndicator.style.background = isDirty ? '#f59e0b' : '#10b981';
    this.dirtyIndicator.title = isDirty ? 'Unsaved changes (auto-saving...)' : 'All changes saved';
  }

  public setUndoRedoState(canUndo: boolean, canRedo: boolean): void {
    this.undoBtn.style.opacity = canUndo ? '1' : '0.4';
    this.redoBtn.style.opacity = canRedo ? '1' : '0.4';
  }

  public setScreen(screenId: string): void {
    this.screenSelect.value = screenId;
  }

  public onScreenChange(cb: (screenId: string) => void): void {
    this.onScreenChangeCallback = cb;
  }

  public onModalChange(cb: (modalId: string | null) => void): void {
    this.onModalChangeCallback = cb;
  }

  public onStateChange(cb: (preset: PreviewStatePreset) => void): void {
    this.onStateChangeCallback = cb;
  }

  public onViewportChange(cb: (config: ViewportConfig, breakpoint: BreakpointKey) => void): void {
    this.onViewportChangeCallback = cb;
  }

  public onModeChange(cb: (mode: EditorMode) => void): void {
    this.onModeChangeCallback = cb;
  }

  public onCompareChange(cb: (mode: 'edited' | 'original' | 'split') => void): void {
    this.onCompareChangeCallback = cb;
  }

  public onPauseChange(cb: (paused: boolean) => void): void {
    this.onPauseChangeCallback = cb;
  }

  public onGridChange(cb: (size: number) => void): void {
    this.onGridChangeCallback = cb;
  }

  public onUndo(cb: () => void): void {
    this.onUndoCallback = cb;
  }

  public onRedo(cb: () => void): void {
    this.onRedoCallback = cb;
  }

  public onSave(cb: () => void): void {
    this.onSaveCallback = cb;
  }

  public onExport(cb: () => void): void {
    this.onExportCallback = cb;
  }

  private createSelect(options: Array<{ label: string; value: string }>): HTMLSelectElement {
    const sel = document.createElement('select');
    sel.style.cssText = `
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 4px;
      padding: 4px 8px;
      color: #f8fafc;
      font-size: 11px;
      outline: none;
      cursor: pointer;
    `;
    options.forEach((opt) => {
      const el = document.createElement('option');
      el.value = opt.value;
      el.textContent = opt.label;
      sel.appendChild(el);
    });
    return sel;
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 4px;
      padding: 4px 8px;
      color: #cbd5e1;
      font-size: 11px;
      cursor: pointer;
      transition: background 0.1s;
    `;
    btn.addEventListener('mouseenter', () => (btn.style.borderColor = '#3b82f6'));
    btn.addEventListener('mouseleave', () => (btn.style.borderColor = '#334155'));
    btn.addEventListener('click', onClick);
    return btn;
  }
}
