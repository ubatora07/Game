import { ElementRect, ReferenceOverlayConfig } from './EditorTypes';

export interface DragTransformEvent {
  elementId: string;
  deltaX: number;
  deltaY: number;
  isFinished: boolean;
}

export interface ResizeTransformEvent {
  elementId: string;
  newRect: ElementRect;
  isFinished: boolean;
}

export class CanvasOverlay {
  private container: HTMLElement;
  private selectionBoxEl: HTMLElement;
  private hoverBoxEl: HTMLElement;
  private guideLinesSvg: SVGSVGElement;
  private rulersContainer: HTMLElement;
  private referenceImgEl: HTMLImageElement;
  private safeAreaEl: HTMLElement;
  private floatingToolbarEl: HTMLElement;

  private selectedRect: ElementRect | null = null;
  private hoveredRect: ElementRect | null = null;
  private selectedElementId: string | null = null;
  private isLocked: boolean = false;
  private isHidden: boolean = false;
  private zoom: number = 1.0;
  private gridSize: number = 0; // 0 = off, 4, 8, 16
  private snapEnabled: boolean = true;
  private referenceConfig: ReferenceOverlayConfig | null = null;

  // Drag & Resize state
  private isDragging: boolean = false;
  private activeResizeHandle: string | null = null;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private initialElementRect: ElementRect | null = null;

  // Callbacks
  private onDragCallback: ((ev: DragTransformEvent) => void) | null = null;
  private onResizeCallback: ((ev: ResizeTransformEvent) => void) | null = null;
  private onAlignCallback: ((type: string) => void) | null = null;
  private onResetCallback: (() => void) | null = null;
  private onToggleHideCallback: (() => void) | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'editor-canvas-overlay';
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: visible;
      z-index: 50;
      user-select: none;
    `;

    // Reference image overlay
    this.referenceImgEl = document.createElement('img');
    this.referenceImgEl.style.cssText = `
      position: absolute;
      pointer-events: none;
      display: none;
      z-index: 5;
    `;
    this.container.appendChild(this.referenceImgEl);

    // Safe area overlay
    this.safeAreaEl = document.createElement('div');
    this.safeAreaEl.style.cssText = `
      position: absolute;
      top: 44px;
      bottom: 34px;
      left: 0;
      right: 0;
      border: 1px dashed rgba(239, 68, 68, 0.4);
      display: none;
      pointer-events: none;
      z-index: 10;
    `;
    this.container.appendChild(this.safeAreaEl);

    // Guide lines SVG
    this.guideLinesSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.guideLinesSvg.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 20;
    `;
    this.container.appendChild(this.guideLinesSvg);

    // Hover box
    this.hoverBoxEl = document.createElement('div');
    this.hoverBoxEl.style.cssText = `
      position: absolute;
      border: 1px dashed #60a5fa;
      background: rgba(96, 165, 250, 0.08);
      pointer-events: none;
      display: none;
      z-index: 30;
      transition: all 0.05s ease;
    `;
    this.container.appendChild(this.hoverBoxEl);

    // Selection box
    this.selectionBoxEl = document.createElement('div');
    this.selectionBoxEl.style.cssText = `
      position: absolute;
      border: 2px solid #3b82f6;
      background: rgba(59, 130, 246, 0.12);
      pointer-events: auto;
      cursor: move;
      display: none;
      z-index: 40;
    `;
    this.setupResizeHandles();
    this.container.appendChild(this.selectionBoxEl);

    // Floating quick toolbar
    this.floatingToolbarEl = document.createElement('div');
    this.floatingToolbarEl.style.cssText = `
      position: absolute;
      display: none;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 4px 6px;
      gap: 4px;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      z-index: 60;
      pointer-events: auto;
    `;
    this.setupFloatingToolbar();
    this.container.appendChild(this.floatingToolbarEl);

    // Rulers container
    this.rulersContainer = document.createElement('div');
    this.rulersContainer.style.cssText = 'position: absolute; top: 0; left: 0; pointer-events: none; z-index: 70;';
    this.container.appendChild(this.rulersContainer);

    this.bindPointerEvents();
    this.bindKeyboardNudge();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public setZoom(zoom: number): void {
    this.zoom = zoom;
    this.updatePositions();
  }

