import { UiElementNode, ElementOverride, StyleOverride, BreakpointKey } from './EditorTypes';

export interface InspectorChangePayload {
  elementId: string;
  styles: Partial<StyleOverride>;
  overrideProps?: Partial<ElementOverride>;
  breakpoint: BreakpointKey;
}

export class Inspector {
  private container: HTMLElement;
  private selectedNode: UiElementNode | null = null;
  private currentOverride: ElementOverride | null = null;
  private currentBreakpoint: BreakpointKey = 'base';
  private onChangeCallback: ((payload: InspectorChangePayload) => void) | null = null;
  private onResetCallback: ((elementId: string) => void) | null = null;
  private onHideCallback: ((elementId: string) => void) | null = null;
  private onOpenAssetBrowserCallback: (() => void) | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'editor-inspector-panel';
    this.container.style.cssText = `
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #0f172a;
      border-left: 1px solid #1e293b;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      color: #cbd5e1;
      user-select: none;
    `;
    this.renderEmpty();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public inspect(
    node: UiElementNode | null,
    override: ElementOverride | null,
    breakpoint: BreakpointKey = 'base'
  ): void {
    this.selectedNode = node;
    this.currentOverride = override;
    this.currentBreakpoint = breakpoint;

    if (!node) {
      this.renderEmpty();
    } else {
      this.renderInspector();
    }
  }

  public onChange(cb: (payload: InspectorChangePayload) => void): void {
    this.onChangeCallback = cb;
  }

  public onReset(cb: (elementId: string) => void): void {
    this.onResetCallback = cb;
  }

  public onHide(cb: (elementId: string) => void): void {
    this.onHideCallback = cb;
  }

  public onOpenAssetBrowser(cb: () => void): void {
    this.onOpenAssetBrowserCallback = cb;
  }

  private renderEmpty(): void {
    this.container.innerHTML = `
      <div style="padding: 24px 16px; text-align: center; color: #64748b;">
        <div style="font-size: 24px; margin-bottom: 8px;">🎯</div>
        <div style="font-weight: 600; color: #94a3b8; margin-bottom: 4px;">No Element Selected</div>
        <div style="font-size: 11px;">Click an element in Preview or select from the Element Tree to inspect and modify properties.</div>
      </div>
    `;
  }

