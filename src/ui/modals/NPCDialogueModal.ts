import { ModalInstance, modalManager } from '../components/ModalManager';
import { SettlementNPCId } from '../../core/settlement/SettlementTypes';
import { getSettlementNPCDef } from '../../content/settlementNPCs';
import { settlementSystem } from '../../systems/SettlementSystem';
import { karmaSystem } from '../../systems/KarmaSystem';
import { events } from '../../core/EventBus';
import { t } from '../../services/i18n/I18nService';

function serviceLabel(action?: string): string {
  if (!action) return '';
  const keys: Record<string, string> = {
    open_forge: 'settlement.npc.service.forge',
    open_market: 'settlement.npc.service.market',
    open_tavern: 'settlement.npc.service.tavern',
    open_alchemy: 'settlement.npc.service.alchemy',
    claim_daily_bounty: 'settlement.npc.service.bounty',
  };
  return keys[action] ? t(keys[action]) : action;
}

export const NPCDialogueModal: ModalInstance = {
  id: 'npc_dialogue_modal',
  render: (data?: { npcId?: SettlementNPCId }) => {
    const npcId = data?.npcId || 'npc_elder_aldric';
    const def = getSettlementNPCDef(npcId);
    const el = document.createElement('div');
    el.className = 'npc-dialogue-modal-container pixel-fantasy-modal';
    el.style.cssText = 'max-width:440px; padding:16px; background:radial-gradient(ellipse at 50% 20%, #1c1917 0%, #0c0a09 100%); border:2px solid #d97706; border-radius:6px; box-shadow:0 0 30px rgba(0,0,0,0.9), inset 0 0 15px rgba(217,119,6,0.2);';

    if (!def) {
      el.innerHTML = `<p style="color:#94a3b8;">${t('settlement.npc.not_found')}</p>`;
      return el;
    }

    const interaction = settlementSystem.interactWithNPC(npcId);
    const npcState = settlementSystem.getState().npcs[npcId];
    const karmaBand = karmaSystem.getKarmaBand();
    const karmaColor = karmaBand === 'virtuous' ? '#34d399' : karmaBand === 'infamous' ? '#f43f5e' : '#f59e0b';
    const karmaLabel = karmaBand === 'virtuous'
      ? t('settlement.npc.reputation.virtuous')
      : karmaBand === 'infamous'
        ? t('settlement.npc.reputation.infamous')
        : t('settlement.npc.reputation.neutral');

    el.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; border-bottom:1px solid #78350f; padding-bottom:10px;">
        <div style="width:48px; height:48px; border-radius:50%; background:rgba(0,0,0,0.7); border:2px solid #f59e0b; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(245,158,11,0.4); flex-shrink:0;">
          <div style="width:28px; height:28px;">${def.avatarSvg}</div>
        </div>
        <div style="flex:1;">
          <div style="font-size:10px; color:${karmaColor}; font-weight:bold; letter-spacing:0.5px; font-family:var(--font-display);">
            ${karmaLabel}
          </div>
          <h3 style="font-family:var(--font-display); font-size:16px; color:#fef08a; margin:2px 0 2px 0;">
            ${t(def.nameKey)}
          </h3>
          <div style="font-size:11px; color:#94a3b8;">${t(def.titleKey)} • <span style="color:#cbd5e1;">${t(def.roleKey)}</span></div>
        </div>
      </div>

      <div style="background:rgba(28,25,23,0.9); border:1px solid #b45309; border-radius:4px; padding:12px; margin-bottom:12px; box-shadow:inset 0 1px 3px rgba(0,0,0,0.8);">
        <p style="color:#fef08a; font-size:13px; line-height:1.45; margin:0; font-family:var(--font-sans); font-style:italic;">
          “${interaction.line}”
        </p>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#cbd5e1; margin-bottom:12px; background:rgba(0,0,0,0.4); padding:6px 10px; border-radius:4px;">
        <span>${t('settlement.npc.affinity', { value: npcState?.affinity || 0 })}</span>
        <span style="color:#34d399; font-size:10px;">${t('settlement.npc.affinity_gain', { value: interaction.affinityGained })}</span>
      </div>

      <div class="npc-actions-container" style="display:flex; flex-direction:column; gap:8px;">
        ${interaction.serviceAction ? `
          <button id="btn-npc-service" style="width:100%; padding:10px; background:linear-gradient(135deg, #d97706, #b45309); border:1px solid #f59e0b; border-radius:4px; color:#ffffff; font-family:var(--font-display); font-weight:bold; font-size:13px; cursor:pointer; box-shadow:0 0 10px rgba(217,119,6,0.4);">
            ✦ ${t('settlement.npc.service_action', { service: serviceLabel(interaction.serviceAction) })} ✦
          </button>
        ` : ''}
        <button id="btn-close-dialogue" style="width:100%; padding:8px; background:#1c1917; border:1px solid #78350f; border-radius:4px; color:#cbd5e1; font-family:var(--font-display); font-size:12px; cursor:pointer;">
          ${t('settlement.npc.farewell')}
        </button>
      </div>
    `;

    el.querySelector('#btn-npc-service')?.addEventListener('click', () => {
      modalManager.close('npc_dialogue_modal');
      if (interaction.serviceAction === 'open_forge') {
        modalManager.open('forge_crafting_modal');
      } else if (interaction.serviceAction === 'open_market') {
        modalManager.open('market_modal');
      } else {
        events.emit('toast:show', {
          message: t('settlement.npc.service_preparing', {
            name: t(def.nameKey),
            service: serviceLabel(interaction.serviceAction),
          }),
          type: 'info',
        });
      }
    });

    el.querySelector('#btn-close-dialogue')?.addEventListener('click', () => {
      modalManager.close('npc_dialogue_modal');
    });

    return el;
  },
};
