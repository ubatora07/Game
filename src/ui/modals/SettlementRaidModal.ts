import { ModalInstance, modalManager } from '../components/ModalManager';
import { settlementDefenseSystem } from '../../systems/SettlementDefenseSystem';
import { getAllRaidDefinitions, getRaidDefinition } from '../../content/settlementRaidsCatalog';
import { t } from '../../services/i18n/I18nService';

export const SettlementRaidModal: ModalInstance = {
  id: 'settlement_raid_modal',
  render: (data?: { raidId?: string }) => {
    const activeRaidId = data?.raidId || settlementDefenseSystem.getActiveRaid()?.raidId || 'raid_goblin_scouts';
    let battleResolved = false;
    let battleResult: { won: boolean; raid: any; defense: number } | null = null;

    const el = document.createElement('div');
    el.className = 'settlement-raid-modal-container pixel-fantasy-modal';
    el.style.cssText = 'max-width:520px; padding:16px; background:radial-gradient(ellipse at 50% 15%, #1c1917 0%, #0c0a09 100%); border:2px solid #ef4444; border-radius:6px; box-shadow:0 0 35px rgba(0,0,0,0.9), inset 0 0 20px rgba(239,68,68,0.25);';

    const refresh = () => {
      const raid = getRaidDefinition(activeRaidId) || getAllRaidDefinitions()[0];
      const totalDefense = settlementDefenseSystem.getTotalDefense();
      const defenseAdvantage = totalDefense - raid.requiredDefense;

      el.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1.5px solid #78350f; padding-bottom:8px;">
          <div>
            <div style="font-size:9px; color:#ef4444; font-weight:bold; letter-spacing:0.5px; font-family:var(--font-display);">
              ⚔️ ${t('raid.garrison_alarm')} ⚔️
            </div>
            <h3 style="font-family:var(--font-display); font-size:17px; color:#fef08a; margin:1px 0 0 0;">${t(raid.nameKey)}</h3>
          </div>
          <div style="background:rgba(0,0,0,0.6); padding:4px 8px; border-radius:4px; border:1px solid #38bdf8; font-size:11px; color:#38bdf8;">
            ${t('raid.total_defense', { value: totalDefense })} 🛡️
          </div>
        </div>

        <div style="background:rgba(28,25,23,0.9); border:1.5px solid #78350f; border-radius:4px; padding:10px; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
            <div style="width:38px; height:38px; border-radius:50%; background:#0c0a09; border:2px solid #ef4444; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <div style="width:24px; height:24px;">${raid.bannerSvg}</div>
            </div>
            <div>
              <div style="font-size:12px; font-weight:bold; color:#fef08a; font-family:var(--font-display);">${raid.factionKey ? t(raid.factionKey) : raid.attackerFaction}</div>
              <div style="font-size:9px; color:#f87171; font-weight:bold;">${t('raid.threat_required', { threat: t(`raid.threat.${raid.threatLevel}`), defense: raid.requiredDefense })} 🛡️</div>
            </div>
          </div>

          <p style="font-size:10px; color:#cbd5e1; margin:0 0 8px 0; line-height:1.3;">${raid.descKey ? t(raid.descKey) : raid.description}</p>

          <div style="display:flex; justify-content:space-between; font-size:10px; background:rgba(0,0,0,0.4); padding:6px; border-radius:3px; gap:8px;">
            <span>${t('raid.preparedness')}</span>
            <span style="font-weight:bold; color:${defenseAdvantage >= 0 ? '#34d399' : '#f43f5e'}; text-align:right;">
              ${defenseAdvantage >= 0 ? t('raid.ready', { value: defenseAdvantage }) : t('raid.vulnerable', { value: Math.abs(defenseAdvantage) })}
            </span>
          </div>
        </div>

        ${battleResolved && battleResult ? `
          <div style="background:${battleResult.won ? 'rgba(6,78,59,0.3)' : 'rgba(127,29,29,0.3)'}; border:1.5px solid ${battleResult.won ? '#059669' : '#dc2626'}; border-radius:4px; padding:10px; margin-bottom:12px; text-align:center;">
            <div style="font-size:14px; font-weight:bold; font-family:var(--font-display); color:${battleResult.won ? '#34d399' : '#f87171'}; margin-bottom:4px;">
              ${battleResult.won ? `✦ ${t('raid.victory_title')} ✦` : `⚠️ ${t('raid.defeat_title')}`}
            </div>
            <p style="font-size:10px; color:#cbd5e1; margin:0 0 6px 0;">${battleResult.won ? t('raid.victory_desc') : t('raid.defeat_desc')}</p>
            <div style="font-size:10px; color:#fde047;">
              ${battleResult.won
                ? t('raid.victory_rewards', { gold: raid.rewardsOnWin.gold, iron: raid.rewardsOnWin.ironOre || 0 })
                : t('raid.defeat_losses', { wood: raid.penaltyOnLoss.woodCost, stone: raid.penaltyOnLoss.stoneCost })}
            </div>
          </div>
        ` : ''}

        <div style="display:flex; gap:8px;">
          ${!battleResolved ? `
            <button id="btn-resolve-defense" style="flex:1; padding:10px; background:linear-gradient(135deg, #ef4444, #991b1b); border:1px solid #f87171; border-radius:4px; color:#ffffff; font-family:var(--font-display); font-weight:bold; font-size:12px; letter-spacing:0.5px; cursor:pointer; box-shadow:0 0 12px rgba(239,68,68,0.4);">
              ⚔️ ${t('raid.engage')} ⚔️
            </button>
          ` : `
            <button id="btn-close-raid-modal" style="flex:1; padding:8px; background:#1c1917; border:1px solid #78350f; border-radius:4px; color:#cbd5e1; font-family:var(--font-display); font-size:12px; cursor:pointer;">${t('raid.close_dispatch')}</button>
          `}
        </div>
      `;

      el.querySelector('#btn-resolve-defense')?.addEventListener('click', () => {
        battleResult = settlementDefenseSystem.resolveRaid(activeRaidId);
        battleResolved = true;
        refresh();
      });

      el.querySelector('#btn-close-raid-modal')?.addEventListener('click', () => modalManager.close('settlement_raid_modal'));
    };

    refresh();
    return el;
  },
};