  public setGrid(gridSize: number, snapEnabled: boolean = true): void {
    this.gridSize = gridSize;
    this.snapEnabled = snapEnabled;
  }

  public setSafeAreaVisible(visible: boolean): void {
    this.safeAreaEl.style.display = visible ? 'block' : 'none';
  }

  public setReferenceOverlay(config: ReferenceOverlayConfig | null): void {
    this.referenceConfig = config;
    if (!config || !config.visible || !config.imageUrl) {
      this.referenceImgEl.style.display = 'none';
      return;
    }
    this.referenceImgEl.src = config.imageUrl;
    this.referenceImgEl.style.display = 'block';
    this.referenceImgEl.style.opacity = String(config.opacity);
    this.referenceImgEl.style.left = `${config.x}px`;
    this.referenceImgEl.style.top = `${config.y}px`;
    this.referenceImgEl.style.transform = `scale(${config.scale})`;
  }

  public updateSelected(elementId: string | null, rect: ElementRect | null, isLocked: boolean = false, isHidden: boolean = false): void {
    this.selectedElementId = elementId;
    this.selectedRect = rect;
    this.isLocked = isLocked;
    this.isHidden = isHidden;
    this.updatePositions();
  }

  public updateHovered(rect: ElementRect | null): void {
    this.hoveredRect = rect;
    if (!rect || (this.selectedRect && this.isSameRect(rect, this.selectedRect))) {
      this.hoverBoxEl.style.display = 'none';
    } else {
      this.hoverBoxEl.style.display = 'block';
      this.hoverBoxEl.style.left = `${rect.x}px`;
      this.hoverBoxEl.style.top = `${rect.y}px`;
      this.hoverBoxEl.style.width = `${rect.width}px`;
      this.hoverBoxEl.style.height = `${rect.height}px`;
    }
  }

  public getHoveredRect(): ElementRect | null {
    return this.hoveredRect;
  }

  public getReferenceConfig(): ReferenceOverlayConfig | null {
    return this.referenceConfig;
  }

  public onDrag(cb: (ev: DragTransformEvent) => void): void {
    this.onDragCallback = cb;
  }

  public onResize(cb: (ev: ResizeTransformEvent) => void): void {
    this.onResizeCallback = cb;
  }

  public onAlign(cb: (type: string) => void): void {
    this.onAlignCallback = cb;
  }

  public onReset(cb: () => void): void {
    this.onResetCallback = cb;
  }

  public onToggleHide(cb: () => void): void {
    this.onToggleHideCallback = cb;
  }

  private isSameRect(a: ElementRect, b: ElementRect): boolean {
    return Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1 && Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1;
  }

  private updatePositions(): void {
    if (!this.selectedRect || this.isHidden) {
      this.selectionBoxEl.style.display = 'none';
      this.floatingToolbarEl.style.display = 'none';
      return;
    }

    this.selectionBoxEl.style.display = 'block';
    this.selectionBoxEl.style.left = `${this.selectedRect.x}px`;
    this.selectionBoxEl.style.top = `${this.selectedRect.y}px`;
    this.selectionBoxEl.style.width = `${this.selectedRect.width}px`;
    this.selectionBoxEl.style.height = `${this.selectedRect.height}px`;
    this.selectionBoxEl.style.cursor = this.isLocked ? 'not-allowed' : 'move';
    this.selectionBoxEl.style.borderColor = this.isLocked ? '#ef4444' : '#3b82f6';

    // Dimension badge
    let badge = this.selectionBoxEl.querySelector('.editor-dimension-badge') as HTMLElement;
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'editor-dimension-badge';
      badge.style.cssText = `
        position: absolute;
        bottom: -22px;
        left: 50%;
        transform: translateX(-50%);
        background: #1e293b;
        color: #93c5fd;
        font-family: monospace;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 3px;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      `;
      this.selectionBoxEl.appendChild(badge);
    }
    badge.textContent = `${Math.round(this.selectedRect.width)} × ${Math.round(this.selectedRect.height)}`;

    // Show handles only if not locked
    const handles = this.selectionBoxEl.querySelectorAll('.resize-handle');
    handles.forEach((h) => ((h as HTMLElement).style.display = this.isLocked ? 'none' : 'block'));

