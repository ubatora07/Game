import { store } from '../../core/FantasyState';
import { WORLDS } from '../../content/worlds';
import { WORLD_ENEMY_POOLS, ENEMIES } from '../../content/enemies';

export class WorldView {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'fantasy-tab-screen';

    this.render();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public update(): void {
    this.render();
  }

  private render(): void {
    const worldIds = [1, 2, 3];

    this.container.innerHTML = `
      <div style="text-align:center; margin-bottom:8px;">
        <h2 style="font-size:16px; color:var(--f-gold-bright);">WORLD MAP & REGIONS</h2>
        <p style="font-size:12px; color:var(--f-text-dim);">Defeat stage 10 bosses to conquer regions and journey deeper!</p>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px;">
        ${worldIds.map((wId) => this.renderWorldCard(wId)).join('')}
      </div>
    `;
  }

  private renderWorldCard(worldId: number): string {
    const s = store.get();
    const worldDef = WORLDS[worldId];
    const pool = WORLD_ENEMY_POOLS[worldId];
    const bossDef = ENEMIES[pool.boss];

    const isCurrent = s.world.currentWorldId === worldId;
    const isCleared = s.world.highestWorld > worldId;
    const isLocked = s.world.highestWorld < worldId;

    let statusBadge = '';
    let cardBorder = 'var(--f-border-subtle)';

    if (isCleared) {
      statusBadge = '<span style="color:#22c55e; font-weight:800; font-size:12px;">✔️ CONQUERED</span>';
      cardBorder = 'rgba(34, 197, 94, 0.4)';
    } else if (isCurrent) {
      statusBadge = `<span style="color:#fbbf24; font-weight:800; font-size:12px;">⚡ ACTIVE (Stage ${s.world.currentStageNumber}/10)</span>`;
      cardBorder = 'var(--f-border-gold)';
    } else {
      statusBadge = '<span style="color:#71717a; font-weight:800; font-size:12px;">🔒 LOCKED</span>';
    }

    return `
      <div class="fantasy-card" style="border-color:${cardBorder}; display:flex; flex-direction:column; gap:8px; opacity:${isLocked ? '0.6' : '1.0'};">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="font-size:15px; font-weight:800; color:${isCurrent ? 'var(--f-gold-bright)' : 'var(--f-text-main)'};">
              World ${worldId}: ${worldDef.name}
            </h3>
            <div style="font-size:11px; color:var(--f-text-dim);">${worldDef.subtitle}</div>
          </div>
          ${statusBadge}
        </div>

        <div style="background:var(--f-bg-darker); border:1px solid var(--f-border-subtle); border-radius:var(--f-radius-sm); padding:8px; display:flex; justify-content:space-between; align-items:center; font-size:12px;">
          <div>
            <span style="color:var(--f-text-dim);">Region Boss:</span>
            <span style="color:#ef4444; font-weight:700; margin-left:4px;">${bossDef.name}</span>
          </div>
          <div>
            <span style="color:var(--f-text-dim);">Max Stages:</span>
            <span style="color:var(--f-text-main); font-weight:700; margin-left:4px;">10</span>
          </div>
        </div>
      </div>
    `;
  }
}
