import { UiElementNode, ScreenLayoutDraft } from './EditorTypes';

export class ElementTree {
  private container: HTMLElement;
  private treeContainer: HTMLElement;
  private searchInput: HTMLInputElement;
  private rootNode: UiElementNode | null = null;
  private selectedElementId: string | null = null;
  private hoveredElementId: string | null = null;
  private currentDraft: ScreenLayoutDraft | null = null;
  private searchQuery: string = '';
  private expandedNodeIds: Set<string> = new Set();

  private onSelectCallback: ((elementId: string) => void) | null = null;
  private onHoverCallback: ((elementId: string | null) => void) | null = null;
  private onToggleVisibilityCallback: ((elementId: string) => void) | null = null;
  private onToggleLockCallback: ((elementId: string) => void) | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'editor-tree-panel';
    this.container.style.cssText = `
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #0f172a;
      border-right: 1px solid #1e293b;
      user-select: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      color: #cbd5e1;
    `;

    // Search header
    const searchHeader = document.createElement('div');
    searchHeader.style.cssText = 'padding: 8px; border-bottom: 1px solid #1e293b; background: #090d16;';

    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.placeholder = 'Search elements (tag, id, class, text)...';
    this.searchInput.style.cssText = `
      width: 100%;
      box-sizing: border-box;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 4px;
      padding: 6px 8px;
      color: #f8fafc;
      font-size: 11px;
      outline: none;
    `;
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase().trim();
      this.renderTree();
    });
    searchHeader.appendChild(this.searchInput);
    this.container.appendChild(searchHeader);

    // Tree scroll area
    this.treeContainer = document.createElement('div');
    this.treeContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
    `;
    this.container.appendChild(this.treeContainer);
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public updateTree(rootNode: UiElementNode, draft: ScreenLayoutDraft): void {
    this.rootNode = rootNode;
    this.currentDraft = draft;
    // Auto expand top level nodes initially
    if (this.expandedNodeIds.size === 0 && rootNode) {
      this.expandedNodeIds.add(rootNode.id);
      rootNode.children.forEach((c) => this.expandedNodeIds.add(c.id));
    }
    this.renderTree();
  }

  public setSelectedElement(elementId: string | null): void {
    this.selectedElementId = elementId;
    if (elementId) {
      this.ensureAncestorsExpanded(this.rootNode, elementId);
    }
    this.renderTree();
  }

  public setHoveredElement(elementId: string | null): void {
    this.hoveredElementId = elementId;
    this.renderTree();
  }

  public onSelect(cb: (elementId: string) => void): void {
    this.onSelectCallback = cb;
  }

  public onHover(cb: (elementId: string | null) => void): void {
    this.onHoverCallback = cb;
  }

  public onToggleVisibility(cb: (elementId: string) => void): void {
    this.onToggleVisibilityCallback = cb;
  }

  public onToggleLock(cb: (elementId: string) => void): void {
    this.onToggleLockCallback = cb;
  }

  private ensureAncestorsExpanded(node: UiElementNode | null, targetId: string): boolean {
    if (!node) return false;
    if (node.id === targetId) return true;

    for (const child of node.children) {
      if (this.ensureAncestorsExpanded(child, targetId)) {
        this.expandedNodeIds.add(node.id);
        return true;
      }
    }
    return false;
  }

  private renderTree(): void {
    this.treeContainer.innerHTML = '';
    if (!this.rootNode) {
      this.treeContainer.innerHTML = '<div style="padding:16px; color:#64748b; text-align:center;">Loading DOM hierarchy...</div>';
      return;
    }
    this.renderNode(this.rootNode, 0, this.treeContainer);
  }

  private renderNode(node: UiElementNode, depth: number, parentContainer: HTMLElement): boolean {
    const matches = this.matchesSearch(node);
    const hasChildren = node.children.length > 0;
    const isExpanded = this.expandedNodeIds.has(node.id) || this.searchQuery.length > 0;
    const isSelected = this.selectedElementId === node.id;
    const isHovered = this.hoveredElementId === node.id;

    // Check draft status
    const override = this.currentDraft?.elements[node.id];
    const isHidden = override?.hidden ?? false;
    const isLocked = override?.locked ?? false;
    const isModified = Boolean(override && (Object.keys(override.base).length > 0 || override.assetPath || override.hidden));

    const itemRow = document.createElement('div');
    itemRow.style.cssText = `
      display: flex;
      align-items: center;
      padding: 3px 6px;
      padding-left: ${depth * 14 + 6}px;
      cursor: pointer;
      border-radius: 3px;
      margin: 1px 4px;
      background: ${isSelected ? '#2563eb' : isHovered ? '#1e293b' : 'transparent'};
      color: ${isSelected ? '#ffffff' : isHidden ? '#64748b' : '#e2e8f0'};
      transition: background 0.1s;
    `;

    itemRow.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectedElementId = node.id;
      this.onSelectCallback?.(node.id);
      this.renderTree();
    });

    itemRow.addEventListener('mouseenter', () => {
      this.onHoverCallback?.(node.id);
    });

    itemRow.addEventListener('mouseleave', () => {
      this.onHoverCallback?.(null);
    });

    // Expand/Collapse Caret
    const caret = document.createElement('span');
    caret.style.cssText = `
      width: 14px;
      height: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 4px;
      cursor: pointer;
      font-size: 9px;
      color: #94a3b8;
    `;
    if (hasChildren) {
      caret.textContent = isExpanded ? '▼' : '▶';
      caret.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.expandedNodeIds.has(node.id)) {
          this.expandedNodeIds.delete(node.id);
        } else {
          this.expandedNodeIds.add(node.id);
        }
        this.renderTree();
      });
    }
    itemRow.appendChild(caret);

    // Tag / Type Icon
    const typeIcon = document.createElement('span');
    typeIcon.style.cssText = 'margin-right: 5px; font-size: 11px;';
    typeIcon.textContent = this.getNodeIcon(node);
    itemRow.appendChild(typeIcon);

    // Label (UI ID > tag + classes)
    const label = document.createElement('span');
    label.style.cssText = 'flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px;';

    if (node.uiId) {
      label.innerHTML = `<span style="color:#60a5fa; font-weight:600;">${this.escapeHtml(node.uiId)}</span>`;
    } else {
      const classPart = node.className ? `<span style="color:#94a3b8; font-size:10px;">.${node.className.split(' ')[0]}</span>` : '';
      label.innerHTML = `<span style="color:#cbd5e1;">${node.tagName}</span>${classPart}`;
    }
    itemRow.appendChild(label);

    // Modified indicator badge
    if (isModified) {
      const modBadge = document.createElement('span');
      modBadge.style.cssText = 'width:6px; height:6px; border-radius:50%; background:#f59e0b; margin-right:6px;';
      modBadge.title = 'Modified in draft';
      itemRow.appendChild(modBadge);
    }

    // Lock toggle button
    const lockBtn = document.createElement('span');
    lockBtn.style.cssText = `
      margin-left: 4px;
      cursor: pointer;
      opacity: ${isLocked ? '1' : '0.4'};
      font-size: 10px;
    `;
    lockBtn.textContent = isLocked ? '🔒' : '🔓';
    lockBtn.title = isLocked ? 'Unlock element' : 'Lock element';
    lockBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onToggleLockCallback?.(node.id);
    });
    itemRow.appendChild(lockBtn);

    // Visibility toggle button
    const eyeBtn = document.createElement('span');
    eyeBtn.style.cssText = `
      margin-left: 6px;
      cursor: pointer;
      opacity: ${isHidden ? '0.4' : '1'};
      font-size: 10px;
    `;
    eyeBtn.textContent = isHidden ? '🙈' : '👁️';
    eyeBtn.title = isHidden ? 'Show element' : 'Hide element';
    eyeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onToggleVisibilityCallback?.(node.id);
    });
    itemRow.appendChild(eyeBtn);

    parentContainer.appendChild(itemRow);

    // Children container
    let childMatchedAny = matches;
    if (hasChildren && isExpanded) {
      const childContainer = document.createElement('div');
      for (const child of node.children) {
        const childMatched = this.renderNode(child, depth + 1, childContainer);
        if (childMatched) childMatchedAny = true;
      }
      parentContainer.appendChild(childContainer);
    }

    return childMatchedAny;
  }

  private getNodeIcon(node: UiElementNode): string {
    if (node.isImage || node.tagName === 'img') return '🖼️';
    if (node.tagName === 'button') return '🔘';
    if (node.tagName.startsWith('h') || node.tagName === 'p' || node.tagName === 'span') return '📝';
    if (node.tagName === 'nav') return '🧭';
    if (node.tagName === 'header') return '🔝';
    if (node.tagName === 'canvas') return '🎨';
    if (node.isDesignOnly) return '📐';
    return '📦';
  }

  private matchesSearch(node: UiElementNode): boolean {
    if (!this.searchQuery) return true;
    if (node.uiId && node.uiId.toLowerCase().includes(this.searchQuery)) return true;
    if (node.tagName.toLowerCase().includes(this.searchQuery)) return true;
    if (node.className.toLowerCase().includes(this.searchQuery)) return true;
    if (node.textContent && node.textContent.toLowerCase().includes(this.searchQuery)) return true;
    return false;
  }

  private escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
