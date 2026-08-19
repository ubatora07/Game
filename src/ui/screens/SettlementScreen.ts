import { settlementSystem } from '../../systems/SettlementSystem';
import { getAllSettlementBuildingDefs } from '../../content/settlementCatalog';
import { getAllSettlementNPCDefs } from '../../content/settlementNPCs';
import { SettlementVisualRenderer } from '../art/SettlementVisualRenderer';
import { modalManager } from '../components/ModalManager';
import { events } from '../../core/EventBus';
import { SettlementBuildingId, SettlementNPCId } from '../../core/settlement/SettlementTypes';
import { t } from '../../services/i18n/I18nService';

export class SettlementScreen {
  private el: HTMLElement;

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'settlement-screen-container pixel-fantasy-screen';
    this.el.style.cssText = 'display:flex; flex-direction:column; width:100%; height:100%; overflow-y:auto; padding:12px; box-sizing:border-box; gap:12px; background:radial-gradient(circle at 50% 20%, #1c1917 0%, #09090b 100%);';

    this.render();
    this.bindEvents();
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  private bindEvents(): void {
    events.on('settlement:building_upgraded' as any, () => this.render());
    events.on('settlement:unlocked' as any, () => this.render());
    events.on('settlement:harvested' as any, () => this.render());
    events.on('settlement:npc_interacted' as any, () => this.render());
    document.addEventListener('i18n:change', () => this.render());
  }

