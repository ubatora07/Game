import { AssetMetadata, ReferenceOverlayConfig } from './EditorTypes';
import { WORLD_ART_REGISTRY } from '../ui/art/runtime/WorldArtRegistry';
import { ENEMY_SPRITE_REGISTRY } from '../ui/art/runtime/EnemySpriteRegistry';
import { PLAYER_SPRITE_REGISTRY } from '../ui/art/runtime/PlayerSpriteRegistry';
import { PET_SPRITE_REGISTRY } from '../ui/art/runtime/PetSpriteRegistry';
import { UI_ICON_REGISTRY } from '../ui/art/runtime/UIIconRegistry';

export class AssetBrowser {
  private container: HTMLElement;
  private assetGridEl: HTMLElement;
  private searchInput: HTMLInputElement;
  private categorySelect: HTMLSelectElement;
  private dropzoneEl: HTMLElement;
  private referenceSectionEl: HTMLElement;

  private assets: AssetMetadata[] = [];
  private currentCategory: string = 'all';
  private searchQuery: string = '';
  private referenceConfig: ReferenceOverlayConfig = {
    imageUrl: '',
    opacity: 0.5,
    x: 0,
    y: 0,
    scale: 1.0,
    locked: false,
    visible: false,
  };

  private onSelectAssetCallback: ((asset: AssetMetadata) => void) | null = null;
  private onReferenceChangeCallback: ((config: ReferenceOverlayConfig) => void) | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'editor-asset-browser';
    this.container.style.cssText = `
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #0f172a;
      border-right: 1px solid #1e293b;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 12px;
      color: #cbd5e1;
    `;

    // 1. Upload Dropzone Header
    this.dropzoneEl = document.createElement('div');
    this.dropzoneEl.style.cssText = `
      margin: 8px;
      padding: 12px;
      border: 2px dashed #3b82f6;
      border-radius: 6px;
      background: rgba(59, 130, 246, 0.05);
      text-align: center;
      cursor: pointer;
      transition: background 0.15s;
    `;
    this.dropzoneEl.innerHTML = `
      <div style="font-size: 16px; margin-bottom: 4px;">📤 Drag & Drop PNG or Click to Upload</div>
      <div style="font-size: 10px; color: #94a3b8;">Supports PNG, WebP, JPEG (saved to assets/user/)</div>
      <input type="file" accept="image/png,image/webp,image/jpeg" style="display:none;" />
    `;
    const fileInput = this.dropzoneEl.querySelector('input') as HTMLInputElement;

