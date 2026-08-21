export interface PaletteElementDefinition {
  type: string;
  name: string;
  icon: string;
  defaultWidth: string;
  defaultHeight: string;
  defaultText?: string;
  description: string;
}

export const PALETTE_ELEMENTS: PaletteElementDefinition[] = [
  { type: 'panel', name: 'Design Panel', icon: '🔲', defaultWidth: '200px', defaultHeight: '120px', description: 'Generic container / card background' },
  { type: 'button', name: 'Button', icon: '🔘', defaultWidth: '140px', defaultHeight: '44px', defaultText: 'Action Button', description: 'Interactive button placeholder' },
  { type: 'text', name: 'Text / Label', icon: '📝', defaultWidth: 'auto', defaultHeight: 'auto', defaultText: 'Sample Label', description: 'Typography label' },
  { type: 'image', name: 'Image Slot', icon: '🖼️', defaultWidth: '96px', defaultHeight: '96px', description: 'Sprite or portrait slot' },
  { type: 'progress', name: 'Progress Bar', icon: '📊', defaultWidth: '180px', defaultHeight: '16px', description: 'Gauge / HP bar placeholder' },
  { type: 'spacer', name: 'Spacer / Divider', icon: '📏', defaultWidth: '100%', defaultHeight: '12px', description: 'Layout spacing separator' },
];

export class ElementPalette {
  private container: HTMLElement;
  private onAddElementCallback: ((def: PaletteElementDefinition) => void) | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'editor-palette-panel';
    this.container.style.cssText = `
      padding: 8px;
      background: #090d16;
      border-top: 1px solid #1e293b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      color: #cbd5e1;
    `;

    const title = document.createElement('div');
    title.style.cssText = 'font-weight: 700; font-size: 10px; color: #94a3b8; margin-bottom: 6px; letter-spacing: 0.5px;';
    title.textContent = '➕ ADD DESIGN DRAFT ELEMENT';
    this.container.appendChild(title);

    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;';

    PALETTE_ELEMENTS.forEach((item) => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 4px;
        padding: 6px 2px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        color: #e2e8f0;
        cursor: pointer;
        transition: all 0.1s;
      `;
      btn.title = item.description;

      btn.addEventListener('mouseenter', () => (btn.style.borderColor = '#3b82f6'));
      btn.addEventListener('mouseleave', () => (btn.style.borderColor = '#334155'));

      btn.addEventListener('click', () => {
        this.onAddElementCallback?.(item);
      });

      const icon = document.createElement('span');
      icon.style.fontSize = '14px';
      icon.textContent = item.icon;
      btn.appendChild(icon);

      const label = document.createElement('span');
      label.style.fontSize = '10px';
      label.textContent = item.name;
      btn.appendChild(label);

      grid.appendChild(btn);
    });

    this.container.appendChild(grid);
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public onAddElement(cb: (def: PaletteElementDefinition) => void): void {
    this.onAddElementCallback = cb;
  }
}
