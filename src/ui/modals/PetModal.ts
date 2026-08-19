import { ModalInstance, modalManager } from '../components/ModalManager';
import { petSystem } from '../../systems/PetSystem';
import { getAllPets, getPetDefinition } from '../../content/petsCatalog';
import { t } from '../../services/i18n/I18nService';
import { store } from '../../core/GameState';
import { events } from '../../core/EventBus';

export const PetModal: ModalInstance = {
  id: 'pet_modal',
  render: () => {
    const el = document.createElement('div');
    el.className = 'pet-modal-container';
    el.style.cssText = 'max-width:600px; width:100%; color:#f8fafc; font-family:sans-serif;';

    let selectedPetId = petSystem.getActivePetId() ?? 'pet_ignis_drake';

    const renderContent = () => {
      const allDefs = getAllPets();
      const activePetId = petSystem.getActivePetId();
      const selectedPet = petSystem.getPetInstance(selectedPetId);
      const selectedDef = getPetDefinition(selectedPetId)!;
      const isOwned = !!selectedPet;
      const isEquipped = activePetId === selectedPetId;

      const currentStage = selectedPet?.evolutionStage ?? 1;
      const currentEvo = selectedDef.evolutions[currentStage];
      const canEvolve = isOwned ? petSystem.canEvolvePet(selectedPetId) : { eligible: false };

      el.innerHTML = `
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:22px;">🐾</span>
            <div>
              <h2 style="font-size:18px; font-weight:bold; color:#fcd34d; margin:0;">
                ${t('pet.modal.title')}
              </h2>
              <div style="font-size:11px; color:#94a3b8;">
                ${t('pet.modal.subtitle')}
              </div>
            </div>
          </div>
          <button id="btn-close-pet-modal" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer; padding:4px 8px;">✕</button>
        </div>

        <!-- Pet Selection Carousel / Tabs -->
        <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; margin-bottom:12px;">
          ${allDefs
            .map((def) => {
              const owned = petSystem.getPetInstance(def.id);
              const isSelected = def.id === selectedPetId;
              const isActive = def.id === activePetId;
              return `
                <button data-pet-id="${def.id}" class="btn-select-pet" style="display:flex; align-items:center; gap:6px; padding:6px 10px; border-radius:10px; cursor:pointer; flex-shrink:0; transition:all 0.2s; border:1px solid ${
                isSelected ? '#f59e0b' : 'rgba(255,255,255,0.1)'
              }; background:${isSelected ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)'}; color:${
                isSelected ? '#fef3c7' : 'rgba(255,255,255,0.7)'
              };">
                  <div style="width:20px; height:20px; display:flex; align-items:center; justify-content:center;">${
                    def.evolutions[owned?.evolutionStage ?? 1].iconSvg
                  }</div>
                  <span style="font-size:12px; font-weight:600;">${t(def.nameKey).split(' ')[0]}</span>
                  ${
                    isActive
                      ? `<span style="font-size:9px; background:rgba(16,185,129,0.3); color:#6ee7b7; padding:2px 5px; border-radius:99px; font-weight:bold;">${t('common.active')}</span>`
                      : ''
                  }
                  ${!owned ? `<span style="font-size:10px; opacity:0.4;">🔒</span>` : ''}
                </button>
              `;
            })
            .join('')}
        </div>

        <!-- Selected Pet Showcase Card -->
        <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:14px; display:flex; flex-direction:column; gap:12px;">
          <div style="display:flex; gap:14px; align-items:center;">
            <div style="width:100px; height:100px; border-radius:12px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0;">
              <div style="width:48px; height:48px;">${currentEvo.iconSvg}</div>
              <span style="font-size:10px; color:#cbd5e1; font-weight:600; margin-top:4px; text-align:center;">
                ${t('pet.stage', { stage: currentStage })}
              </span>
            </div>

            <div style="flex:1;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <h3 style="font-size:16px; font-weight:bold; color:#f8fafc; margin:0; display:flex; align-items:center; gap:6px;">
                    ${selectedPet ? selectedPet.name : t(selectedDef.nameKey)}
                    <span style="font-size:10px; text-transform:uppercase; padding:2px 6px; border-radius:4px; background:rgba(255,255,255,0.1); color:#94a3b8;">${t(`pet.element.${selectedDef.element}`)}</span>
                  </h3>
                  <div style="font-size:11px; color:#94a3b8; margin-top:2px;">${t(selectedDef.descKey)}</div>
                </div>

                ${
                  isOwned
                    ? `
                  <button id="btn-toggle-equip-pet" style="padding:6px 12px; border-radius:8px; font-size:11px; font-weight:bold; cursor:pointer; border:none; ${
                    isEquipped
                      ? 'background:rgba(239,68,68,0.2); color:#fca5a5; border:1px solid rgba(239,68,68,0.4);'
                      : 'background:#10b981; color:#0f172a;'
                  }">
                    ${isEquipped ? t('btn.unequip') : t('btn.equip')}
                  </button>
                `
                    : `<span style="font-size:11px; color:#64748b; font-style:italic;">${t('pet.not_acquired')}</span>`
                }
              </div>

              ${
                isOwned
                  ? `
                <!-- Level & XP Bar -->
                <div style="margin-top:8px;">
                  <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:600; color:#cbd5e1; margin-bottom:3px;">
                    <span>${t('common.level', { level: selectedPet!.level })}</span>
                    <span>${selectedPet!.xp} / ${selectedPet!.xpToNextLevel} XP</span>
                  </div>
                  <div style="width:100%; background:rgba(0,0,0,0.5); height:6px; border-radius:99px; overflow:hidden;">
                    <div style="background:linear-gradient(90deg, #f59e0b, #fbbf24); height:100%; width:${Math.min(
                      100,
                      (selectedPet!.xp / selectedPet!.xpToNextLevel) * 100
                    )}%;"></div>
                  </div>
                </div>
              `
                  : ''
              }
            </div>
          </div>

          ${
            isOwned
              ? `
            <!-- Class Resonance / Synergy Banner -->
            ${(() => {
              const syn = petSystem.getSynergyStatus(selectedPetId);
              if (syn.hasSynergy) {
                return `
                  <div style="background:linear-gradient(90deg, rgba(234,179,8,0.15), rgba(245,158,11,0.05)); border:1px solid rgba(234,179,8,0.35); border-radius:8px; padding:8px 10px; display:flex; align-items:center; gap:8px;">
                    <span style="font-size:18px;">🔥</span>
                    <div>
                      <div style="font-size:11px; font-weight:bold; color:#fde047;">${selectedDef.synergyDescKey ? t(selectedDef.synergyDescKey) : syn.synergyDesc}</div>
                      <div style="font-size:10px; color:#cbd5e1;">${t('pet.active_resonance', { className: syn.matchingClass ? t(`class.${syn.matchingClass}.name`) : '' })}</div>
                    </div>
                  </div>
                `;
              } else if (selectedDef.preferredClass) {
                return `
                  <div style="background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.15); border-radius:8px; padding:6px 10px; font-size:10px; color:#94a3b8;">
                    💡 <strong style="color:#cbd5e1;">${t('pet.resonance_synergy')}:</strong> ${t('pet.resonance_hint', { className: t(`class.${selectedDef.preferredClass}.name`), bonus: selectedDef.synergyDescKey ? t(selectedDef.synergyDescKey) : (selectedDef.defaultSynergyDesc ?? '') })}
                  </div>
                `;
              }
              return '';
            })()}

            <!-- Passives & Combat Actions Grid -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px; font-size:11px;">
                <span style="font-weight:bold; color:#fcd34d; display:block; margin-bottom:4px;">✨ ${t('pet.passive_auras')}</span>
                ${currentEvo.modifiers
                  .map(
                    (m) =>
                      `<div style="color:#cbd5e1; font-size:11px;">• +${Math.round(
                        m.value * 100
                      )}% ${m.target}</div>`
                  )
                  .join('')}
              </div>

              <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px; font-size:11px;">
                <span style="font-weight:bold; color:#38bdf8; display:block; margin-bottom:4px;">⚔️ ${t(currentEvo.combatAction.nameKey)}</span>
                <div style="color:#94a3b8; font-size:10px; line-height:1.3;">${t(currentEvo.combatAction.descKey)}</div>
              </div>
            </div>

            <!-- Train & Evolve Actions -->
            <div style="display:flex; gap:8px; margin-top:4px;">
              <button id="btn-train-pet" style="flex:1; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); color:#fcd34d; font-weight:bold; font-size:11px; padding:8px; border-radius:8px; cursor:pointer;">
                🍖 ${t('pet.train_action', { xp: 150, gold: 500 })}
              </button>

              ${
                currentStage < 3
                  ? `
                <button id="btn-evolve-pet" style="flex:1; font-weight:bold; font-size:11px; padding:8px; border-radius:8px; cursor:pointer; border:none; ${
                  canEvolve.eligible
                    ? 'background:#8b5cf6; color:#ffffff; box-shadow:0 0 10px rgba(139,92,246,0.5);'
                    : 'background:rgba(255,255,255,0.05); color:#64748b; cursor:not-allowed;'
                }">
                  🌟 ${t('pet.evolve_stage', { stage: currentStage + 1 })}
                </button>
              `
                  : ''
              }
            </div>
          `
              : `
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:12px; text-align:center; font-size:11px; color:#94a3b8;">
              ${t('pet.discovery_hint')}
            </div>
          `
          }
        </div>
      `;

      // Bind events
      el.querySelector('#btn-close-pet-modal')?.addEventListener('click', () => {
        modalManager.close(PetModal.id);
      });

      el.querySelectorAll('.btn-select-pet').forEach((btn) => {
        btn.addEventListener('click', () => {
          const petId = btn.getAttribute('data-pet-id');
          if (petId) {
            selectedPetId = petId;
            renderContent();
          }
        });
      });

      el.querySelector('#btn-toggle-equip-pet')?.addEventListener('click', () => {
        const activeId = petSystem.getActivePetId();
        if (activeId === selectedPetId) {
          petSystem.setActivePet(null);
        } else {
          petSystem.setActivePet(selectedPetId);
        }
        renderContent();
      });

      el.querySelector('#btn-train-pet')?.addEventListener('click', () => {
        const state = store.get();
        if (state.gold < 500) {
          events.emit('toast:show', { message: t('pet.not_enough_gold'), type: 'warning' });
          return;
        }

        store.set((draft) => {
          draft.gold -= 500;
        });

        petSystem.addPetXp(selectedPetId, 150);
        renderContent();
      });

      el.querySelector('#btn-evolve-pet')?.addEventListener('click', () => {
        const check = petSystem.canEvolvePet(selectedPetId);
        if (!check.eligible) {
          events.emit('toast:show', { message: check.reason ?? t('pet.cannot_evolve'), type: 'warning' });
          return;
        }

        const success = petSystem.evolvePet(selectedPetId);
        if (success) {
          renderContent();
        }
      });
    };

    renderContent();
    return el;
  },
};
