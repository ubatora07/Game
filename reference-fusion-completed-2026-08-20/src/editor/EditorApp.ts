import { EditorBridge } from './EditorBridge';
import { DraftStore } from './DraftStore';
import { UndoManager } from './UndoManager';
import { ResponsiveToolbar } from './ResponsiveToolbar';
import { ElementTree } from './ElementTree';
import { CanvasOverlay } from './CanvasOverlay';
import { Inspector } from './Inspector';
import { AssetBrowser } from './AssetBrowser';
import { ElementPalette } from './ElementPalette';
import { Exporter } from './Exporter';
import {
  UiElementNode,
  ViewportConfig,
  BreakpointKey,
  EditorMode,
  PreviewStatePreset,
} from './EditorTypes';

export class EditorApp {
  private bridge: EditorBridge;
  private draftStore: DraftStore;
  private undoManager: UndoManager;

  private toolbar: ResponsiveToolbar;
  private elementTree: ElementTree;
  private canvasOverlay: CanvasOverlay;
  private inspector: Inspector;
  private assetBrowser: AssetBrowser;
  private elementPalette: ElementPalette;

  private rootContainer: HTMLElement;
  private previewIframe: HTMLIFrameElement;
  private canvasWrapper: HTMLElement;

  private domTreeRoot: UiElementNode | null = null;
  private selectedElementId: string | null = null;
  private hoveredElementId: string | null = null;
  private currentBreakpoint: BreakpointKey = 'base';
  private currentMode: EditorMode = 'edit';
  private leftSidebarTab: 'tree' | 'assets' = 'tree';
  private currentScreenId: string = 'battle';
  private currentModalId: string | null = null;

  public getLeftSidebarTab(): 'tree' | 'assets' {
    return this.leftSidebarTab;
  }

  public getCurrentMode(): EditorMode {
    return this.currentMode;
  }

  public getHoveredElementId(): string | null {
    return this.hoveredElementId;
  }

  constructor() {
    this.bridge = new EditorBridge();
    this.draftStore = new DraftStore();
    this.undoManager = new UndoManager(100);

    this.toolbar = new ResponsiveToolbar();
    this.elementTree = new ElementTree();
    this.canvasOverlay = new CanvasOverlay();
    this.inspector = new Inspector();
    this.assetBrowser = new AssetBrowser();
    this.elementPalette = new ElementPalette();

    this.rootContainer = document.createElement('div');
    this.previewIframe = document.createElement('iframe');
    this.canvasWrapper = document.createElement('div');
  }

  public async init(): Promise<void> {
    console.log('[EditorApp] Starting Visual UI Editor Host...');

    this.buildLayout();
    this.bindToolbarEvents();
    this.bindTreeEvents();
    this.bindCanvasEvents();
    this.bindInspectorEvents();
    this.bindAssetEvents();
    this.bindPaletteEvents();
    this.bindBridgeEvents();
    this.bindGlobalShortcuts();

    // Load initial draft
    const draft = await this.draftStore.loadDraft(this.currentScreenId);
    this.undoManager.push(draft);
  }