  private renderInspector(): void {
    if (!this.selectedNode) return;
    this.container.innerHTML = '';

    const node = this.selectedNode;
    const override = this.currentOverride || {
      id: node.id,
      tagName: node.tagName,
      base: {},
    };

    const effectiveStyles: StyleOverride = {
      ...override.base,
      ...(this.currentBreakpoint === 'tablet' ? override.tablet : {}),
      ...(this.currentBreakpoint === 'mobile' ? override.mobile : {}),
    };

    // 1. Identity Section
    const identitySec = this.createSection('IDENTITY', true);
    identitySec.appendChild(this.createField('Name', override.name || node.uiId || node.tagName, (v) => {
      this.emitOverrideChange({ name: v });
    }));
    identitySec.appendChild(this.createReadOnlyField('Tag', `<${node.tagName}>`));
    if (node.className) identitySec.appendChild(this.createReadOnlyField('Class', `.${node.className.split(' ').join(' .')}`));
    if (node.uiId) identitySec.appendChild(this.createReadOnlyField('UI ID', node.uiId));
    if (node.sourceFile) identitySec.appendChild(this.createReadOnlyField('Source', node.sourceFile));
    this.container.appendChild(identitySec);

    // 2. Position & Size Section
    const posSec = this.createSection('POSITION & SIZE', true);
    posSec.appendChild(this.createSelectField('Position', effectiveStyles.position || node.computedStyle.position || 'static', [
      { label: 'Static (Flow)', value: 'static' },
      { label: 'Relative', value: 'relative' },
      { label: 'Absolute', value: 'absolute' },
      { label: 'Fixed', value: 'fixed' },
    ], (v) => this.emitStyleChange({ position: v as any })));

    const posRow = document.createElement('div');
    posRow.style.cssText = 'display: flex; gap: 8px; margin-bottom: 6px;';
    posRow.appendChild(this.createInputField('Left (X)', effectiveStyles.left || `${Math.round(node.rect.x)}px`, (v) => this.emitStyleChange({ left: v })));
    posRow.appendChild(this.createInputField('Top (Y)', effectiveStyles.top || `${Math.round(node.rect.y)}px`, (v) => this.emitStyleChange({ top: v })));
    posSec.appendChild(posRow);

    const sizeRow = document.createElement('div');
    sizeRow.style.cssText = 'display: flex; gap: 8px; margin-bottom: 6px;';
    sizeRow.appendChild(this.createInputField('Width', effectiveStyles.width || `${Math.round(node.rect.width)}px`, (v) => this.emitStyleChange({ width: v })));
    sizeRow.appendChild(this.createInputField('Height', effectiveStyles.height || `${Math.round(node.rect.height)}px`, (v) => this.emitStyleChange({ height: v })));
    posSec.appendChild(sizeRow);

    // Size Preset Buttons
    const sizePresets = document.createElement('div');
    sizePresets.style.cssText = 'display: flex; gap: 4px; margin-bottom: 6px;';
    [
      { label: 'Auto', w: 'auto', h: 'auto' },
      { label: 'Fit', w: 'fit-content', h: 'fit-content' },
      { label: '100% W', w: '100%', h: undefined },
      { label: '100% H', w: undefined, h: '100%' },
    ].forEach((p) => {
      const btn = document.createElement('button');
      btn.textContent = p.label;
      btn.style.cssText = 'flex:1; background:#1e293b; border:1px solid #334155; color:#cbd5e1; border-radius:3px; padding:3px; font-size:10px; cursor:pointer;';
      btn.addEventListener('click', () => {
        const changes: Partial<StyleOverride> = {};
        if (p.w) changes.width = p.w;
        if (p.h) changes.height = p.h;
        this.emitStyleChange(changes);
      });
      sizePresets.appendChild(btn);
    });
    posSec.appendChild(sizePresets);
    this.container.appendChild(posSec);

    // 3. Spacing (Margin & Padding)
    const spacingSec = this.createSection('SPACING & GAP');
    const marginRow = document.createElement('div');
    marginRow.style.cssText = 'display: flex; gap: 4px; margin-bottom: 4px;';
    marginRow.appendChild(this.createInputField('Margin T', effectiveStyles.marginTop || '', (v) => this.emitStyleChange({ marginTop: v })));
    marginRow.appendChild(this.createInputField('Margin R', effectiveStyles.marginRight || '', (v) => this.emitStyleChange({ marginRight: v })));
    marginRow.appendChild(this.createInputField('Margin B', effectiveStyles.marginBottom || '', (v) => this.emitStyleChange({ marginBottom: v })));
    marginRow.appendChild(this.createInputField('Margin L', effectiveStyles.marginLeft || '', (v) => this.emitStyleChange({ marginLeft: v })));
    spacingSec.appendChild(marginRow);

    const padRow = document.createElement('div');
    padRow.style.cssText = 'display: flex; gap: 4px; margin-bottom: 4px;';
    padRow.appendChild(this.createInputField('Pad T', effectiveStyles.paddingTop || '', (v) => this.emitStyleChange({ paddingTop: v })));
    padRow.appendChild(this.createInputField('Pad R', effectiveStyles.paddingRight || '', (v) => this.emitStyleChange({ paddingRight: v })));
    padRow.appendChild(this.createInputField('Pad B', effectiveStyles.paddingBottom || '', (v) => this.emitStyleChange({ paddingBottom: v })));
    padRow.appendChild(this.createInputField('Pad L', effectiveStyles.paddingLeft || '', (v) => this.emitStyleChange({ paddingLeft: v })));
    spacingSec.appendChild(padRow);

    spacingSec.appendChild(this.createInputField('Gap', effectiveStyles.gap || '', (v) => this.emitStyleChange({ gap: v })));
    this.container.appendChild(spacingSec);

    // 4. Flex / Layout Section
    const flexSec = this.createSection('FLEX & ALIGNMENT');
    flexSec.appendChild(this.createSelectField('Direction', effectiveStyles.flexDirection || 'row', [
      { label: 'Row (Horizontal)', value: 'row' },
      { label: 'Column (Vertical)', value: 'column' },
      { label: 'Row Reverse', value: 'row-reverse' },
      { label: 'Column Reverse', value: 'column-reverse' },
    ], (v) => this.emitStyleChange({ flexDirection: v as any })));

    flexSec.appendChild(this.createSelectField('Justify Content', effectiveStyles.justifyContent || 'flex-start', [
      { label: 'Start', value: 'flex-start' },
      { label: 'Center', value: 'center' },
      { label: 'End', value: 'flex-end' },
      { label: 'Space Between', value: 'space-between' },
      { label: 'Space Around', value: 'space-around' },
    ], (v) => this.emitStyleChange({ justifyContent: v })));

    flexSec.appendChild(this.createSelectField('Align Items', effectiveStyles.alignItems || 'stretch', [
      { label: 'Stretch', value: 'stretch' },
      { label: 'Center', value: 'center' },
      { label: 'Start', value: 'flex-start' },
      { label: 'End', value: 'flex-end' },
    ], (v) => this.emitStyleChange({ alignItems: v })));
    this.container.appendChild(flexSec);

    // 5. Typography Section
    const typoSec = this.createSection('TYPOGRAPHY');
    typoSec.appendChild(this.createInputField('Font Size', effectiveStyles.fontSize || node.computedStyle.fontSize || '', (v) => this.emitStyleChange({ fontSize: v })));
    typoSec.appendChild(this.createInputField('Color', effectiveStyles.color || node.computedStyle.color || '', (v) => this.emitStyleChange({ color: v })));
    typoSec.appendChild(this.createInputField('Custom Text', effectiveStyles.customText || node.textContent || '', (v) => this.emitStyleChange({ customText: v })));
    this.container.appendChild(typoSec);

    // 6. Appearance Section
    const appearSec = this.createSection('APPEARANCE');
    appearSec.appendChild(this.createInputField('Opacity', effectiveStyles.opacity || '1', (v) => this.emitStyleChange({ opacity: v })));
    appearSec.appendChild(this.createInputField('Background', effectiveStyles.backgroundColor || '', (v) => this.emitStyleChange({ backgroundColor: v })));
    appearSec.appendChild(this.createInputField('Border Radius', effectiveStyles.borderRadius || '', (v) => this.emitStyleChange({ borderRadius: v })));
    appearSec.appendChild(this.createInputField('Border', effectiveStyles.border || '', (v) => this.emitStyleChange({ border: v })));
    appearSec.appendChild(this.createInputField('Z-Index', effectiveStyles.zIndex || '', (v) => this.emitStyleChange({ zIndex: v })));
    this.container.appendChild(appearSec);

    // 7. Image & Sprite Section (if image or asset override)
    if (node.isImage || override.assetPath) {
      const imgSec = this.createSection('IMAGE & SPRITE', true);
      const assetRow = document.createElement('div');
      assetRow.style.cssText = 'display: flex; gap: 6px; align-items: center; margin-bottom: 6px;';

      const thumb = document.createElement('img');
      thumb.src = override.assetPath || node.imageSrc || '';
      thumb.style.cssText = 'width: 32px; height: 32px; object-fit: contain; background: #1e293b; border-radius: 4px; border: 1px solid #334155;';
      assetRow.appendChild(thumb);

      const changeBtn = document.createElement('button');
      changeBtn.textContent = '🖼️ Replace Asset';
      changeBtn.style.cssText = 'flex: 1; background: #2563eb; color: #ffffff; border: none; border-radius: 4px; padding: 6px; font-size: 11px; font-weight: 600; cursor: pointer;';
      changeBtn.addEventListener('click', () => {
        this.onOpenAssetBrowserCallback?.();
      });
      assetRow.appendChild(changeBtn);
      imgSec.appendChild(assetRow);

      imgSec.appendChild(this.createSelectField('Object Fit', effectiveStyles.objectFit || 'contain', [
        { label: 'Contain', value: 'contain' },
        { label: 'Cover', value: 'cover' },
        { label: 'Fill', value: 'fill' },
        { label: 'Scale Down', value: 'scale-down' },
        { label: 'None', value: 'none' },
      ], (v) => this.emitStyleChange({ objectFit: v as any })));

      imgSec.appendChild(this.createSelectField('Pixel Art Mode', effectiveStyles.imageRendering || 'auto', [
        { label: 'Auto (Smooth)', value: 'auto' },
        { label: 'Pixelated (Crisp)', value: 'pixelated' },
      ], (v) => this.emitStyleChange({ imageRendering: v as any })));

      this.container.appendChild(imgSec);
    }

    // 8. AI Notes & Purpose Section
    const aiSec = this.createSection('AI NOTE & ASSET TASKS', true);
    aiSec.appendChild(this.createTextAreaField('AI Instructions / Note', override.aiNote || '', 'Describe intended behavior, layout changes, or logic for AI...', (v) => {
      this.emitOverrideChange({ aiNote: v });
    }));

    // NEEDS ASSET Toggle
    const needsAssetLabel = document.createElement('label');
    needsAssetLabel.style.cssText = 'display: flex; align-items: center; gap: 6px; font-size: 11px; color: #f59e0b; margin: 8px 0; cursor: pointer;';
    const needsAssetCheckbox = document.createElement('input');
    needsAssetCheckbox.type = 'checkbox';
    needsAssetCheckbox.checked = Boolean(override.needsAsset);
    needsAssetCheckbox.addEventListener('change', () => {
      const isNeeds = needsAssetCheckbox.checked;
      const cssW = Math.round(node.rect.width);
      const cssH = Math.round(node.rect.height);
      this.emitOverrideChange({
        needsAsset: isNeeds,
        targetAssetDimensions: isNeeds
          ? {
              cssWidth: cssW,
              cssHeight: cssH,
              recommendedSourceWidth: cssW * 2,
              recommendedSourceHeight: cssH * 2,
            }
          : undefined,
      });
      this.renderInspector();
    });
    needsAssetLabel.appendChild(needsAssetCheckbox);
    needsAssetLabel.appendChild(document.createTextNode('🎨 Needs New Art Asset'));
    aiSec.appendChild(needsAssetLabel);

    if (override.needsAsset) {
      const dimInfo = document.createElement('div');
      dimInfo.style.cssText = 'background: rgba(245, 158, 11, 0.1); border: 1px dashed #f59e0b; border-radius: 4px; padding: 6px; font-size: 10px; color: #fbbf24; margin-bottom: 6px;';
      dimInfo.innerHTML = `
        <strong>Target Dimensions:</strong><br/>
        • Slot size: ${Math.round(node.rect.width)} × ${Math.round(node.rect.height)} CSS px<br/>
        • Source asset (@2x): ${Math.round(node.rect.width * 2)} × ${Math.round(node.rect.height * 2)} px
      `;
      aiSec.appendChild(dimInfo);
    }
    this.container.appendChild(aiSec);

    // 9. Actions Section
    const actionSec = this.createSection('ACTIONS');
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display: flex; gap: 6px;';

    const resetBtn = document.createElement('button');
    resetBtn.textContent = '🔄 Reset Element';
    resetBtn.style.cssText = 'flex:1; background:#334155; color:#cbd5e1; border:none; border-radius:4px; padding:6px; font-size:11px; cursor:pointer;';
    resetBtn.addEventListener('click', () => {
      this.onResetCallback?.(node.id);
    });
    btnRow.appendChild(resetBtn);

    const hideBtn = document.createElement('button');
    hideBtn.textContent = override.hidden ? '👁️ Show Element' : '🙈 Hide in Draft';
    hideBtn.style.cssText = 'flex:1; background:#1e293b; color:#cbd5e1; border:1px solid #334155; border-radius:4px; padding:6px; font-size:11px; cursor:pointer;';
    hideBtn.addEventListener('click', () => {
      this.onHideCallback?.(node.id);
    });
    btnRow.appendChild(hideBtn);

    actionSec.appendChild(btnRow);
    this.container.appendChild(actionSec);
  }

