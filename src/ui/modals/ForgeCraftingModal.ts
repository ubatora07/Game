import { ModalInstance, modalManager } from '../components/ModalManager';
import { craftingEquipmentSystem } from '../../systems/CraftingEquipmentSystem';
import { getAllCraftingRecipes, getCraftingRecipe } from '../../content/craftingRecipesCatalog';
import { getAllBlacksmithDefs, getBlacksmithDef } from '../../content/blacksmithCatalog';
import { getEquipmentTemplate } from '../../content/equipmentCatalog';
import { BlacksmithId, CraftingMaterialId, EquipmentSlot } from '../../core/crafting/CraftingTypes';
import { store } from '../../core/GameState';
import { t } from '../../services/i18n/I18nService';

function materialLabel(id: string): string {
  return t(id.replace('material_', 'material.'));
}

function craftBlockReason(reason: string | undefined, recipeId: string): string {
  if (!reason) return t('forge.reason.unknown');
  const forgeLevel = reason.match(/^Requires Forge Level (\d+)$/);
  if (forgeLevel) return t('forge.reason.requires_forge', { level: forgeLevel[1] });

  if (reason.startsWith('Requires ')) {
    const recipe = getCraftingRecipe(recipeId);
    const smith = recipe?.requiredBlacksmithId ? getBlacksmithDef(recipe.requiredBlacksmithId) : undefined;
    return t('forge.reason.requires_smith', { name: smith ? t(smith.nameKey) : t('forge.specialized_blacksmith') });
  }

  const material = reason.match(/^Insufficient (.+)$/);
  if (material && !['Gold', 'Wood', 'Stone', 'Iron'].includes(material[1])) {
    const id = `material.${material[1].trim().toLowerCase().replace(/\s+/g, '_')}`;
    return t('forge.reason.insufficient_material', { material: t(id) });
  }

  const map: Record<string, string> = {
    'Recipe not found': 'forge.reason.recipe_not_found',
    'Recipe locked': 'forge.reason.recipe_locked',
    'Insufficient Gold': 'forge.reason.insufficient_gold',
    'Insufficient Wood': 'forge.reason.insufficient_wood',
    'Insufficient Stone': 'forge.reason.insufficient_stone',
    'Insufficient Iron': 'forge.reason.insufficient_iron',
  };
  return map[reason] ? t(map[reason]) : reason;
}