  public render(): void {
    const sState = settlementSystem.getState();
    const isOwned = sState.isOwned;

    if (!isOwned) {
      this.el.innerHTML = `
        <div style="max-width:500px; margin:40px auto; text-align:center; padding:24px; background:rgba(28,25,23,0.9); border:2px solid #d97706; border-radius:8px; box-shadow:0 0 30px rgba(0,0,0,0.9);">
          <div style="font-size:42px; margin-bottom:12px;">🏰</div>
          <div style="font-size:11px; color:#f59e0b; font-weight:bold; letter-spacing:1px; text-transform:uppercase; font-family:var(--font-display);">
            ✦ ${t('settlement.unclaimed_label')} ✦
          </div>
          <h2 style="font-family:var(--font-display); font-size:22px; color:#fef08a; margin:4px 0 12px 0;">
            ${t('settlement.claim_title')}
          </h2>
          <p style="color:#cbd5e1; font-size:13px; line-height:1.5; margin-bottom:20px;">
            ${t('settlement.claim_desc')}
          </p>
          <button id="btn-claim-settlement" style="padding:12px 24px; background:linear-gradient(135deg, #d97706, #b45309); border:1px solid #f59e0b; border-radius:4px; color:#ffffff; font-family:var(--font-display); font-weight:900; font-size:15px; letter-spacing:1px; cursor:pointer; box-shadow:0 0 15px rgba(217,119,6,0.6);">
            ${t('settlement.claim_action')}
          </button>
        </div>
      `;

      this.el.querySelector('#btn-claim-settlement')?.addEventListener('click', () => {
        settlementSystem.unlockSettlement('Mountain Haven');
        this.render();
      });
      return;
    }

    const mats = settlementSystem.getMaterials();
    const buildings = sState.buildings;
    const npcs = sState.npcs;

    this.el.innerHTML = `
      <!-- Settlement Header Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; background:rgba(28,25,23,0.9); border:1.5px solid #b45309; border-radius:6px; padding:10px 14px; box-shadow:0 2px 8px rgba(0,0,0,0.6);">
        <div>
          <div style="font-size:10px; color:#f59e0b; font-weight:bold; letter-spacing:0.5px; font-family:var(--font-display);">
            ✦ ${t('settlement.header_level', { level: sState.settlementLevel })} ✦
          </div>
          <h2 style="font-family:var(--font-display); font-size:18px; color:#fef08a; margin:2px 0 0 0;">
            ${sState.settlementName}
          </h2>
        </div>

        <!-- Materials & Ratings Summary -->
        <div style="display:flex; align-items:center; gap:10px; font-size:11px; color:#cbd5e1; flex-wrap:wrap;">
          <div style="background:rgba(0,0,0,0.5); padding:4px 8px; border-radius:4px; border:1px solid #78350f;">
            🪵 <b style="color:#fb923c;">${mats.wood}</b>
          </div>
          <div style="background:rgba(0,0,0,0.5); padding:4px 8px; border-radius:4px; border:1px solid #78350f;">
            🪨 <b style="color:#cbd5e1;">${mats.stone}</b>
          </div>
          <div style="background:rgba(0,0,0,0.5); padding:4px 8px; border-radius:4px; border:1px solid #78350f;">
            ⚙️ <b style="color:#38bdf8;">${mats.iron}</b>
          </div>
          <div style="background:rgba(0,0,0,0.5); padding:4px 8px; border-radius:4px; border:1px solid #f59e0b;">
            🛡️ ${t('settlement.defense_short')}: <b style="color:#fde047;">${sState.defenseRating}</b>
          </div>
          <div style="background:rgba(0,0,0,0.5); padding:4px 8px; border-radius:4px; border:1px solid #10b981;">
            ⭐ ${t('settlement.prosperity_short')}: <b style="color:#34d399;">${sState.prosperityRating}</b>
          </div>
          <button id="btn-harvest-mats" style="padding:4px 10px; background:linear-gradient(135deg, #10b981, #059669); border:1px solid #34d399; border-radius:4px; color:#ffffff; font-family:var(--font-display); font-weight:bold; font-size:11px; cursor:pointer;">
            🌾 ${t('settlement.harvest')}
          </button>
        </div>
      </div>

      <!-- UX IA V3: Settlement domain services -->
      <section class="settlement-services-panel" aria-label="${t('domain.settlement.actions')}">
        <div class="settlement-services-heading">${t('domain.settlement.actions')}</div>
        <div class="settlement-services-grid">
          <button type="button" class="settlement-service-action" data-modal-id="forge_crafting_modal">
            <span class="settlement-service-icon" aria-hidden="true">◆</span>
            <span><strong>${t('nav.forge')}</strong><small>${t('domain.settlement.forge_desc')}</small></span>
          </button>
          <button type="button" class="settlement-service-action" data-modal-id="market_modal">
            <span class="settlement-service-icon" aria-hidden="true">◇</span>
            <span><strong>${t('nav.market')}</strong><small>${t('domain.settlement.market_desc')}</small></span>
          </button>
          <button type="button" class="settlement-service-action" data-modal-id="mercenary_guild_modal">
            <span class="settlement-service-icon" aria-hidden="true">⚑</span>
            <span><strong>${t('nav.mercenaries')}</strong><small>${t('domain.settlement.mercenaries_desc')}</small></span>
          </button>
          <button type="button" class="settlement-service-action" data-modal-id="settlement_raid_modal">
            <span class="settlement-service-icon" aria-hidden="true">⚔</span>
            <span><strong>${t('nav.raid_defense')}</strong><small>${t('domain.settlement.raids_desc')}</small></span>
          </button>
          <button type="button" class="settlement-service-action" data-modal-id="settlement_story_modal">
            <span class="settlement-service-icon" aria-hidden="true">▤</span>
            <span><strong>${t('nav.chronicles')}</strong><small>${t('domain.settlement.chronicles_desc')}</small></span>
          </button>
        </div>
      </section>

      <!-- Panoramic Visual Canvas with Interactive Building Plots -->
      <div class="settlement-canvas-wrapper" style="position:relative; width:100%; height:260px; min-height:240px; border:2px solid #78350f; border-radius:6px; overflow:hidden; box-shadow:0 0 20px rgba(0,0,0,0.8); background:#0c0a09;">
        ${SettlementVisualRenderer.getSettlementPanoramaSvg(buildings, sState.settlementLevel)}

        <!-- Interactive Building Plots Placed on Canvas -->
        <div class="settlement-interactive-layer" style="position:absolute; top:0; left:0; width:100%; height:100%; display:grid; grid-template-columns:repeat(4, 1fr); grid-template-rows:1fr 1fr; gap:6px; padding:12px; box-sizing:border-box; pointer-events:none;">
          ${getAllSettlementBuildingDefs().map(def => {
            const b = buildings[def.id];
            const structSvg = SettlementVisualRenderer.getBuildingStructureSvg(def.id, b ? b.level : 0);
            return `
              <div class="settlement-plot-node" data-building-id="${def.id}" style="pointer-events:auto; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; cursor:pointer; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.8)); transition:transform 0.15s ease;">
                <div style="width:52px; height:52px; display:flex; align-items:center; justify-content:center;">
                  ${structSvg}
                </div>
                <div style="background:rgba(0,0,0,0.8); border:1px solid #d97706; padding:1px 6px; border-radius:3px; font-size:9px; font-weight:bold; color:#fef08a; font-family:var(--font-display); margin-top:-4px; white-space:nowrap;">
                  ${t(def.nameKey).split(' ')[0]} ${b && b.isConstructed ? t('common.level_short', { level: b.level }) : t('settlement.plot')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Domain Residents Roster Strip -->
      <div style="background:rgba(28,25,23,0.85); border:1.5px solid #78350f; border-radius:6px; padding:10px 14px;">
        <div style="font-size:11px; color:#f59e0b; font-weight:bold; margin-bottom:8px; font-family:var(--font-display);">
          ✦ ${t('settlement.residents_title')} ✦
        </div>
        <div class="settlement-npc-row" style="display:flex; gap:12px; overflow-x:auto; padding-bottom:4px;">
          ${getAllSettlementNPCDefs().map(npcDef => {
            const npcState = npcs[npcDef.id];
            const isUnlocked = npcState ? npcState.isUnlocked : false;
            return `
              <div class="npc-interactive-card" data-npc-id="${npcDef.id}" style="opacity:${isUnlocked ? '1' : '0.4'}; cursor:${isUnlocked ? 'pointer' : 'not-allowed'}; display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.5); border:1px solid ${isUnlocked ? '#d97706' : '#451a03'}; border-radius:4px; padding:6px 10px; min-width:140px;">
                <div style="width:30px; height:30px; border-radius:50%; background:rgba(0,0,0,0.6); border:1px solid #f59e0b; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  ${npcDef.avatarSvg}
                </div>
                <div>
                  <div style="font-size:11px; font-weight:bold; color:${isUnlocked ? '#fef08a' : '#78716c'}; font-family:var(--font-display);">${t(npcDef.nameKey).split(' ')[0]}</div>
                  <div style="font-size:9px; color:#94a3b8;">${isUnlocked ? t('settlement.affinity', { value: npcState?.affinity || 0 }) : t('common.locked')}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Building Management Matrix -->
      <div style="background:rgba(28,25,23,0.85); border:1.5px solid #78350f; border-radius:6px; padding:12px;">
        <div style="font-size:11px; color:#f59e0b; font-weight:bold; margin-bottom:10px; font-family:var(--font-display);">
          ✦ ${t('settlement.structures_title')} ✦
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px;">
          ${getAllSettlementBuildingDefs().map(def => {
            const b = buildings[def.id];
            const lvl = b ? b.level : 0;
            const isConstructed = b ? b.isConstructed : false;
            return `
              <div class="building-card-tile" data-building-id="${def.id}" style="background:rgba(12,10,9,0.7); border:1px solid #78350f; border-radius:4px; padding:8px 10px; cursor:pointer; transition:all 0.15s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <div style="font-size:12px; font-weight:bold; color:#fef08a; font-family:var(--font-display);">${t(def.nameKey)}</div>
                  <div style="font-size:10px; background:rgba(217,119,6,0.2); border:1px solid #d97706; padding:1px 5px; border-radius:3px; color:#fde047; font-family:var(--font-display); font-weight:bold;">
                    ${isConstructed ? t('common.level_short', { level: lvl }) : t('settlement.plot')}
                  </div>
                </div>
                <div style="font-size:10px; color:#94a3b8; margin-bottom:6px; line-height:1.35;">${t(def.descKey)}</div>
                <div style="font-size:10px; color:#34d399; font-weight:bold;">${t('settlement.inspect_upgrade')} ➔</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Bind settlement-domain service shortcuts.
    this.el.querySelectorAll<HTMLElement>('.settlement-service-action').forEach((button) => {
      button.addEventListener('click', () => {
        const modalId = button.dataset.modalId;
        if (modalId) {
          events.emit('modal:open', { modalId });
        }
      });
    });

    // Bind Plot clicks
    this.el.querySelectorAll('.settlement-plot-node, .building-card-tile').forEach(plot => {
      plot.addEventListener('click', () => {
        const bId = plot.getAttribute('data-building-id') as SettlementBuildingId;
        if (bId) {
          modalManager.open('building_inspection_modal', { buildingId: bId });
        }
      });
    });

    // Bind NPC clicks
    this.el.querySelectorAll('.npc-interactive-card').forEach(card => {
      card.addEventListener('click', () => {
        const npcId = card.getAttribute('data-npc-id') as SettlementNPCId;
        const npcState = npcs[npcId];
        if (npcId && npcState?.isUnlocked) {
          modalManager.open('npc_dialogue_modal', { npcId });
        }
      });
    });

    // Bind Harvest
    this.el.querySelector('#btn-harvest-mats')?.addEventListener('click', () => {
      const harvest = settlementSystem.harvestProduction();
      if (harvest.minutes > 0) {
        events.emit('toast:show', {
          message: t('settlement.harvest_complete', { wood: harvest.wood, stone: harvest.stone, iron: harvest.iron }),
          type: 'success',
        });
      } else {
        events.emit('toast:show', {
          message: t('settlement.harvest_recharging'),
          type: 'info',
        });
      }
      this.render();
    });
  }
}