    this.dropzoneEl.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        this.uploadFile(files[0]);
      }
    });

    this.dropzoneEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzoneEl.style.background = 'rgba(59, 130, 246, 0.15)';
    });
    this.dropzoneEl.addEventListener('dragleave', () => {
      this.dropzoneEl.style.background = 'rgba(59, 130, 246, 0.05)';
    });
    this.dropzoneEl.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzoneEl.style.background = 'rgba(59, 130, 246, 0.05)';
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        this.uploadFile(e.dataTransfer.files[0]);
      }
    });
    this.container.appendChild(this.dropzoneEl);

    // 2. Search & Category Bar
    const filterBar = document.createElement('div');
    filterBar.style.cssText = 'display: flex; gap: 6px; padding: 0 8px 8px 8px; border-bottom: 1px solid #1e293b;';

    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.placeholder = 'Filter assets...';
    this.searchInput.style.cssText = 'flex: 1; background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 4px 6px; color: #f8fafc; font-size: 11px; outline: none;';
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase().trim();
      this.renderAssetGrid();
    });
    filterBar.appendChild(this.searchInput);

    this.categorySelect = document.createElement('select');
    this.categorySelect.style.cssText = 'background: #1e293b; border: 1px solid #334155; border-radius: 4px; padding: 4px 6px; color: #f8fafc; font-size: 11px; outline: none;';
    [
      { label: 'All Categories', value: 'all' },
      { label: 'User Uploads', value: 'user' },
      { label: 'Characters', value: 'characters' },
      { label: 'Enemies', value: 'enemies' },
      { label: 'Pets', value: 'pets' },
      { label: 'Backgrounds', value: 'backgrounds' },
      { label: 'UI / Icons', value: 'ui' },
    ].forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.value;
      opt.textContent = c.label;
      this.categorySelect.appendChild(opt);
    });
    this.categorySelect.addEventListener('change', () => {
      this.currentCategory = this.categorySelect.value;
      this.renderAssetGrid();
    });
    filterBar.appendChild(this.categorySelect);
    this.container.appendChild(filterBar);

    // 3. Reference Screenshot Overlay Section
    this.referenceSectionEl = document.createElement('div');
    this.referenceSectionEl.style.cssText = 'padding: 8px; border-bottom: 1px solid #1e293b; background: #090d16; font-size: 11px;';
    this.renderReferenceSection();
    this.container.appendChild(this.referenceSectionEl);

    // 4. Asset Grid
    this.assetGridEl = document.createElement('div');
    this.assetGridEl.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 8px;
    `;
    this.container.appendChild(this.assetGridEl);

    this.loadBuiltinAssets();
    this.fetchUserAssets();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public onSelectAsset(cb: (asset: AssetMetadata) => void): void {
    this.onSelectAssetCallback = cb;
  }

  public onReferenceChange(cb: (config: ReferenceOverlayConfig) => void): void {
    this.onReferenceChangeCallback = cb;
  }

  public setReferenceConfig(config: ReferenceOverlayConfig): void {
    this.referenceConfig = { ...config };
    this.renderReferenceSection();
  }

  private loadBuiltinAssets(): void {
    const list: AssetMetadata[] = [];

    // 1. World Art
    Object.entries(WORLD_ART_REGISTRY).forEach(([id, def]) => {
      const firstLayerColor = def.layers?.[0]?.primaryColor || def.accentColor || '#1e293b';
      list.push({
        id: `bg_${id}`,
        filename: `${def.bgAsset || id}.svg`,
        relativePath: `art/world/${id}`,
        category: 'backgrounds',
        format: 'svg',
        thumbnailUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="${firstLayerColor}"/><circle cx="50" cy="50" r="30" fill="${def.accentColor}" opacity="0.4"/></svg>`)}`,
      });
    });

    // 2. Enemies & Bosses
    Object.entries(ENEMY_SPRITE_REGISTRY).forEach(([id, def]) => {
      list.push({
        id: `enemy_${id}`,
        filename: `${def.spriteId || id}.svg`,
        relativePath: `art/enemies/${id}`,
        category: 'enemies',
        format: 'svg',
        isPixelArt: true,
        thumbnailUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#0f172a"/><circle cx="50" cy="50" r="32" fill="${def.bodyColor || '#ef4444'}"/><circle cx="50" cy="50" r="16" fill="${def.accentColor || '#f59e0b'}"/></svg>`)}`,
      });
    });

    // 3. Player Classes
    Object.entries(PLAYER_SPRITE_REGISTRY).forEach(([id, def]) => {
      list.push({
        id: `player_${id}`,
        filename: `${def.classId || id}.svg`,
        relativePath: `art/player/${id}`,
        category: 'characters',
        format: 'svg',
        isPixelArt: true,
        thumbnailUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#0f172a"/><circle cx="50" cy="50" r="32" fill="${def.bodyColor || '#3b82f6'}"/><circle cx="50" cy="50" r="16" fill="${def.accentColor || '#60a5fa'}"/></svg>`)}`,
      });
    });

    // 4. Pets
    Object.entries(PET_SPRITE_REGISTRY).forEach(([id, def]) => {
      list.push({
        id: `pet_${id}`,
        filename: `${def.petId || id}.svg`,
        relativePath: `art/pets/${id}`,
        category: 'pets',
        format: 'svg',
        isPixelArt: true,
        thumbnailUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#0f172a"/><circle cx="50" cy="50" r="28" fill="${def.bodyColor || '#10b981'}"/><circle cx="50" cy="50" r="12" fill="${def.accentColor || '#34d399'}"/></svg>`)}`,
      });
    });

    // 5. UI Icons
    Object.entries(UI_ICON_REGISTRY).forEach(([id, def]) => {
      list.push({
        id: `icon_${id}`,
        filename: `${def.iconId || id}.svg`,
        relativePath: `art/ui/${id}`,
        category: 'icons',
        format: 'svg',
        thumbnailUrl: `data:image/svg+xml;utf8,${encodeURIComponent(def.fallbackSvg)}`,
      });
    });

    this.assets = list;
    this.renderAssetGrid();
  }

  private async fetchUserAssets(): Promise<void> {
    try {
      const res = await fetch('/__editor-api/assets/list');
      if (res.ok) {
        const userAssets: AssetMetadata[] = await res.json();
        this.assets = [...this.assets.filter((a) => a.category !== 'user'), ...userAssets];
        this.renderAssetGrid();
      }
    } catch {
      // Dev API might be offline
    }
  }

  private async uploadFile(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    // Create local object URL preview immediately
    const localUrl = URL.createObjectURL(file);
    const tempAsset: AssetMetadata = {
      id: `user_${Date.now()}_${file.name}`,
      filename: file.name,
      relativePath: `/assets/user/${file.name}`,
      category: 'user',
      format: file.type.split('/')[1] || 'png',
      thumbnailUrl: localUrl,
    };
    this.assets.unshift(tempAsset);
    this.renderAssetGrid();

    try {
      const res = await fetch('/__editor-api/assets/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const result = await res.json();
        tempAsset.relativePath = result.url || tempAsset.relativePath;
      }
    } catch {
      console.warn('[AssetBrowser] Failed to upload to dev server; using memory preview.');
    }
  }

  private renderAssetGrid(): void {
    this.assetGridEl.innerHTML = '';

    const filtered = this.assets.filter((a) => {
      if (this.currentCategory !== 'all' && a.category !== this.currentCategory) return false;
      if (this.searchQuery && !a.filename.toLowerCase().includes(this.searchQuery) && !a.id.toLowerCase().includes(this.searchQuery)) {
        return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      this.assetGridEl.innerHTML = '<div style="grid-column:1/-1; padding:24px; text-align:center; color:#64748b;">No matching assets found.</div>';
      return;
    }

    filtered.forEach((asset) => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 4px;
        padding: 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transition: all 0.1s;
      `;

      card.addEventListener('mouseenter', () => (card.style.borderColor = '#3b82f6'));
      card.addEventListener('mouseleave', () => (card.style.borderColor = '#334155'));

      card.addEventListener('click', () => {
        this.onSelectAssetCallback?.(asset);
      });

      const img = document.createElement('img');
      img.src = asset.thumbnailUrl;
      img.style.cssText = 'width: 60px; height: 60px; object-fit: contain; margin-bottom: 4px; background: #0f172a; border-radius: 3px;';
      card.appendChild(img);

      const name = document.createElement('div');
      name.style.cssText = 'font-size: 10px; color: #cbd5e1; width: 100%; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
      name.textContent = asset.filename;
      name.title = asset.filename;
      card.appendChild(name);

      this.assetGridEl.appendChild(card);
    });
  }

  private renderReferenceSection(): void {
    this.referenceSectionEl.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <strong style="color: #94a3b8; font-size: 10px; letter-spacing: 0.5px;">📸 REFERENCE OVERLAY</strong>
        <label style="font-size: 10px; display: flex; align-items: center; gap: 4px; cursor: pointer;">
          <input type="checkbox" id="refVisibleToggle" ${this.referenceConfig.visible ? 'checked' : ''} />
          Visible
        </label>
      </div>
      <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px;">
        <input type="text" id="refUrlInput" placeholder="Image URL / upload..." value="${this.referenceConfig.imageUrl}" style="flex:1; background:#1e293b; border:1px solid #334155; border-radius:3px; padding:2px 4px; color:#f8fafc; font-size:10px;" />
        <button id="refUploadBtn" style="background:#334155; color:#cbd5e1; border:none; border-radius:3px; padding:2px 6px; font-size:10px; cursor:pointer;">Upload</button>
        <input type="file" id="refFileInput" accept="image/*" style="display:none;" />
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <span style="font-size: 10px; color: #64748b;">Opacity:</span>
        <input type="range" id="refOpacityRange" min="0" max="1" step="0.05" value="${this.referenceConfig.opacity}" style="flex:1; height:4px;" />
        <span id="refOpacityVal" style="font-size: 10px; width: 28px;">${Math.round(this.referenceConfig.opacity * 100)}%</span>
      </div>
    `;

    const visibleToggle = this.referenceSectionEl.querySelector('#refVisibleToggle') as HTMLInputElement;
    const urlInput = this.referenceSectionEl.querySelector('#refUrlInput') as HTMLInputElement;
    const uploadBtn = this.referenceSectionEl.querySelector('#refUploadBtn') as HTMLButtonElement;
    const fileInput = this.referenceSectionEl.querySelector('#refFileInput') as HTMLInputElement;
    const opacityRange = this.referenceSectionEl.querySelector('#refOpacityRange') as HTMLInputElement;
    const opacityVal = this.referenceSectionEl.querySelector('#refOpacityVal') as HTMLElement;

    visibleToggle?.addEventListener('change', () => {
      this.referenceConfig.visible = visibleToggle.checked;
      this.onReferenceChangeCallback?.(this.referenceConfig);
    });

    urlInput?.addEventListener('change', () => {
      this.referenceConfig.imageUrl = urlInput.value.trim();
      this.onReferenceChangeCallback?.(this.referenceConfig);
    });

    uploadBtn?.addEventListener('click', () => fileInput.click());
    fileInput?.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const localUrl = URL.createObjectURL(file);
        this.referenceConfig.imageUrl = localUrl;
        this.referenceConfig.visible = true;
        urlInput.value = file.name;
        visibleToggle.checked = true;
        this.onReferenceChangeCallback?.(this.referenceConfig);
      }
    });

    opacityRange?.addEventListener('input', () => {
      const val = parseFloat(opacityRange.value);
      this.referenceConfig.opacity = val;
      opacityVal.textContent = `${Math.round(val * 100)}%`;
      this.onReferenceChangeCallback?.(this.referenceConfig);
    });
  }
}