  private createSection(title: string, _defaultOpen: boolean = true): HTMLElement {
    const sec = document.createElement('div');
    sec.style.cssText = 'border-bottom: 1px solid #1e293b; padding: 10px 12px;';

    const header = document.createElement('div');
    header.style.cssText = 'font-weight: 700; font-size: 10px; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 8px;';
    header.textContent = title;
    sec.appendChild(header);

    return sec;
  }

  private createField(label: string, value: string, onCommit: (v: string) => void): HTMLElement {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; font-size: 11px;';

    const lbl = document.createElement('span');
    lbl.style.cssText = 'color: #94a3b8; font-size: 11px;';
    lbl.textContent = label;
    wrap.appendChild(lbl);

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = value;
    inp.style.cssText = 'width: 140px; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 3px 6px; color: #f8fafc; font-size: 11px; outline: none;';
    inp.addEventListener('change', () => onCommit(inp.value));
    wrap.appendChild(inp);

    return wrap;
  }

  private createInputField(label: string, value: string, onCommit: (v: string) => void): HTMLElement {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 2px;';

    const lbl = document.createElement('span');
    lbl.style.cssText = 'color: #64748b; font-size: 10px;';
    lbl.textContent = label;
    wrap.appendChild(lbl);

    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = value;
    inp.style.cssText = 'width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; border-radius: 3px; padding: 3px 5px; color: #f8fafc; font-size: 11px; outline: none;';
    inp.addEventListener('change', () => onCommit(inp.value));
    wrap.appendChild(inp);

    return wrap;
  }

