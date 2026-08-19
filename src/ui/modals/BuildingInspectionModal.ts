import { ModalInstance, modalManager } from '../components/ModalManager';
import { SettlementBuildingId } from '../../core/settlement/SettlementTypes';
import { getSettlementBuildingDef } from '../../content/settlementCatalog';
import { settlementSystem } from '../../systems/SettlementSystem';
import { SettlementVisualRenderer } from '../art/SettlementVisualRenderer';
import { t } from '../../services/i18n/I18nService';

function buildingBlockReason(reason?: string): string {
  if (!reason) return t('settlement.reason.unknown');
  const settlementLevel = reason.match(/^Requires Settlement Level (\d+)$/);
  if (settlementLevel) return t('settlement.reason.requires_level', { level: settlementLevel[1] });

  const reasons: Record<string, string> = {
    'Invalid building': 'settlement.reason.invalid_building',
    'Max level reached': 'settlement.reason.max_level',
    'Insufficient Gold': 'settlement.reason.insufficient_gold',
    'Insufficient Wood': 'settlement.reason.insufficient_wood',
    'Insufficient Stone': 'settlement.reason.insufficient_stone',
    'Insufficient Iron': 'settlement.reason.insufficient_iron',
  };
  return reasons[reason] ? t(reasons[reason]) : reason;
}

function modifierLabel(target: string): string {
  return t(`settlement.modifier.${target}`);
}

