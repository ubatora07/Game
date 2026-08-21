import { store } from '../../core/FantasyState';
import { BigNumber } from '../../core/BigNumber';
import { OfflineGainsResult } from '../../engine/OfflineEngine';
import { SaveEngine } from '../../engine/SaveEngine';
import { LegacyEngine } from '../../engine/LegacyEngine';
import { LEGACY_PERKS, LegacyPerkId } from '../../content/legacy';
import { CombatEngine } from '../../engine/CombatEngine';
import { rollGearDrop } from '../../content/gear';

export class Modals {
  public static showOfflineRewards(gains: OfflineGainsResult, onClose: () => void): void {
    const backdrop = document.createElement('div');
    backdrop.className = 'fantasy-modal-backdrop';

    backdrop.innerHTML = `
      <div class="fantasy-modal-card">
        <h2 style="color:var(--f-gold-bright); text-align:center; font-size:18px; margin-bottom:var(--f-space-md);">
          ⚔️ WHILE YOU WERE AWAY
        </h2>
        <div style="background:var(--f-bg-darker); border:1px solid var(--f-border-subtle); border-radius:var(--f-radius-md); padding:var(--f-space-md); margin-bottom:var(--f-space-lg); font-size:14px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--f-text-dim);">Time Away:</span>
            <span style="font-weight:700;">${gains.formattedTime}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--f-text-dim);">Gold Earned:</span>
            <span style="font-weight:700; color:var(--f-gold-bright);">+${BigNumber.format(gains.goldGained)} Gold</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--f-text-dim);">Enemies Defeated:</span>
            <span style="font-weight:700;">${BigNumber.format(gains.enemiesDefeated)}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--f-text-dim);">Items Found:</span>
            <span style="font-weight:700; color:var(--f-gems);">${gains.itemsGained.length}</span>
          </div>
        </div>
        <button class="attack-btn" style="width:100%; padding:10px 0; font-size:14px;" id="btn-collect-offline">
          COLLECT REWARDS
        </button>
      </div>
    `;

    document.body.appendChild(backdrop);

    backdrop.querySelector('#btn-collect-offline')!.addEventListener('click', () => {
      store.set((s) => {
        s.currencies.gold += gains.goldGained;
        s.currencies.lifetimeGold += gains.goldGained;
        s.currencies.lifetimeKills += gains.enemiesDefeated;
        gains.itemsGained.forEach((item) => {
          if (s.gear.inventory.length < 24) {
            s.gear.inventory.push(item);
          }
        });
      });
      document.body.removeChild(backdrop);
      onClose();
    });
  }

