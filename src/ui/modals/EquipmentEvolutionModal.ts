import { ModalInstance, modalManager } from '../components/ModalManager';
import { craftingEquipmentSystem } from '../../systems/CraftingEquipmentSystem';
import { getEquipmentTemplate } from '../../content/equipmentCatalog';
import { store } from '../../core/GameState';
import { CraftingMaterialId } from '../../core/crafting/CraftingTypes';
import { t } from '../../services/i18n/I18nService';

function evolutionReasonText(reason?: string): string {
  if (!reason) return t('equipment.evolution.blocked');
  const forgeMatch = reason.match(/^Requires Forge Level (\d+)$/);
  if (forgeMatch) return t('equipment.evolution.requires_forge', { level: Number(forgeMatch[1]) });
  if (reason === 'Insufficient Gold for Evolution') return t('equipment.evolution.insufficient_gold');
  if (reason === 'Max Evolution Stage reached') return t('equipment.evolution.max_stage');
  if (reason === 'No higher evolution tier defined') return t('equipment.evolution.no_higher_tier');
  if (reason === 'No evolution cost configured') return t('equipment.evolution.no_cost');
  const materialMatch = reason.match(/^Insufficient (material_[a-z0-9_]+)$/i);
  if (materialMatch) return t('equipment.evolution.insufficient_material', { material: t(`material.${materialMatch[1].replace('material_', '')}`) });
  return t('equipment.evolution.blocked');
}