  private createSelectField(label: string, current: string, options: Array<{ label: string; value: string }>, onCommit: (v: string) => void): HTMLElement {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; font-size: 11px;';

    const lbl = document.createElement('span');
    lbl.style.cssText = 'color: #94a3b8; font-size: 11px;';
    lbl.textContent = label;
    wrap.appendChild(lbl);

    const sel = document.createElement('select');
    sel.style.cssText = 'width: 140px; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 3px 6px; color: #f8fafc; font-size: 11px; outline: none;';

    options.forEach((opt) => {
      const el = document.createElement('option');
      el.value = opt.value;
      el.textContent = opt.label;
      if (opt.value === current) el.selected = true;
      sel.appendChild(el);
    });

    sel.addEventListener('change', () => onCommit(sel.value));
    wrap.appendChild(sel);

    return wrap;
  }

  private createTextAreaField(label: string, value: string, placeholder: string, onCommit: (v: string) => void): HTMLElement {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px;';

    const lbl = document.createElement('span');
    lbl.style.cssText = 'color: #94a3b8; font-size: 11px; font-weight: 600;';
    lbl.textContent = label;
    wrap.appendChild(lbl);

    const txt = document.createElement('textarea');
    txt.rows = 3;
    txt.value = value;
    txt.placeholder = placeholder;
    txt.style.cssText = 'width: 100%; box-sizing: border-box; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 6px; color: #f8fafc; font-size: 11px; outline: none; resize: vertical;';
    txt.addEventListener('change', () => onCommit(txt.value));
    wrap.appendChild(txt);

    return wrap;
  }

  private createReadOnlyField(label: string, value: string): HTMLElement {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; font-size: 11px;';

    const lbl = document.createElement('span');
    lbl.style.cssText = 'color: #64748b; font-size: 10px;';
    lbl.textContent = label;
    wrap.appendChild(lbl);

    const val = document.createElement('span');
    val.style.cssText = 'color: #cbd5e1; font-family: monospace; font-size: 10px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
    val.textContent = value;
    wrap.appendChild(val);

    return wrap;
  }

  private emitStyleChange(styles: Partial<StyleOverride>): void {
    if (!this.selectedNode) return;
    this.onChangeCallback?.({
      elementId: this.selectedNode.id,
      styles,
      breakpoint: this.currentBreakpoint,
    });
  }

  private emitOverrideChange(overrideProps: Partial<ElementOverride>): void {
    if (!this.selectedNode) return;
    this.onChangeCallback?.({
      elementId: this.selectedNode.id,
      styles: {},
      overrideProps,
      breakpoint: this.currentBreakpoint,
    });
  }
}