  public static showSettings(onClose: () => void): void {
    const backdrop = document.createElement('div');
    backdrop.className = 'fantasy-modal-backdrop';

    const s = store.get();

    backdrop.innerHTML = `
      <div class="fantasy-modal-card">
        <h2 style="color:var(--f-gold-bright); text-align:center; font-size:18px; margin-bottom:var(--f-space-md);">
          ⚙️ GAME SETTINGS
        </h2>
        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:var(--f-space-lg); font-size:14px;">
          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
            <span>Sound Effects</span>
            <input type="checkbox" id="chk-sound" ${s.settings.sound ? 'checked' : ''}>
          </label>
          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
            <span>Damage Numbers</span>
            <input type="checkbox" id="chk-numbers" ${s.settings.damageNumbers ? 'checked' : ''}>
          </label>
          <label style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
            <span>Screen Shake</span>
            <input type="checkbox" id="chk-shake" ${s.settings.screenShake ? 'checked' : ''}>
          </label>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <button id="btn-open-dev" style="background:#3f3f46; border:1px solid #71717a; color:#fff; padding:8px; border-radius:4px; font-weight:700; cursor:pointer;">
            🛠️ OPEN DEV DEBUG PANEL
          </button>
          <button id="btn-reset-save" style="background:#7f1d1d; border:1px solid #dc2626; color:#fff; padding:8px; border-radius:4px; font-weight:700; cursor:pointer;">
            🗑️ RESET BETA SAVE
          </button>
          <button id="btn-close-settings" class="attack-btn" style="padding:8px 0; margin-top:8px; font-size:14px;">
            CLOSE
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const soundChk = backdrop.querySelector('#chk-sound') as HTMLInputElement;
    const numChk = backdrop.querySelector('#chk-numbers') as HTMLInputElement;
    const shakeChk = backdrop.querySelector('#chk-shake') as HTMLInputElement;

    soundChk.addEventListener('change', () => {
      store.set((draft) => { draft.settings.sound = soundChk.checked; });
    });
    numChk.addEventListener('change', () => {
      store.set((draft) => { draft.settings.damageNumbers = numChk.checked; });
    });
    shakeChk.addEventListener('change', () => {
      store.set((draft) => { draft.settings.screenShake = shakeChk.checked; });
    });

    backdrop.querySelector('#btn-open-dev')!.addEventListener('click', () => {
      document.body.removeChild(backdrop);
      this.showDevDebug(onClose);
    });

    backdrop.querySelector('#btn-reset-save')!.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset your Beta 0.1 save? All progress will be cleared.')) {
        SaveEngine.reset();
        document.body.removeChild(backdrop);
        location.reload();
      }
    });

    backdrop.querySelector('#btn-close-settings')!.addEventListener('click', () => {
      document.body.removeChild(backdrop);
      onClose();
    });
  }

  public static showLegacyModal(onClose: () => void): void {
    const backdrop = document.createElement('div');
    backdrop.className = 'fantasy-modal-backdrop';

    const s = store.get();
    const potentialPoints = LegacyEngine.getPotentialPoints();

    const perks = Object.values(LEGACY_PERKS);

    backdrop.innerHTML = `
      <div class="fantasy-modal-card" style="max-width:480px; max-height:85vh; overflow-y:auto;">
        <h2 style="color:var(--f-legacy); text-align:center; font-size:18px; margin-bottom:4px;">
          👑 LEGACY PRESTIGE
        </h2>
        <p style="text-align:center; color:var(--f-text-dim); font-size:12px; margin-bottom:var(--f-space-md);">
          Harness your hero lifetime deeds to gain permanent power!
        </p>

        <div style="background:var(--f-bg-darker); border:1px solid var(--f-border-gold); border-radius:var(--f-radius-md); padding:var(--f-space-md); margin-bottom:var(--f-space-md); font-size:13px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span>Current Legacy Points:</span>
            <span style="font-weight:700; color:var(--f-legacy);">${BigNumber.format(s.currencies.legacyPoints)} LP</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span>Points on New Legacy:</span>
            <span style="font-weight:700; color:var(--f-gold-bright);">+${BigNumber.format(potentialPoints)} LP</span>
          </div>
          <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:6px; margin-top:6px; font-size:11px; color:var(--f-text-dim);">
            <div style="color:#ef4444;">❌ RESETS: Gold, Upgrades, Current World & Stage</div>
            <div style="color:#22c55e;">✔️ KEEPS: Equipped Gear, Inventory, Legacy Perks, Stats</div>
          </div>
        </div>

        <h3 style="font-size:13px; color:var(--f-gold-bright); margin-bottom:8px;">LEGACY PERKS:</h3>
        <div id="legacy-perks-list" style="display:flex; flex-direction:column; gap:8px; margin-bottom:var(--f-space-md);">
          ${perks.map((p) => {
            const lvl = s.legacy.upgrades[p.id];
            const cost = LegacyEngine.getPerkCost(p.id, lvl);
            const canAfford = s.currencies.legacyPoints >= cost;
            return `
              <div style="background:var(--f-bg-card); border:1px solid var(--f-border-subtle); border-radius:var(--f-radius-sm); padding:8px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:700; font-size:12px; color:var(--f-text-main);">${p.name} <span style="color:var(--f-legacy);">Lv.${lvl}</span></div>
                  <div style="font-size:11px; color:var(--f-text-dim);">${p.description}</div>
                </div>
                <button class="btn-buy-legacy-perk" data-id="${p.id}" style="background:${canAfford ? 'var(--f-legacy)' : '#3f3f46'}; border:none; border-radius:4px; color:#fff; font-size:11px; font-weight:700; padding:6px 10px; cursor:${canAfford ? 'pointer' : 'default'};">
                  ${cost} LP
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <div style="display:flex; gap:8px;">
          <button id="btn-trigger-prestige" class="attack-btn" style="flex:1; padding:10px 0; font-size:13px; background:linear-gradient(180deg, #7e22ce, #581c87); border-color:#a855f7;">
            BEGIN NEW LEGACY
          </button>
          <button id="btn-close-legacy" style="background:#3f3f46; border:none; border-radius:var(--f-radius-md); color:#fff; padding:0 16px; font-weight:700; cursor:pointer;">
            CLOSE
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    backdrop.querySelectorAll('.btn-buy-legacy-perk').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id') as LegacyPerkId;
        if (LegacyEngine.buyPerk(id)) {
          document.body.removeChild(backdrop);
          this.showLegacyModal(onClose);
        }
      });
    });

    backdrop.querySelector('#btn-trigger-prestige')!.addEventListener('click', () => {
      if (potentialPoints <= 0) {
        alert('You need to defeat more enemies and progress further to earn Legacy Points!');
        return;
      }
      if (confirm(`Start a New Legacy now? You will receive +${potentialPoints} Legacy Points and restart in World 1 stronger!`)) {
        LegacyEngine.performPrestige();
        document.body.removeChild(backdrop);
        onClose();
      }
    });

    backdrop.querySelector('#btn-close-legacy')!.addEventListener('click', () => {
      document.body.removeChild(backdrop);
      onClose();
    });
  }

  public static showDevDebug(onClose: () => void): void {
    const backdrop = document.createElement('div');
    backdrop.className = 'fantasy-modal-backdrop';

    backdrop.innerHTML = `
      <div class="fantasy-modal-card">
        <h2 style="color:#ef4444; text-align:center; font-size:16px; margin-bottom:var(--f-space-md);">
          🛠️ DEV DEBUG CONTROLS
        </h2>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:var(--f-space-md);">
          <button id="dev-gold" style="padding:8px; font-size:11px; background:#27272a; color:#fff; border:1px solid #52525b; border-radius:4px; cursor:pointer;">+10,000 Gold</button>
          <button id="dev-gems" style="padding:8px; font-size:11px; background:#27272a; color:#fff; border:1px solid #52525b; border-radius:4px; cursor:pointer;">+100 Gems</button>
          <button id="dev-boss" style="padding:8px; font-size:11px; background:#27272a; color:#fff; border:1px solid #52525b; border-radius:4px; cursor:pointer;">Spawn Boss</button>
          <button id="dev-kill" style="padding:8px; font-size:11px; background:#27272a; color:#fff; border:1px solid #52525b; border-radius:4px; cursor:pointer;">Kill Active Enemy</button>
          <button id="dev-item" style="padding:8px; font-size:11px; background:#27272a; color:#fff; border:1px solid #52525b; border-radius:4px; cursor:pointer;">Drop Rare Item</button>
          <button id="dev-legacy" style="padding:8px; font-size:11px; background:#27272a; color:#fff; border:1px solid #52525b; border-radius:4px; cursor:pointer;">+50 Legacy Points</button>
        </div>
        <button id="btn-close-dev" class="attack-btn" style="width:100%; padding:8px 0; font-size:13px;">
          CLOSE
        </button>
      </div>
    `;

    document.body.appendChild(backdrop);

    backdrop.querySelector('#dev-gold')!.addEventListener('click', () => {
      store.set((s) => { s.currencies.gold += 10000; s.currencies.lifetimeGold += 10000; });
    });
    backdrop.querySelector('#dev-gems')!.addEventListener('click', () => {
      store.set((s) => { s.currencies.gems += 100; });
    });
    backdrop.querySelector('#dev-boss')!.addEventListener('click', () => {
      CombatEngine.retryBoss();
      document.body.removeChild(backdrop);
    });
    backdrop.querySelector('#dev-kill')!.addEventListener('click', () => {
      const active = CombatEngine.getActiveEnemy();
      if (active) {
        CombatEngine.performPlayerClickAttack();
      }
    });
    backdrop.querySelector('#dev-item')!.addEventListener('click', () => {
      const item = rollGearDrop(store.get().world.currentWorldId, true);
      if (item) {
        store.set((s) => { s.gear.inventory.push(item); });
      }
    });
    backdrop.querySelector('#dev-legacy')!.addEventListener('click', () => {
      store.set((s) => { s.currencies.legacyPoints += 50; });
    });

    backdrop.querySelector('#btn-close-dev')!.addEventListener('click', () => {
      document.body.removeChild(backdrop);
      onClose();
    });
  }
}
