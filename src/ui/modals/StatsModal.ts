import { ModalInstance, modalManager } from '../components/ModalManager';
import { store } from '../../core/GameState';
import { EconomyEngine } from '../../economy/EconomyEngine';
import { BigNumber } from '../../core/BigNumber';
import { getRankById, getNextRank } from '../../content/ranks';
import { events } from '../../core/EventBus';
import { t } from '../../services/i18n/I18nService';

export const StatsModal: ModalInstance = {
  id: 'stats',
  render: () => {
    const s = store.get();
    const metrics = EconomyEngine.calculateMetrics(s);
    const rank = getRankById(s.rankId);
    const nextRank = getNextRank(s.rankId);
    const el = document.createElement('div');

    const totalBuildings = Object.values(s.buildings || {}).reduce((a, b) => a + b, 0);
    const heroesCount = Object.keys(s.heroes || {}).length;
    const canAscend = nextRank ? s.power >= nextRank.reqPower : false;
    const nextRankPct = nextRank ? Math.min(100, Math.floor((s.power / nextRank.reqPower) * 100)) : 100;

    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid var(--border-subtle); padding-bottom:8px;">
        <h2 style="font-family:var(--font-display); font-size:20px; color:#fde047; display:flex; align-items:center; gap:8px;">
          <span>🥋</span> ${t('modal.stats.title')}
        </h2>
        <button id="statsCloseBtn" class="close-stats-modal-btn" style="font-size:20px; color:var(--text-muted); cursor:pointer;">✕</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:14px; max-height:68vh; overflow-y:auto; padding-right:4px;">
        <!-- Protagonist Hero Profile Card -->
        <div style="
          background: linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.95));
          border: 2px solid ${rank.color};
          border-radius: var(--radius-lg);
          padding: 14px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 0 15px ${rank.color}30;
          position: relative;
        ">
          <!-- Animated Avatar Frame -->
          <div style="
            width: 58px;
            height: 58px;
            border-radius: 50%;
            background: rgba(15,23,42,0.9);
            border: 2px solid ${rank.color};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            box-shadow: 0 0 12px ${rank.color}60;
            flex-shrink: 0;
          ">
            🥋
          </div>

          <!-- Info -->
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-weight:900; font-size:15px; color:#fff;">
                ${t('rpg.protagonist')}
              </span>
              <span style="background:${rank.color}25; color:${rank.color}; border:1px solid ${rank.color}; font-size:10px; font-weight:bold; padding:1px 6px; border-radius:4px;">
                [${rank.id}] ${t(rank.nameKey)}
              </span>
            </div>

            <!-- Ascension Progress -->
            <div style="margin-top:6px;">
              <div style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-muted); margin-bottom:2px;">
                <span>${nextRank ? `${t('rpg.next_ascension')}: ${t(nextRank.nameKey)}` : 'MAX REALM'}</span>
                <span style="color:${canAscend ? '#10b981' : '#fde047'}; font-weight:bold;">${nextRankPct}%</span>
              </div>
              <div style="width:100%; height:6px; background:rgba(0,0,0,0.5); border-radius:3px; overflow:hidden;">
                <div style="width:${nextRankPct}%; height:100%; background:linear-gradient(90deg, #f59e0b, ${canAscend ? '#10b981' : '#fde047'});"></div>
              </div>
            </div>
          </div>

          ${canAscend ? `
            <button id="rpgAscendQuickBtn" style="
              background: linear-gradient(135deg, #10b981, #059669);
              border: 1px solid #34d399;
              color: #fff;
              font-weight: 900;
              font-size: 11px;
              padding: 6px 10px;
              border-radius: var(--radius-sm);
              cursor: pointer;
              box-shadow: 0 0 10px rgba(16,185,129,0.5);
              white-space: nowrap;
              flex-shrink: 0;
            ">
              ✨ ${t('ascend.ready')}
            </button>
          ` : ''}
        </div>

        <!-- Core RPG Combat Stats Grid -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <!-- Combat Power -->
          <div style="background:rgba(30,41,59,0.6); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:10px; text-align:center;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">⚔️ ${t('rpg.combat_power')}</div>
            <div style="font-size:15px; font-weight:900; color:#fde047; margin-top:2px;">
              ${BigNumber.format(metrics.passivePowerPerSec + metrics.towerCombatPower)}/s
            </div>
          </div>

          <!-- Strike Power -->
          <div style="background:rgba(30,41,59,0.6); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:10px; text-align:center;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">💥 ${t('rpg.tap_power')}</div>
            <div style="font-size:15px; font-weight:900; color:#38bdf8; margin-top:2px;">
              ${BigNumber.format(metrics.clickPower)}
            </div>
          </div>

          <!-- Crit Rate -->
          <div style="background:rgba(30,41,59,0.6); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:10px; text-align:center;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">🎯 ${t('rpg.crit_rate')}</div>
            <div style="font-size:15px; font-weight:900; color:#c084fc; margin-top:2px;">
              ${(metrics.critChance * 100).toFixed(1)}%
            </div>
          </div>

          <!-- Crit Damage -->
          <div style="background:rgba(30,41,59,0.6); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:10px; text-align:center;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; text-transform:uppercase;">⚡ ${t('rpg.crit_dmg')}</div>
            <div style="font-size:15px; font-weight:900; color:#f43f5e; margin-top:2px;">
              ${metrics.critMultiplier.toFixed(1)}×
            </div>
          </div>
        </div>

        <!-- Power Sources & Multipliers Breakdown -->
        <div style="background:rgba(30,41,59,0.6); border:1px solid var(--border-cyan); border-radius:var(--radius-md); padding:12px;">
          <div style="font-weight:bold; font-size:12px; color:var(--color-cyan); margin-bottom:8px; text-transform:uppercase; display:flex; justify-content:space-between;">
            <span>🌐 ${t('rpg.sources_title')}</span>
            <span>+${BigNumber.format(metrics.passivePowerPerSec)}/s</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:5px; font-size:11px;">
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">🏯 ${t('rpg.sect_output')}:</span>
              <span style="font-weight:bold;">${BigNumber.format(metrics.baseBuildingsPowerPerSec)} / s</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">👑 ${t('rpg.rank_mult')}:</span>
              <span style="color:#fbbf24; font-weight:bold;">×${metrics.rankMultiplier}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">⚔️ ${t('upgrade.title')}:</span>
              <span style="color:#38bdf8; font-weight:bold;">×${metrics.globalUpgradesMultiplier.toFixed(2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">👥 ${t('rpg.heroes_party')}:</span>
              <span style="color:#c084fc; font-weight:bold;">×${metrics.heroPowerMultiplier.toFixed(2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">🌌 ${t('rpg.soul_mastery')}:</span>
              <span style="color:#f43f5e; font-weight:bold;">×${metrics.soulPowerMultiplier.toFixed(2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">🔥 ${t('rpg.surge_buffs')}:</span>
              <span style="color:#10b981; font-weight:bold;">×${metrics.activeSurgeMultiplier.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <!-- Lifetime Statistics -->
        <div style="background:rgba(30,41,59,0.6); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:12px;">
          <div style="font-weight:bold; font-size:12px; color:#fde047; margin-bottom:8px; text-transform:uppercase;">
            📜 Lifetime Records
          </div>
          <div style="display:flex; flex-direction:column; gap:4px; font-size:11px;">
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Lifetime Power:</span>
              <span style="font-weight:bold; color:#fde047;">${BigNumber.format(s.stats.lifetimePower)} ⚡</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Lifetime Gold:</span>
              <span style="font-weight:bold; color:#fde047;">${BigNumber.format(s.stats.lifetimeGold)} 🪙</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Manual Training Taps:</span>
              <span style="font-weight:bold;">${s.stats.totalClicks} (${s.stats.totalCrits} Crits)</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Sect Buildings Owned:</span>
              <span style="font-weight:bold;">${totalBuildings}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Allied Heroes:</span>
              <span style="font-weight:bold; color:#c084fc;">${heroesCount} / 16</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Highest Tower Floor:</span>
              <span style="font-weight:bold; color:#38bdf8;">Floor ${s.towerMaxFloor}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Campaign Bosses Slain:</span>
              <span style="font-weight:bold; color:#ef4444;">${s.stats.campaignBossesDefeated || 0}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Reincarnations Performed:</span>
              <span style="font-weight:bold; color:#f43f5e;">${s.reincarnationCount}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Total Active Playtime:</span>
              <span style="font-weight:bold;">${BigNumber.formatTime(s.stats.playtimeSeconds)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    el.querySelector('#statsCloseBtn')?.addEventListener('click', () => {
      modalManager.close('stats');
    });

    el.querySelector('#rpgAscendQuickBtn')?.addEventListener('click', () => {
      modalManager.close('stats');
      events.emit('screen:change', { screenId: 'ascension' });
    });

    return el;
  }
};
