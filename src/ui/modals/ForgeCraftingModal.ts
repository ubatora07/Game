import { ModalInstance, modalManager } from '../components/ModalManager';
import { craftingEquipmentSystem } from '../../systems/CraftingEquipmentSystem';
import { getAllCraftingRecipes, getCraftingRecipe } from '../../content/craftingRecipesCatalog';
import { getAllBlacksmithDefs, getBlacksmithDef } from '../../content/blacksmithCatalog';
import { getEquipmentTemplate } from '../../content/equipmentCatalog';
import { BlacksmithId, CraftingMaterialId, EquipmentSlot } from '../../core/crafting/CraftingTypes';
import { store } from '../../core/GameState';

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
      const unlockedSmiths = getAllBlacksmithDefs().filter((b) =>
        craftingEquipmentSystem.isBlacksmithUnlocked(b.id)
      );

      const recipes = getAllCraftingRecipes().filter((r) => r.category === currentCategory);
      const selRecipe = getCraftingRecipe(selectedRecipeId) || recipes[0];
      if (selRecipe) selectedRecipeId = selRecipe.id;

      const template = selRecipe ? getEquipmentTemplate(selRecipe.resultTemplateId) : undefined;
      const canCraft = selRecipe ? craftingEquipmentSystem.canCraftRecipe(selRecipe.id) : { canCraft: false };
      const mats = craftingEquipmentSystem.getMaterials();

      el.innerHTML = `
        <!-- Blacksmith Banner Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1.5px solid #78350f; padding-bottom:10px; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:42px; height:42px; border-radius:50%; background:rgba(0,0,0,0.7); border:2px solid #ef4444; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(239,68,68,0.4); flex-shrink:0;">
              <div style="width:26px; height:26px;">${activeSmith?.avatarSvg || ''}</div>
            </div>
            <div>
              <div style="font-size:9px; color:#f59e0b; font-weight:bold; letter-spacing:0.5px; font-family:var(--font-display);">
                ✦ ACTIVE BLACKSMITH • ${activeSmith?.defaultTitle || ''} ✦
              </div>
              <h3 style="font-family:var(--font-display); font-size:16px; color:#fef08a; margin:1px 0 0 0;">
                ${activeSmith?.defaultName || 'Master Blacksmith'}
              </h3>
              <div style="font-size:10px; color:#34d399;">Specialty: +${Math.round(((activeSmith?.qualityBonusMultiplier || 1) - 1) * 100)}% Gear Quality</div>
            </div>
          </div>

          <!-- Blacksmith Switcher -->
          <div style="display:flex; gap:4px;">
            ${unlockedSmiths
              .map(
                (b) => `
              <button class="btn-switch-smith" data-smith-id="${b.id}" style="padding:4px 8px; font-size:10px; font-weight:bold; font-family:var(--font-display); background:${b.id === activeSmithId ? '#ef4444' : 'rgba(0,0,0,0.5)'}; border:1px solid #78350f; border-radius:3px; color:#ffffff; cursor:pointer;">
                ${b.defaultName.split(' ')[0]}
              </button>
            `
              )
              .join('')}
          </div>
        </div>

        <!-- Category Tabs -->
        <div style="display:flex; gap:6px; margin-bottom:12px;">
          ${(['weapon', 'armor', 'accessory'] as EquipmentSlot[])
            .map(
              (cat) => `
            <button class="btn-category-tab" data-category="${cat}" style="flex:1; padding:6px; font-size:11px; font-weight:bold; font-family:var(--font-display); background:${currentCategory === cat ? 'linear-gradient(135deg, #d97706, #b45309)' : 'rgba(28,25,23,0.8)'}; border:1px solid ${currentCategory === cat ? '#f59e0b' : '#78350f'}; border-radius:4px; color:#ffffff; cursor:pointer;">
              ${cat.toUpperCase()}S
            </button>
          `
            )
            .join('')}
        </div>

        <!-- Main Workspace: Recipes List (Left) + Item Preview & Craft (Right) -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:14px;">
          <!-- Recipe List -->
          <div style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto; padding-right:4px;">
            ${recipes
              .map((r) => {
                const isSelected = r.id === selectedRecipeId;
                const isCraftable = craftingEquipmentSystem.canCraftRecipe(r.id).canCraft;
                return `
                <div class="recipe-card-tile" data-recipe-id="${r.id}" style="background:${isSelected ? 'rgba(239,68,68,0.2)' : 'rgba(12,10,9,0.7)'}; border:1.5px solid ${isSelected ? '#ef4444' : '#78350f'}; border-radius:4px; padding:6px 8px; cursor:pointer; transition:all 0.15s ease;">
                  <div style="font-size:11px; font-weight:bold; color:${isCraftable ? '#fef08a' : '#94a3b8'}; font-family:var(--font-display);">${r.defaultName}</div>
                  <div style="font-size:9px; color:${isCraftable ? '#34d399' : '#f43f5e'}; font-weight:bold;">${isCraftable ? '✓ Ready to Craft' : '• Materials Needed'}</div>
                </div>
              `;
              })
              .join('')}
          </div>

          <!-- Recipe Preview & Costs -->
          ${
            selRecipe && template
              ? `
            <div style="background:rgba(28,25,23,0.9); border:1.5px solid #b45309; border-radius:4px; padding:10px; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                  <div style="width:34px; height:34px; border-radius:4px; background:#0c0a09; border:1px solid #f59e0b; display:flex; align-items:center; justify-content:center;">
                    ${template.iconSvg}
                  </div>
                  <div>
                    <div style="font-size:12px; font-weight:bold; color:#fef08a; font-family:var(--font-display);">${template.defaultName}</div>
                    <div style="font-size:9px; color:#38bdf8;">${template.rarity.toUpperCase()} ${template.slot.toUpperCase()}</div>
                  </div>
                </div>

                <div style="font-size:10px; color:#cbd5e1; margin-bottom:8px; line-height:1.3;">
                  ${template.baseStats.attack ? `<div>⚔️ Attack: <b style="color:#fde047;">+${template.baseStats.attack}</b></div>` : ''}
                  ${template.baseStats.defense ? `<div>🛡️ Defense: <b style="color:#38bdf8;">+${template.baseStats.defense}</b></div>` : ''}
                  ${template.baseStats.speed ? `<div>⚡ Speed: <b style="color:#34d399;">+${Math.round(template.baseStats.speed * 100)}%</b></div>` : ''}
                  ${template.baseStats.critChance ? `<div>💥 Crit: <b style="color:#f472b6;">+${Math.round(template.baseStats.critChance * 100)}%</b></div>` : ''}
                </div>

                <!-- Required Costs -->
                <div style="background:rgba(0,0,0,0.5); padding:6px; border-radius:3px; font-size:10px; margin-bottom:8px;">
                  <div style="color:#f59e0b; font-weight:bold; margin-bottom:2px; font-size:9px;">CRAFTING COSTS:</div>
                  <div>🪙 Gold: ${store.get().gold >= selRecipe.requiredGold ? '✓' : '✗'} <b>${selRecipe.requiredGold}</b></div>
                  ${Object.entries(selRecipe.requiredMaterials)
                    .map(
                      ([mId, req]) => `
                    <div>📦 ${mId.replace('material_', '')}: ${mats[mId as CraftingMaterialId] >= (req || 0) ? '✓' : '✗'} <b>${req}</b> (Have ${mats[mId as CraftingMaterialId] || 0})</div>
                  `
                    )
                    .join('')}
                </div>
              </div>

              <button id="btn-craft-action" ${!canCraft.canCraft ? 'disabled' : ''} style="width:100%; padding:8px; background:${canCraft.canCraft ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : '#292524'}; border:1px solid ${canCraft.canCraft ? '#f87171' : '#451a03'}; border-radius:4px; color:${canCraft.canCraft ? '#ffffff' : '#78716c'}; font-family:var(--font-display); font-weight:900; font-size:12px; letter-spacing:1px; cursor:${canCraft.canCraft ? 'pointer' : 'not-allowed'}; box-shadow:${canCraft.canCraft ? '0 0 10px rgba(239,68,68,0.5)' : 'none'};">
                ${canCraft.canCraft ? '✦ FORGE EQUIPMENT ✦' : `BLOCKED: ${canCraft.reason}`}
              </button>
            </div>
          `
              : '<div>No recipes available.</div>'
          }
        </div>

        <button id="btn-close-forge" style="width:100%; padding:8px; background:#1c1917; border:1px solid #78350f; border-radius:4px; color:#cbd5e1; font-family:var(--font-display); font-size:12px; cursor:pointer;">
          Exit Forge
        </button>
      `;

      // Event bindings
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
        if (res.success) {
          refresh();
        }
      });

      el.querySelector('#btn-close-forge')?.addEventListener('click', () => {
        modalManager.close('forge_crafting_modal');
      });
    };

    refresh();
    return el;
  },
};