    // Position floating toolbar
    this.floatingToolbarEl.style.display = 'flex';
    this.floatingToolbarEl.style.left = `${Math.max(10, this.selectedRect.x)}px`;
    this.floatingToolbarEl.style.top = `${Math.max(10, this.selectedRect.y - 36)}px`;
  }

  private setupResizeHandles(): void {
    const handlePositions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

    handlePositions.forEach((pos) => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-handle-${pos}`;
      handle.dataset.handle = pos;

      const cursorMap: Record<string, string> = {
        nw: 'nwse-resize',
        se: 'nwse-resize',
        ne: 'nesw-resize',
        sw: 'nesw-resize',
        n: 'ns-resize',
        s: 'ns-resize',
        e: 'ew-resize',
        w: 'ew-resize',
      };

      handle.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: #ffffff;
        border: 2px solid #2563eb;
        border-radius: 1px;
        box-sizing: border-box;
        cursor: ${cursorMap[pos]};
        pointer-events: auto;
        z-index: 50;
      `;

      if (pos.includes('n')) handle.style.top = '-5px';
      if (pos.includes('s')) handle.style.bottom = '-5px';
      if (pos.includes('w')) handle.style.left = '-5px';
      if (pos.includes('e')) handle.style.right = '-5px';
      if (pos === 'n' || pos === 's') handle.style.left = 'calc(50% - 4px)';
      if (pos === 'w' || pos === 'e') handle.style.top = 'calc(50% - 4px)';

      handle.addEventListener('pointerdown', (e) => {
        if (this.isLocked) return;
        e.stopPropagation();
        e.preventDefault();
        this.activeResizeHandle = pos;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        this.initialElementRect = { ...this.selectedRect! };
        handle.setPointerCapture(e.pointerId);
      });

      this.selectionBoxEl.appendChild(handle);
    });
  }

  private setupFloatingToolbar(): void {
    const actions = [
      { id: 'align_left', icon: '⬅️', title: 'Align Left' },
      { id: 'align_center_x', icon: '↔️', title: 'Align Center Horizontal' },
      { id: 'align_top', icon: '⬆️', title: 'Align Top' },
      { id: 'align_center_y', icon: '↕️', title: 'Align Center Vertical' },
      { id: 'hide', icon: '👁️', title: 'Hide / Show' },
      { id: 'reset', icon: '🔄', title: 'Reset Element' },
    ];

    actions.forEach((act) => {
      const btn = document.createElement('button');
      btn.textContent = act.icon;
      btn.title = act.title;
      btn.style.cssText = `
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 3px;
        color: #cbd5e1;
        cursor: pointer;
        padding: 2px 6px;
        font-size: 11px;
      `;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (act.id === 'hide') {
          this.onToggleHideCallback?.();
        } else if (act.id === 'reset') {
          this.onResetCallback?.();
        } else {
          this.onAlignCallback?.(act.id);
        }
      });
      this.floatingToolbarEl.appendChild(btn);
    });
  }

  private bindPointerEvents(): void {
    this.selectionBoxEl.addEventListener('pointerdown', (e) => {
      if (this.isLocked || (e.target as HTMLElement).classList.contains('resize-handle')) return;
      e.stopPropagation();
      e.preventDefault();
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
      this.initialElementRect = this.selectedRect ? { ...this.selectedRect } : null;
      this.selectionBoxEl.setPointerCapture(e.pointerId);
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.selectedElementId || !this.initialElementRect) return;

      if (this.isDragging) {
        let deltaX = (e.clientX - this.dragStartX) / this.zoom;
        let deltaY = (e.clientY - this.dragStartY) / this.zoom;

        if (this.gridSize > 0 && this.snapEnabled) {
          deltaX = Math.round(deltaX / this.gridSize) * this.gridSize;
          deltaY = Math.round(deltaY / this.gridSize) * this.gridSize;
        }

        const newRect: ElementRect = {
          x: this.initialElementRect.x + deltaX,
          y: this.initialElementRect.y + deltaY,
          width: this.initialElementRect.width,
          height: this.initialElementRect.height,
        };
        this.selectedRect = newRect;
        this.updatePositions();
        this.drawSnapLines(newRect);
        this.onDragCallback?.({
          elementId: this.selectedElementId,
          deltaX,
          deltaY,
          isFinished: false,
        });
      } else if (this.activeResizeHandle) {
        const deltaX = (e.clientX - this.dragStartX) / this.zoom;
        const deltaY = (e.clientY - this.dragStartY) / this.zoom;
        const handle = this.activeResizeHandle;
        const init = this.initialElementRect;

        let newX = init.x;
        let newY = init.y;
        let newW = init.width;
        let newH = init.height;

        if (handle.includes('e')) newW = Math.max(10, init.width + deltaX);
        if (handle.includes('s')) newH = Math.max(10, init.height + deltaY);
        if (handle.includes('w')) {
          const clampedDelta = Math.min(deltaX, init.width - 10);
          newX = init.x + clampedDelta;
          newW = init.width - clampedDelta;
        }
        if (handle.includes('n')) {
          const clampedDelta = Math.min(deltaY, init.height - 10);
          newY = init.y + clampedDelta;
          newH = init.height - clampedDelta;
        }

        if (e.shiftKey) {
          const aspectRatio = init.width / init.height;
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            newH = newW / aspectRatio;
          } else {
            newW = newH * aspectRatio;
          }
        }

        if (this.gridSize > 0 && this.snapEnabled) {
          newW = Math.round(newW / this.gridSize) * this.gridSize;
          newH = Math.round(newH / this.gridSize) * this.gridSize;
        }

        const newRect: ElementRect = { x: newX, y: newY, width: newW, height: newH };
        this.selectedRect = newRect;
        this.updatePositions();
        this.onResizeCallback?.({
          elementId: this.selectedElementId,
          newRect,
          isFinished: false,
        });
      }
    });

    window.addEventListener('pointerup', () => {
      if (this.isDragging && this.selectedElementId && this.initialElementRect && this.selectedRect) {
        const deltaX = this.selectedRect.x - this.initialElementRect.x;
        const deltaY = this.selectedRect.y - this.initialElementRect.y;
        this.onDragCallback?.({
          elementId: this.selectedElementId,
          deltaX,
          deltaY,
          isFinished: true,
        });
      }

      if (this.activeResizeHandle && this.selectedElementId && this.selectedRect) {
        this.onResizeCallback?.({
          elementId: this.selectedElementId,
          newRect: this.selectedRect,
          isFinished: true,
        });
      }

      this.isDragging = false;
      this.activeResizeHandle = null;
      this.initialElementRect = null;
      this.clearSnapLines();
    });
  }

  private bindKeyboardNudge(): void {
    window.addEventListener('keydown', (e) => {
      if (!this.selectedElementId || !this.selectedRect || this.isLocked) return;
      if (['input', 'textarea'].includes((document.activeElement?.tagName || '').toLowerCase())) return;

      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else return;

      e.preventDefault();
      const newRect: ElementRect = {
        x: this.selectedRect.x + dx,
        y: this.selectedRect.y + dy,
        width: this.selectedRect.width,
        height: this.selectedRect.height,
      };
      this.selectedRect = newRect;
      this.updatePositions();
      this.onDragCallback?.({
        elementId: this.selectedElementId,
        deltaX: dx,
        deltaY: dy,
        isFinished: true,
      });
    });
  }

  private drawSnapLines(rect: ElementRect): void {
    this.guideLinesSvg.innerHTML = `
      <line x1="${rect.x}" y1="0" x2="${rect.x}" y2="100%" stroke="#38bdf8" stroke-dasharray="3,3" stroke-width="1" />
      <line x1="${rect.x + rect.width}" y1="0" x2="${rect.x + rect.width}" y2="100%" stroke="#38bdf8" stroke-dasharray="3,3" stroke-width="1" />
      <line x1="0" y1="${rect.y}" x2="100%" y2="${rect.y}" stroke="#38bdf8" stroke-dasharray="3,3" stroke-width="1" />
      <line x1="0" y1="${rect.y + rect.height}" x2="100%" y2="${rect.y + rect.height}" stroke="#38bdf8" stroke-dasharray="3,3" stroke-width="1" />
    `;
  }

  private clearSnapLines(): void {
    this.guideLinesSvg.innerHTML = '';
  }
}