export const BuildingInspectionModal: ModalInstance = {
  id: 'building_inspection_modal',
  render: (data?: { buildingId?: SettlementBuildingId }) => {
    const bId = data?.buildingId || 'throne_hall';
    const def = getSettlementBuildingDef(bId);
    const bState = settlementSystem.getBuildingState(bId);

    const el = document.createElement('div');
    el.className = 'building-inspection-modal-container pixel-fantasy-modal';
    el.style.cssText = 'max-width:440px; padding:var(--space-16); background:radial-gradient(ellipse at 50% 20%, #1c1917 0%, #0c0a09 100%); border:2px solid #d97706; border-radius:var(--radius-06); box-shadow:var(--shadow-modal);';

    if (!def || !bState) {
      el.innerHTML = `<p style="color:#94a3b8;">${t('settlement.building.not_found')}</p>`;
      return el;
    }

    const check = settlementSystem.canConstructOrUpgrade(bId);
    const structureSvg = SettlementVisualRenderer.getBuildingStructureSvg(bId, bState.level);

    el.innerHTML = `
      <div style="display:flex; align-items:center; gap:var(--space-12); margin-bottom:var(--space-12); border-bottom:1px solid #78350f; padding-bottom:var(--space-10);">
        <div style="width:54px; height:54px; border-radius:var(--radius-06); background:#0c0a09; border:1.5px solid #d97706; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-inset-soft); flex-shrink:0;">
          ${structureSvg}
        </div>
        <div style="flex:1;">
          <div style="font-size:10px; color:#f59e0b; font-weight:bold; letter-spacing:0.5px; font-family:var(--font-display);">
            ${bState.isConstructed ? t('settlement.building.level_structure', { level: bState.level }) : t('settlement.building.unconstructed_plot')}
          </div>
          <h3 style="font-family:var(--font-display); font-size:16px; color:#fef08a; margin:var(--space-02) 0 var(--space-02) 0;">
            ${t(def.nameKey)}
          </h3>
          <div style="font-size:11px; color:#94a3b8;">${t('settlement.building.plot_max', { plot: def.plotSlotId.toUpperCase(), max: def.maxLevel })}</div>
        </div>
      </div>

      <div style="background:rgba(28,25,23,0.9); border:1px solid #78350f; border-radius:var(--radius-04); padding:var(--space-10); margin-bottom:var(--space-12); font-size:11px; color:#cbd5e1; line-height:1.4;">
        <p style="margin:0 0 var(--space-06) 0; color:#fef08a;">${t(def.descKey)}</p>
        <p style="margin:0; color:#38bdf8; font-weight:bold;">✦ ${t(def.functionalityKey)}</p>
      </div>

      <div style="margin-bottom:var(--space-12); background:rgba(0,0,0,0.4); padding:var(--space-08) var(--space-10); border-radius:var(--radius-04); font-size:11px;">
        <div style="color:#f59e0b; font-weight:bold; margin-bottom:var(--space-04); font-family:var(--font-display);">${t('settlement.building.active_bonuses')}</div>
        ${def.modifiers.map(m => `
          <div style="display:flex; justify-content:space-between; color:#cbd5e1; margin-bottom:var(--space-02);">
            <span>• ${t('settlement.building.bonus_line', { stat: modifierLabel(m.target) })}</span>
            <b style="color:#34d399;">+${Math.round(m.valuePerLevel * bState.level * 100)}%</b>
          </div>
        `).join('')}
      </div>

      ${bState.level < def.maxLevel ? `
        <div style="margin-bottom:var(--space-14); background:rgba(28,25,23,0.8); border:1px solid #78350f; padding:var(--space-08) var(--space-10); border-radius:var(--radius-04);">
          <div style="color:#fef08a; font-weight:bold; font-size:11px; margin-bottom:var(--space-06); font-family:var(--font-display);">${t('settlement.building.upgrade_requirements', { level: bState.level + 1 })}</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-06); font-size:11px;">
            <div>🪙 ${t('currency.gold')}: <b style="color:#fde047;">${check.cost.gold}</b></div>
            <div>🪵 ${t('settlement.resource.wood')}: <b style="color:#fb923c;">${check.cost.wood}</b></div>
            <div>🪨 ${t('settlement.resource.stone')}: <b style="color:#94a3b8;">${check.cost.stone}</b></div>
            <div>⚙️ ${t('settlement.resource.iron')}: <b style="color:#38bdf8;">${check.cost.iron}</b></div>
          </div>
        </div>
      ` : `<div style="color:#34d399; font-weight:bold; text-align:center; margin-bottom:var(--space-12);">★ ${t('settlement.building.max_level_achieved')} ★</div>`}

      <div style="display:flex; flex-direction:column; gap:var(--space-08);">
        ${bId === 'forge' && bState.isConstructed ? `
          <button id="btn-open-forge-service" style="width:100%; padding:var(--space-10); background:linear-gradient(135deg, #ef4444, #b91c1c); border:1px solid #f87171; border-radius:var(--radius-04); color:#ffffff; font-family:var(--font-display); font-weight:bold; font-size:13px; cursor:pointer; box-shadow:var(--glow-danger);">
            ✦ ${t('settlement.building.enter_forge')} ✦
          </button>
        ` : ''}
        ${bState.level < def.maxLevel ? `
          <button id="btn-upgrade-building" ${!check.canUpgrade ? 'disabled' : ''} style="width:100%; padding:var(--space-10); background:${check.canUpgrade ? 'linear-gradient(135deg, #d97706, #b45309)' : '#292524'}; border:1px solid ${check.canUpgrade ? '#f59e0b' : '#451a03'}; border-radius:var(--radius-04); color:${check.canUpgrade ? '#ffffff' : '#78716c'}; font-family:var(--font-display); font-weight:bold; font-size:13px; cursor:${check.canUpgrade ? 'pointer' : 'not-allowed'}; box-shadow:${check.canUpgrade ? 'var(--glow-gold)' : 'none'};">
            ${check.canUpgrade ? (bState.isConstructed ? t('settlement.building.upgrade_to_level', { level: bState.level + 1 }) : t('settlement.building.construct')) : t('settlement.building.blocked', { reason: buildingBlockReason(check.reason) })}
          </button>
        ` : ''}
        <button id="btn-close-inspection" style="width:100%; padding:var(--space-08); background:#1c1917; border:1px solid #78350f; border-radius:var(--radius-04); color:#cbd5e1; font-family:var(--font-display); font-size:12px; cursor:pointer;">
          ${t('btn.close')}
        </button>
      </div>
    `;

    el.querySelector('#btn-open-forge-service')?.addEventListener('click', () => {
      modalManager.close('building_inspection_modal');
      modalManager.open('forge_crafting_modal');
    });

    el.querySelector('#btn-upgrade-building')?.addEventListener('click', () => {
      if (settlementSystem.upgradeBuilding(bId)) {
        modalManager.close('building_inspection_modal');
      }
    });

    el.querySelector('#btn-close-inspection')?.addEventListener('click', () => {
      modalManager.close('building_inspection_modal');
    });

    return el;
  },
};