  private buildLayout(): void {
    document.body.style.cssText = 'margin:0; padding:0; background:#040711; overflow:hidden; font-family:sans-serif; color:#f8fafc;';
    const appEl = document.getElementById('editor-root') || document.body;
    appEl.innerHTML = '';

    this.rootContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    `;

    // 1. Top Toolbar
    this.rootContainer.appendChild(this.toolbar.getElement());

    // 2. Main Workspace (3 columns)
    const workspace = document.createElement('div');
    workspace.style.cssText = `
      flex: 1;
      display: flex;
      overflow: hidden;
      position: relative;
    `;

    // 2A. Left Sidebar (Tree / Assets tabs)
    const leftSidebar = document.createElement('aside');
    leftSidebar.style.cssText = `
      width: 280px;
      display: flex;
      flex-direction: column;
      background: #0f172a;
      border-right: 1px solid #1e293b;
      overflow: hidden;
      z-index: 20;
    `;

    const leftTabs = document.createElement('div');
    leftTabs.style.cssText = 'display: flex; background: #090d16; border-bottom: 1px solid #1e293b;';

    const treeTabBtn = document.createElement('button');
    treeTabBtn.textContent = '🌳 Hierarchy';
    treeTabBtn.style.cssText = 'flex:1; padding:8px; background:#0f172a; color:#38bdf8; border:none; border-bottom:2px solid #38bdf8; font-weight:600; font-size:11px; cursor:pointer;';

    const assetTabBtn = document.createElement('button');
    assetTabBtn.textContent = '🖼️ Assets & PNGs';
    assetTabBtn.style.cssText = 'flex:1; padding:8px; background:#090d16; color:#94a3b8; border:none; font-size:11px; cursor:pointer;';

    const tabContentContainer = document.createElement('div');
    tabContentContainer.style.cssText = 'flex: 1; overflow: hidden; display: flex; flex-direction: column;';
    tabContentContainer.appendChild(this.elementTree.getElement());

    treeTabBtn.addEventListener('click', () => {
      this.leftSidebarTab = 'tree';
      treeTabBtn.style.background = '#0f172a';
      treeTabBtn.style.color = '#38bdf8';
      treeTabBtn.style.borderBottom = '2px solid #38bdf8';
      assetTabBtn.style.background = '#090d16';
      assetTabBtn.style.color = '#94a3b8';
      assetTabBtn.style.borderBottom = 'none';
      tabContentContainer.innerHTML = '';
      tabContentContainer.appendChild(this.elementTree.getElement());
    });

    assetTabBtn.addEventListener('click', () => {
      this.leftSidebarTab = 'assets';
      assetTabBtn.style.background = '#0f172a';
      assetTabBtn.style.color = '#38bdf8';
      assetTabBtn.style.borderBottom = '2px solid #38bdf8';
      treeTabBtn.style.background = '#090d16';
      treeTabBtn.style.color = '#94a3b8';
      treeTabBtn.style.borderBottom = 'none';
      tabContentContainer.innerHTML = '';
      tabContentContainer.appendChild(this.assetBrowser.getElement());
    });

    leftTabs.appendChild(treeTabBtn);
    leftTabs.appendChild(assetTabBtn);
    leftSidebar.appendChild(leftTabs);
    leftSidebar.appendChild(tabContentContainer);
    leftSidebar.appendChild(this.elementPalette.getElement());
    workspace.appendChild(leftSidebar);

    // 2B. Center Canvas
    const canvasArea = document.createElement('main');
    canvasArea.style.cssText = `
      flex: 1;
      background: #02040a;
      background-image: radial-gradient(#1e293b 1px, transparent 1px);
      background-size: 20px 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: auto;
      padding: 32px;
    `;

    this.canvasWrapper.style.cssText = `
      position: relative;
      width: 1280px;
      height: 720px;
      background: #040711;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px #334155;
      transform-origin: center center;
      transition: width 0.2s, height 0.2s;
    `;

    this.previewIframe.src = '/preview.html';
    this.previewIframe.style.cssText = 'width: 100%; height: 100%; border: none; display: block;';
    this.canvasWrapper.appendChild(this.previewIframe);
    this.canvasWrapper.appendChild(this.canvasOverlay.getElement());
    canvasArea.appendChild(this.canvasWrapper);
    workspace.appendChild(canvasArea);

    // 2C. Right Sidebar (Inspector)
    const rightSidebar = document.createElement('aside');
    rightSidebar.style.cssText = `
      width: 320px;
      display: flex;
      flex-direction: column;
      background: #0f172a;
      border-left: 1px solid #1e293b;
      overflow: hidden;
      z-index: 20;
    `;
    rightSidebar.appendChild(this.inspector.getElement());
    workspace.appendChild(rightSidebar);

    this.rootContainer.appendChild(workspace);
    appEl.appendChild(this.rootContainer);

    this.bridge.bindIframe(this.previewIframe);
  }

  private bindToolbarEvents(): void {
    this.toolbar.onScreenChange(async (screenId) => {
      this.currentScreenId = screenId;
      this.selectedElementId = null;
      this.canvasOverlay.updateSelected(null, null);
      this.inspector.inspect(null, null);

      const draft = await this.draftStore.loadDraft(screenId, this.currentModalId || undefined);
      this.undoManager.push(draft);
      this.bridge.send({ type: 'SWITCH_SCREEN', screenId, modalId: this.currentModalId || undefined });
      this.bridge.send({ type: 'APPLY_DRAFT', draft, breakpoint: this.currentBreakpoint });
    });

    this.toolbar.onModalChange(async (modalId) => {
      this.currentModalId = modalId;
      this.selectedElementId = null;
      this.canvasOverlay.updateSelected(null, null);
      this.inspector.inspect(null, null);

      const draft = await this.draftStore.loadDraft(this.currentScreenId, modalId || undefined);
      this.undoManager.push(draft);
      this.bridge.send({ type: 'SWITCH_SCREEN', screenId: this.currentScreenId, modalId: modalId || undefined });
      this.bridge.send({ type: 'APPLY_DRAFT', draft, breakpoint: this.currentBreakpoint });
    });

    this.toolbar.onStateChange((preset: PreviewStatePreset) => {
      this.bridge.send({ type: 'SET_STATE_PRESET', preset });
    });

    this.toolbar.onViewportChange((config: ViewportConfig, breakpoint: BreakpointKey) => {
      this.currentBreakpoint = breakpoint;
      this.canvasWrapper.style.width = `${config.width}px`;
      this.canvasWrapper.style.height = `${config.height}px`;
      this.canvasWrapper.style.transform = `scale(${config.zoom})`;
      this.canvasOverlay.setZoom(config.zoom);
      this.canvasOverlay.setSafeAreaVisible(config.showSafeArea);
      this.bridge.send({ type: 'APPLY_DRAFT', draft: this.draftStore.getDraft(), breakpoint });
    });

    this.toolbar.onModeChange((mode: EditorMode) => {
      this.currentMode = mode;
      this.bridge.send({ type: 'SET_MODE', mode });
    });

    this.toolbar.onCompareChange((mode) => {
      if (mode === 'original') {
        const emptyDraft = this.draftStore.createEmptyDraft(this.currentScreenId, this.currentModalId || undefined);
        this.bridge.send({ type: 'APPLY_DRAFT', draft: emptyDraft, breakpoint: this.currentBreakpoint });
      } else {
        this.bridge.send({ type: 'APPLY_DRAFT', draft: this.draftStore.getDraft(), breakpoint: this.currentBreakpoint });
      }
    });

    this.toolbar.onPauseChange((paused) => {
      this.bridge.send({ type: 'SET_ANIMATIONS_PAUSED', paused });
      this.bridge.send({ type: 'FREEZE_COMBAT', freeze: paused });
    });

    this.toolbar.onGridChange((size) => {
      this.canvasOverlay.setGrid(size, size > 0);
    });

    this.toolbar.onUndo(() => this.handleUndo());
    this.toolbar.onRedo(() => this.handleRedo());
    this.toolbar.onSave(() => this.draftStore.saveDraft());
    this.toolbar.onExport(() => this.handleExport());

    this.draftStore.subscribe((draft, isDirty) => {
      this.toolbar.setDirtyState(isDirty);
      this.toolbar.setUndoRedoState(this.undoManager.canUndo(), this.undoManager.canRedo());
      this.bridge.send({ type: 'APPLY_DRAFT', draft, breakpoint: this.currentBreakpoint });
      if (this.domTreeRoot) {
        this.elementTree.updateTree(this.domTreeRoot, draft);
      }
      if (this.selectedElementId) {
        const node = this.findNodeById(this.domTreeRoot, this.selectedElementId);
        const override = draft.elements[this.selectedElementId] || null;
        this.inspector.inspect(node, override, this.currentBreakpoint);
      }
    });
  }

  private bindTreeEvents(): void {
    this.elementTree.onSelect((elementId) => {
      this.selectElement(elementId);
    });

    this.elementTree.onHover((elementId) => {
      this.hoveredElementId = elementId;
      this.bridge.send({ type: 'HOVER_ELEMENT', elementId });
      const node = elementId ? this.findNodeById(this.domTreeRoot, elementId) : null;
      this.canvasOverlay.updateHovered(node ? node.rect : null);
    });

    this.elementTree.onToggleVisibility((elementId) => {
      this.draftStore.toggleElementVisibility(elementId);
    });

    this.elementTree.onToggleLock((elementId) => {
      const isLocked = this.draftStore.toggleElementLock(elementId);
      const node = this.findNodeById(this.domTreeRoot, elementId);
      if (this.selectedElementId === elementId) {
        this.canvasOverlay.updateSelected(elementId, node?.rect || null, isLocked);
      }
    });
  }

  private bindCanvasEvents(): void {
    this.canvasOverlay.onDrag((ev) => {
      if (ev.isFinished) {
        this.draftStore.updateElementStyle(
          ev.elementId,
          {
            position: 'relative',
            transform: `translate(${Math.round(ev.deltaX)}px, ${Math.round(ev.deltaY)}px)`,
          },
          this.currentBreakpoint
        );
        this.undoManager.push(this.draftStore.getDraft());
      }
    });

    this.canvasOverlay.onResize((ev) => {
      if (ev.isFinished) {
        this.draftStore.updateElementStyle(
          ev.elementId,
          {
            width: `${Math.round(ev.newRect.width)}px`,
            height: `${Math.round(ev.newRect.height)}px`,
          },
          this.currentBreakpoint
        );
        this.undoManager.push(this.draftStore.getDraft());
      }
    });

    this.canvasOverlay.onAlign((type) => {
      if (!this.selectedElementId) return;
      const node = this.findNodeById(this.domTreeRoot, this.selectedElementId);
      if (!node) return;

      if (type === 'align_left') {
        this.draftStore.updateElementStyle(this.selectedElementId, { marginLeft: '0px', marginRight: 'auto' }, this.currentBreakpoint);
      } else if (type === 'align_center_x') {
        this.draftStore.updateElementStyle(this.selectedElementId, { marginLeft: 'auto', marginRight: 'auto' }, this.currentBreakpoint);
      } else if (type === 'align_top') {
        this.draftStore.updateElementStyle(this.selectedElementId, { marginTop: '0px' }, this.currentBreakpoint);
      } else if (type === 'align_center_y') {
        this.draftStore.updateElementStyle(this.selectedElementId, { marginTop: 'auto', marginBottom: 'auto' }, this.currentBreakpoint);
      }
      this.undoManager.push(this.draftStore.getDraft());
    });

    this.canvasOverlay.onReset(() => {
      if (this.selectedElementId) {
        this.draftStore.resetElement(this.selectedElementId);
        this.undoManager.push(this.draftStore.getDraft());
      }
    });

    this.canvasOverlay.onToggleHide(() => {
      if (this.selectedElementId) {
        this.draftStore.toggleElementVisibility(this.selectedElementId);
        this.undoManager.push(this.draftStore.getDraft());
      }
    });
  }

  private bindInspectorEvents(): void {
    this.inspector.onChange((payload) => {
      this.draftStore.updateElementOverride(payload.elementId, (prev) => {
        let next = { ...prev };
        if (payload.overrideProps) {
          next = { ...next, ...payload.overrideProps };
        }
        if (payload.styles && Object.keys(payload.styles).length > 0) {
          if (payload.breakpoint === 'base') {
            next.base = { ...next.base, ...payload.styles };
          } else if (payload.breakpoint === 'tablet') {
            next.tablet = { ...(next.tablet || {}), ...payload.styles };
          } else {
            next.mobile = { ...(next.mobile || {}), ...payload.styles };
          }
        }
        return next;
      });
    });

    this.inspector.onReset((elementId) => {
      this.draftStore.resetElement(elementId);
      this.undoManager.push(this.draftStore.getDraft());
    });

    this.inspector.onHide((elementId) => {
      this.draftStore.toggleElementVisibility(elementId);
      this.undoManager.push(this.draftStore.getDraft());
    });

    this.inspector.onOpenAssetBrowser(() => {
      this.openAssetTab();
    });
  }

  private bindAssetEvents(): void {
    this.assetBrowser.onSelectAsset((asset) => {
      if (this.selectedElementId) {
        this.draftStore.updateElementOverride(this.selectedElementId, (prev) => ({
          ...prev,
          assetPath: asset.relativePath,
        }));
        this.undoManager.push(this.draftStore.getDraft());
      }
    });

    this.assetBrowser.onReferenceChange((config) => {
      this.canvasOverlay.setReferenceOverlay(config);
      const draft = this.draftStore.getDraft();
      draft.referenceOverlay = config;
      this.draftStore.setDraft(draft, true);
    });
  }

  private bindPaletteEvents(): void {
    this.elementPalette.onAddElement((def) => {
      const designId = `design_${def.type}_${Date.now()}`;
      this.draftStore.updateElementOverride(designId, () => ({
        id: designId,
        tagName: def.type === 'button' ? 'button' : def.type === 'image' ? 'img' : 'div',
        name: def.name,
        isDesignOnly: true,
        base: {
          width: def.defaultWidth,
          height: def.defaultHeight,
          customText: def.defaultText,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px dashed #3b82f6',
          borderRadius: '4px',
        },
      }));
      this.undoManager.push(this.draftStore.getDraft());
      this.selectElement(designId);
    });
  }

  private bindBridgeEvents(): void {
    this.bridge.onMessage((msg) => {
      switch (msg.type) {
        case 'PREVIEW_READY':
          this.bridge.send({
            type: 'INIT_PREVIEW',
            screenId: this.currentScreenId,
            modalId: this.currentModalId || undefined,
            statePreset: 'mock_normal',
          });
          this.bridge.send({
            type: 'APPLY_DRAFT',
            draft: this.draftStore.getDraft(),
            breakpoint: this.currentBreakpoint,
          });
          break;

        case 'DOM_TREE_UPDATED':
          this.domTreeRoot = msg.rootNode;
          this.elementTree.updateTree(msg.rootNode, this.draftStore.getDraft());
          if (this.selectedElementId) {
            const node = this.findNodeById(msg.rootNode, this.selectedElementId);
            if (node) {
              const override = this.draftStore.getDraft().elements[this.selectedElementId];
              this.canvasOverlay.updateSelected(this.selectedElementId, node.rect, override?.locked, override?.hidden);
              this.inspector.inspect(node, override || null, this.currentBreakpoint);
            }
          }
          break;

        case 'ELEMENT_CLICKED':
          this.selectElement(msg.elementId);
          break;

        case 'ELEMENT_HOVERED':
          this.elementTree.setHoveredElement(msg.elementId);
          break;
      }
    });
  }

  private selectElement(elementId: string | null): void {
    this.selectedElementId = elementId;
    this.elementTree.setSelectedElement(elementId);
    this.bridge.send({ type: 'SELECT_ELEMENT', elementId });

    if (!elementId) {
      this.canvasOverlay.updateSelected(null, null);
      this.inspector.inspect(null, null);
      return;
    }

    const node = this.findNodeById(this.domTreeRoot, elementId);
    const override = this.draftStore.getDraft().elements[elementId] || null;

    if (node) {
      this.canvasOverlay.updateSelected(elementId, node.rect, override?.locked, override?.hidden);
      this.inspector.inspect(node, override, this.currentBreakpoint);
    } else {
      this.canvasOverlay.updateSelected(elementId, null, override?.locked, override?.hidden);
      this.inspector.inspect(null, override, this.currentBreakpoint);
    }
  }

  private findNodeById(node: UiElementNode | null, id: string): UiElementNode | null {
    if (!node) return null;
    if (node.id === id || node.uiId === id) return node;
    for (const child of node.children) {
      const found = this.findNodeById(child, id);
      if (found) return found;
    }
    return null;
  }

  private openAssetTab(): void {
    // Switch left sidebar to assets tab
    const tabs = this.rootContainer.querySelectorAll('aside button');
    if (tabs.length >= 2) {
      (tabs[1] as HTMLElement).click();
    }
  }

  private handleUndo(): void {
    const prev = this.undoManager.undo(this.draftStore.getDraft());
    if (prev) {
      this.draftStore.setDraft(prev, true);
    }
  }

  private handleRedo(): void {
    const next = this.undoManager.redo(this.draftStore.getDraft());
    if (next) {
      this.draftStore.setDraft(next, true);
    }
  }

  private async handleExport(): Promise<void> {
    const draft = this.draftStore.getDraft();
    const pkg = Exporter.generateExportPackage(draft);
    await Exporter.exportToDevServer(pkg);

    // Show confirmation modal dialog
    this.showExportModal(pkg);
  }

  private showExportModal(pkg: any): void {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      width: 600px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8);
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    card.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between;">
        <div style="font-weight: 700; font-size: 15px; color: #fde047;">🚀 AI EXPORT PACKAGE READY</div>
        <button id="closeModalBtn" style="background:none; border:none; color:#94a3b8; font-size:16px; cursor:pointer;">✕</button>
      </div>
      <div style="padding: 16px; overflow-y: auto; font-size: 12px; line-height: 1.5; color: #cbd5e1;">
        <p>The layout specification has been exported to <code>.editor/exports/${pkg.screenId}/</code>:</p>
        <ul style="margin: 8px 0; padding-left: 20px; color: #93c5fd;">
          <li><code>layout.json</code> — CSS diffs & style overrides</li>
          <li><code>elements.json</code> — Node selectors & component mapping</li>
          <li><code>notes.md</code> — Design guidelines & element instructions</li>
          <li><code>assets.json</code> — Used & missing asset requirements</li>
          <li><code>changes.md</code> — Human-readable changelog</li>
          <li><code>source-map.json</code> — Target source files mapping</li>
          <li><code>AI_TASK.md</code> — Complete implementation prompt for AI</li>
        </ul>
        <div style="margin-top: 12px; font-weight: 600; color: #f8fafc;">Prompt for AI:</div>
        <textarea readonly style="width: 100%; box-sizing: border-box; height: 160px; background: #02040a; border: 1px solid #334155; border-radius: 4px; padding: 8px; color: #94a3b8; font-family: monospace; font-size: 11px; margin-top: 4px;">${pkg.aiTaskMd}</textarea>
      </div>
      <div style="padding: 12px 16px; border-top: 1px solid #1e293b; display: flex; justify-content: flex-end; gap: 8px;">
        <button id="copyPromptBtn" style="background: #2563eb; color: #ffffff; border: none; border-radius: 4px; padding: 6px 12px; font-size: 11px; font-weight: 600; cursor: pointer;">📋 Copy AI Task Prompt</button>
        <button id="dismissModalBtn" style="background: #334155; color: #cbd5e1; border: none; border-radius: 4px; padding: 6px 12px; font-size: 11px; cursor: pointer;">Close</button>
      </div>
    `;

    modal.appendChild(card);
    document.body.appendChild(modal);

    const close = () => document.body.removeChild(modal);
    card.querySelector('#closeModalBtn')?.addEventListener('click', close);
    card.querySelector('#dismissModalBtn')?.addEventListener('click', close);
    card.querySelector('#copyPromptBtn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(pkg.aiTaskMd);
      const btn = card.querySelector('#copyPromptBtn') as HTMLButtonElement;
      if (btn) btn.textContent = '✅ Copied!';
    });
  }

  private bindGlobalShortcuts(): void {
    window.addEventListener('keydown', (e) => {
      const isInput = ['input', 'textarea'].includes((document.activeElement?.tagName || '').toLowerCase());

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.draftStore.saveDraft();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          this.handleRedo();
        } else {
          this.handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.handleRedo();
      } else if (e.key === 'Escape') {
        this.selectElement(null);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput && this.selectedElementId) {
        e.preventDefault();
        this.draftStore.toggleElementVisibility(this.selectedElementId);
        this.undoManager.push(this.draftStore.getDraft());
      }
    });
  }
}