export const ForgeCraftingModal: ModalInstance = {
  id: 'forge_crafting_modal',
  render: () => {
    let currentCategory: EquipmentSlot = 'weapon';
    let selectedRecipeId: string = 'recipe_wpn_sword_s1';

    const el = document.createElement('div');
    el.className = 'forge-crafting-modal-container pixel-fantasy-modal';
    el.style.cssText = 'max-width:540px; padding:16px; background:radial-gradient(ellipse at 50% 15%, #1c1917 0%, #0c0a09 100%); border:2px solid #ef4444; border-radius:6px; box-shadow:0 0 35px rgba(0,0,0,0.9), inset 0 0 20px rgba(239,68,68,0.2);';

    const refresh = () => {
      const activeSmithId = craftingEquipmentSystem.getActiveBlacksmithId();
      const activeSmith = getBlacksmithDef(activeSmithId);
      const unlockedSmiths = getAllBlacksmithDefs().filter((b) => craftingEquipmentSystem.isBlacksmithUnlocked(b.id));
      const recipes = getAllCraftingRecipes().filter((r) => r.category === currentCategory);
      const selRecipe = getCraftingRecipe(selectedRecipeId) || recipes[0];
      if (selRecipe) selectedRecipeId = selRecipe.id;

      const template = selRecipe ? getEquipmentTemplate(selRecipe.resultTemplateId) : undefined;
      const canCraft = selRecipe ? craftingEquipmentSystem.canCraftRecipe(selRecipe.id) : { canCraft: false };
      const mats = craftingEquipmentSystem.getMaterials();

      el.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1.5px solid #78350f; padding-bottom:10px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:42px; height:42px; border-radius:50%; background:rgba(0,0,0,0.7); border:2px solid #ef4444; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(239,68,68,0.4); flex-shrink:0;">
              <div style="width:26px; height:26px;">${activeSmith?.avatarSvg || ''}</div>
            </div>
            <div>
              <div style="font-size:9px; color:#f59e0b; font-weight:bold; letter-spacing:0.5px; font-family:var(--font-display);">
                ✦ ${t('forge.active_blacksmith', { title: activeSmith ? t(activeSmith.titleKey) : '' })} ✦
              </div>
              <h3 style="font-family:var(--font-display); font-size:16px; color:#fef08a; margin:1px 0 0 0;">
                ${activeSmith ? t(activeSmith.nameKey) : t('forge.master_blacksmith')}
              </h3>
              <div style="font-size:10px; color:#34d399;">${t('forge.specialty_quality', { value: Math.round(((activeSmith?.qualityBonusMultiplier || 1) - 1) * 100) })}</div>
            </div>
          </div>

          <div style="display:flex; gap:4px;">
            ${unlockedSmiths.map((b) => `
              <button class="btn-switch-smith" data-smith-id="${b.id}" style="padding:4px 8px; font-size:10px; font-weight:bold; font-family:var(--font-display); background:${b.id === activeSmithId ? '#ef4444' : 'rgba(0,0,0,0.5)'}; border:1px solid #78350f; border-radius:3px; color:#ffffff; cursor:pointer;">
                ${t(b.nameKey)}
              </button>
            `).join('')}
          </div>
        </div>

        <div style="display:flex; gap:6px; margin-bottom:12px;">
          ${(['weapon', 'armor', 'accessory'] as EquipmentSlot[]).map((cat) => `
            <button class="btn-category-tab" data-category="${cat}" style="flex:1; padding:6px; font-size:11px; font-weight:bold; font-family:var(--font-display); background:${currentCategory === cat ? 'linear-gradient(135deg, #d97706, #b45309)' : 'rgba(28,25,23,0.8)'}; border:1px solid ${currentCategory === cat ? '#f59e0b' : '#78350f'}; border-radius:4px; color:#ffffff; cursor:pointer;">
              ${t(`equipment.filter.${cat}`)}
            </button>
          `).join('')}
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:14px;">
          <div style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto; padding-right:4px;">
            ${recipes.map((recipe) => {
              const isSelected = recipe.id === selectedRecipeId;
              const isCraftable = craftingEquipmentSystem.canCraftRecipe(recipe.id).canCraft;
              return `
                <div class="recipe-card-tile" data-recipe-id="${recipe.id}" style="background:${isSelected ? 'rgba(239,68,68,0.2)' : 'rgba(12,10,9,0.7)'}; border:1.5px solid ${isSelected ? '#ef4444' : '#78350f'}; border-radius:4px; padding:6px 8px; cursor:pointer; transition:all 0.15s ease;">
                  <div style="font-size:11px; font-weight:bold; color:${isCraftable ? '#fef08a' : '#94a3b8'}; font-family:var(--font-display);">${t(recipe.nameKey)}</div>
                  <div style="font-size:9px; color:${isCraftable ? '#34d399' : '#f43f5e'}; font-weight:bold;">${isCraftable ? t('forge.ready_to_craft') : t('forge.materials_needed')}</div>
                </div>
              `;
            }).join('')}
          </div>

          ${selRecipe && template ? `
            <div style="background:rgba(28,25,23,0.9); border:1.5px solid #b45309; border-radius:4px; padding:10px; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                  <div style="width:34px; height:34px; border-radius:4px; background:#0c0a09; border:1px solid #f59e0b; display:flex; align-items:center; justify-content:center;">${template.iconSvg}</div>
                  <div>
                    <div style="font-size:12px; font-weight:bold; color:#fef08a; font-family:var(--font-display);">${t(selRecipe.nameKey)}</div>
                    <div style="font-size:9px; color:#38bdf8;">${t(`equipment.rarity.${template.rarity}`)} • ${t(`equipment.slot.${template.slot}`)}</div>
                  </div>
                </div>

                <div style="font-size:10px; color:#cbd5e1; margin-bottom:8px; line-height:1.3;">
                  ${template.baseStats.attack ? `<div>⚔️ ${t('equipment.stat.attack')}: <b style="color:#fde047;">+${template.baseStats.attack}</b></div>` : ''}
                  ${template.baseStats.defense ? `<div>🛡️ ${t('equipment.stat.defense')}: <b style="color:#38bdf8;">+${template.baseStats.defense}</b></div>` : ''}
                  ${template.baseStats.speed ? `<div>⚡ ${t('equipment.stat.speed')}: <b style="color:#34d399;">+${Math.round(template.baseStats.speed * 100)}%</b></div>` : ''}
                  ${template.baseStats.critChance ? `<div>💥 ${t('equipment.stat.crit')}: <b style="color:#f472b6;">+${Math.round(template.baseStats.critChance * 100)}%</b></div>` : ''}
                </div>

                <div style="background:rgba(0,0,0,0.5); padding:6px; border-radius:3px; font-size:10px; margin-bottom:8px;">
                  <div style="color:#f59e0b; font-weight:bold; margin-bottom:2px; font-size:9px;">${t('forge.crafting_costs')}</div>
                  <div>🪙 ${t('currency.gold')}: ${store.get().gold >= selRecipe.requiredGold ? '✓' : '✗'} <b>${selRecipe.requiredGold}</b></div>
                  ${Object.entries(selRecipe.requiredMaterials).map(([mId, req]) => `
                    <div>📦 ${materialLabel(mId)}: ${mats[mId as CraftingMaterialId] >= (req || 0) ? '✓' : '✗'} <b>${req}</b> (${t('common.have', { value: mats[mId as CraftingMaterialId] || 0 })})</div>
                  `).join('')}
                </div>
              </div>

              <button id="btn-craft-action" ${!canCraft.canCraft ? 'disabled' : ''} style="width:100%; padding:8px; background:${canCraft.canCraft ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : '#292524'}; border:1px solid ${canCraft.canCraft ? '#f87171' : '#451a03'}; border-radius:4px; color:${canCraft.canCraft ? '#ffffff' : '#78716c'}; font-family:var(--font-display); font-weight:900; font-size:12px; letter-spacing:1px; cursor:${canCraft.canCraft ? 'pointer' : 'not-allowed'}; box-shadow:${canCraft.canCraft ? '0 0 10px rgba(239,68,68,0.5)' : 'none'};">
                ${canCraft.canCraft ? `✦ ${t('forge.craft_equipment')} ✦` : t('forge.blocked', { reason: craftBlockReason(canCraft.reason, selectedRecipeId) })}
              </button>
            </div>
          ` : `<div>${t('forge.no_recipes')}</div>`}
        </div>

        <button id="btn-close-forge" style="width:100%; padding:8px; background:#1c1917; border:1px solid #78350f; border-radius:4px; color:#cbd5e1; font-family:var(--font-display); font-size:12px; cursor:pointer;">
          ${t('forge.exit')}
        </button>
      `;

      el.querySelectorAll('.btn-switch-smith').forEach((btn) => {
        btn.addEventListener('click', () => {
          const smithId = btn.getAttribute('data-smith-id') as BlacksmithId;
          craftingEquipmentSystem.setActiveBlacksmith(smithId);
          refresh();
        });
      });

      el.querySelectorAll('.btn-category-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          currentCategory = tab.getAttribute('data-category') as EquipmentSlot;
          const firstInCat = getAllCraftingRecipes().find((r) => r.category === currentCategory);
          if (firstInCat) selectedRecipeId = firstInCat.id;
          refresh();
        });
      });

      el.querySelectorAll('.recipe-card-tile').forEach((card) => {
        card.addEventListener('click', () => {
          selectedRecipeId = card.getAttribute('data-recipe-id') || '';
          refresh();
        });
      });

      el.querySelector('#btn-craft-action')?.addEventListener('click', () => {
        const res = craftingEquipmentSystem.craftItem(selectedRecipeId);
        if (res.success) refresh();
      });

      el.querySelector('#btn-close-forge')?.addEventListener('click', () => {
        modalManager.close('forge_crafting_modal');
      });
    };

    refresh();
    return el;
  },
};