export const EquipmentEvolutionModal: ModalInstance = {
  id: 'equipment_evolution_modal',
  render: (data?: { itemId?: string }) => {
    const itemId = data?.itemId || '';
    const item = craftingEquipmentSystem.getItemById(itemId);

    const el = document.createElement('div');
    el.className = 'equipment-evolution-modal-container pixel-fantasy-modal';
    el.style.cssText = 'max-width:520px; padding:16px; background:radial-gradient(ellipse at 50% 15%, #1c1917 0%, #0c0a09 100%); border:2px solid #f59e0b; border-radius:6px; box-shadow:0 0 35px rgba(0,0,0,0.9), inset 0 0 20px rgba(245,158,11,0.2);';

    if (!item) {
      el.innerHTML = `<p style="color:#94a3b8;">${t('equipment.evolution.item_not_found')}</p>`;
      return el;
    }

    const check = craftingEquipmentSystem.canEvolveItem(item.id);
    const nextTemplate = check.nextTemplate;
    const currentTemplate = getEquipmentTemplate(item.templateId);
    const mats = craftingEquipmentSystem.getMaterials();

    el.innerHTML = `
      <div style="text-align:center; margin-bottom:12px;">
        <div style="font-size:10px; color:#f59e0b; font-weight:bold; letter-spacing:1px; text-transform:uppercase; font-family:var(--font-display);">
          ✦ ${t('equipment.evolution.forge_label')} ✦
        </div>
        <h3 style="font-family:var(--font-display); font-size:18px; color:#fef08a; margin:2px 0;">
          ${t('equipment.evolution.title')}
        </h3>
        <p style="color:#cbd5e1; font-size:11px; margin:0;">
          ${t('equipment.evolution.subtitle')}
        </p>
      </div>

      <!-- Before vs After Evolution Comparison -->
      <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:8px; align-items:center; margin-bottom:14px;">
        <!-- Current Stage Item -->
        <div style="background:rgba(28,25,23,0.85); border:1.5px solid #78350f; border-radius:4px; padding:10px; text-align:center;">
          <div style="width:36px; height:36px; margin:0 auto 6px auto; border-radius:4px; background:#0c0a09; display:flex; align-items:center; justify-content:center;">
            ${item.iconSvg}
          </div>
          <div style="font-size:11px; font-weight:bold; color:#fef08a; font-family:var(--font-display);">${item.name}</div>
          <div style="font-size:9px; color:#94a3b8;">${t('equipment.stage_rarity', { stage: item.evolutionStage, rarity: item.rarity.toUpperCase() })}</div>
          <div style="font-size:10px; color:#cbd5e1; margin-top:6px;">
            ${item.baseStats.attack ? `<div>⚔️ ${t('equipment.stat.attack_short')}: <b>${item.baseStats.attack}</b></div>` : ''}
            ${item.baseStats.defense ? `<div>🛡️ ${t('equipment.stat.defense_short')}: <b>${item.baseStats.defense}</b></div>` : ''}
          </div>
        </div>

        <!-- Ascension Arrow -->
        <div style="font-size:18px; color:#f59e0b; font-weight:bold;">➔</div>

        <!-- Next Stage Preview -->
        ${
          nextTemplate
            ? `
          <div style="background:rgba(217,119,6,0.15); border:1.5px solid #f59e0b; border-radius:4px; padding:10px; text-align:center; box-shadow:0 0 15px rgba(245,158,11,0.3);">
            <div style="width:36px; height:36px; margin:0 auto 6px auto; border-radius:4px; background:#0c0a09; display:flex; align-items:center; justify-content:center; box-shadow:0 0 8px rgba(245,158,11,0.5);">
              ${nextTemplate.iconSvg}
            </div>
            <div style="font-size:11px; font-weight:bold; color:#fde047; font-family:var(--font-display);">${nextTemplate.defaultName}</div>
            <div style="font-size:9px; color:#38bdf8;">${t('equipment.stage_rarity', { stage: nextTemplate.evolutionStage, rarity: nextTemplate.rarity.toUpperCase() })}</div>
            <div style="font-size:10px; color:#34d399; margin-top:6px; font-weight:bold;">
              ${nextTemplate.baseStats.attack ? `<div>⚔️ ${t('equipment.stat.attack_short')}: +${nextTemplate.baseStats.attack}</div>` : ''}
              ${nextTemplate.baseStats.defense ? `<div>🛡️ ${t('equipment.stat.defense_short')}: +${nextTemplate.baseStats.defense}</div>` : ''}
            </div>
          </div>
        `
            : `<div style="color:#94a3b8; font-size:11px;">${t('equipment.evolution.max_stage')}</div>`
        }
      </div>

      <!-- Preserved Affixes & Newly Awakened Perks -->
      ${
        nextTemplate
          ? `
        <div style="background:rgba(0,0,0,0.5); border:1px solid #78350f; border-radius:4px; padding:8px 10px; margin-bottom:12px; font-size:10px;">
          <div style="color:#f59e0b; font-weight:bold; margin-bottom:4px;">✦ ${t('equipment.evolution.awakened_affixes')}:</div>
          ${nextTemplate.affixes.map((a: any) => `<div style="color:#34d399;">• ${a.label}</div>`).join('')}
          <div style="color:#94a3b8; font-style:italic; margin-top:4px;">${t('equipment.evolution.affixes_preserved')}</div>
        </div>

        <!-- Evolution Requirements -->
        <div style="background:rgba(28,25,23,0.9); border:1px solid #78350f; border-radius:4px; padding:8px 10px; margin-bottom:14px; font-size:10px;">
          <div style="color:#fef08a; font-weight:bold; margin-bottom:4px;">${t('equipment.evolution.costs')}:</div>
          <div>🪙 ${t('currency.gold')}: ${store.get().gold >= (currentTemplate?.evolutionCost?.gold || 0) ? '✓' : '✗'} <b>${currentTemplate?.evolutionCost?.gold}</b></div>
          ${Object.entries(currentTemplate?.evolutionCost?.materials || {})
            .map(
              ([mId, req]) => `
            <div>📦 ${t(`material.${mId.replace('material_', '')}`)}: ${mats[mId as CraftingMaterialId] >= (req || 0) ? '✓' : '✗'} <b>${req}</b> (${t('common.have', { value: mats[mId as CraftingMaterialId] || 0 })})</div>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }

      <!-- Action Buttons -->
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${
          nextTemplate
            ? `
          <button id="btn-confirm-evolution" ${!check.canEvolve ? 'disabled' : ''} style="width:100%; padding:10px; background:${check.canEvolve ? 'linear-gradient(135deg, #d97706, #b45309)' : '#292524'}; border:1px solid ${check.canEvolve ? '#f59e0b' : '#451a03'}; border-radius:4px; color:${check.canEvolve ? '#ffffff' : '#78716c'}; font-family:var(--font-display); font-weight:900; font-size:13px; letter-spacing:1px; cursor:${check.canEvolve ? 'pointer' : 'not-allowed'}; box-shadow:${check.canEvolve ? '0 0 15px rgba(217,119,6,0.6)' : 'none'};">
            ${check.canEvolve ? `✦ ${t('equipment.evolution.confirm')} ✦` : t('equipment.evolution.blocked_reason', { reason: evolutionReasonText(check.reason) })}
          </button>
        `
            : ''
        }
        <button id="btn-close-evolution" style="width:100%; padding:8px; background:#1c1917; border:1px solid #78350f; border-radius:4px; color:#cbd5e1; font-family:var(--font-display); font-size:12px; cursor:pointer;">
          ${t('btn.cancel')}
        </button>
      </div>
    `;

    el.querySelector('#btn-confirm-evolution')?.addEventListener('click', () => {
      const res = craftingEquipmentSystem.evolveItem(item.id);
      if (res.success) {
        modalManager.close('equipment_evolution_modal');
      }
    });

    el.querySelector('#btn-close-evolution')?.addEventListener('click', () => {
      modalManager.close('equipment_evolution_modal');
    });

    return el;
  },
};
