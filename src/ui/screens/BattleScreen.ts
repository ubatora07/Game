import { store } from '../../core/GameState';
import { BUILDINGS, calculateBuildingCost, calculateMaxAffordableBuildings, getBuildingMilestoneMultiplier, getNextBuildingMilestone } from '../../content/buildings';
import { UPGRADES, calculateUpgradeCost } from '../../content/upgrades';
import { BattlefieldViewport } from '../components/BattlefieldViewport';
import { ParticleCanvas } from '../vfx/ParticleCanvas';
import { BigNumber } from '../../core/BigNumber';
import { EconomyEngine } from '../../economy/EconomyEngine';
import { CampaignProgressionSystem } from '../../systems/CampaignProgressionSystem';
import { campaignCombatService } from '../../systems/CampaignCombatService';
import { getCampaignWorldById } from '../../content/campaignWorlds';
import { getRankById, getNextRank } from '../../content/ranks';
import { QUESTS } from '../../content/quests';
import { QuestSystem } from '../../systems/QuestSystem';
import { RandomEventSystem } from '../../systems/RandomEventSystem';
import { t } from '../../services/i18n/I18nService';
import { events } from '../../core/EventBus';
import { sound } from '../../services/audio/SoundService';
import { adService } from '../../services/ads/AdService';

export class BattleScreen {
  private el: HTMLElement;
  private viewport: BattlefieldViewport;
  private buyMultiplier: 1 | 10 | 100 | 'max' = 1;
  private activeCategory: 'buildings' | 'upgrades' = 'buildings';
  private renderedCategory: string = '';
  private renderedRankIndex: number = -1;

  constructor(particleCanvas?: ParticleCanvas) {
    this.viewport = new BattlefieldViewport(particleCanvas);
    this.el = document.createElement('div');
    this.el.className = 'screen-container battle-screen-container';
    this.render();
    this.bind();
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  private bind(): void {
    store.subscribe(() => this.update());
    document.addEventListener('i18n:change', () => {
      this.renderedCategory = '';
      this.renderedRankIndex = -1;
      this.render();
    });

    events.on('campaign:stage_cleared', () => this.updateStageHeader());
    events.on('campaign:mode_changed', () => this.updateStageHeader());
    events.on('campaign:boss_failed', () => this.updateStageHeader());

    // Attack Action
    const attackBtn = this.el.querySelector('#trainActionBtn') as HTMLElement;
    const handleAttack = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const rect = attackBtn.getBoundingClientRect();
      const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as MouseEvent).clientX || (rect.left + rect.width / 2);
      const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as MouseEvent).clientY || (rect.top + rect.height / 2);

      this.viewport.triggerAttack(clientX, clientY);

      attackBtn.style.transform = 'scale(0.96)';
      setTimeout(() => {
        attackBtn.style.transform = '';
      }, 100);
    };
    attackBtn?.addEventListener('pointerdown', handleAttack);

    // Desktop Keyboard Shortcuts
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeydown);
    }

    // Global Click Delegation on Container
    this.el.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Auto Advance Toggle
      if (target.closest('#autoAdvanceToggleBtn')) {
        store.set((draft) => {
          CampaignProgressionSystem.toggleAutoAdvance(draft);
        });
        sound.playTap();
        this.updateStageHeader();
        return;
      }

      // Boss Retry Normal CTA
      if (target.closest('#bossRetryBtn')) {
        if (store.get().campaign.campaignMode === 'boss_blocked') {
          store.set((draft) => {
            CampaignProgressionSystem.retryBoss(draft, false);
          });
          campaignCombatService.spawnCurrentEncounter();
          sound.playTap();
          this.updateStageHeader();
        }
        return;
      }

      // Boss Boosted Retry CTA (Rewarded Ad)
      if (target.closest('#bossBoostedRetryBtn')) {
        if (store.get().campaign.campaignMode === 'boss_blocked') {
          adService.showRewardedAd('boss_retry_boost').then((success) => {
            if (success) {
              store.set((draft) => {
                CampaignProgressionSystem.retryBoss(draft, true);
              });
              campaignCombatService.spawnCurrentEncounter();
              sound.playAscension();
              events.emit('toast:show', { message: t('toast.battle.boss_surge', { percent: 25 }), type: 'epic' });
              this.updateStageHeader();
            }
          });
        }
        return;
      }

      // Quick Ascend CTA
      if (target.closest('#ascendQuickBtn')) {
        events.emit('screen:change', { screenId: 'ascension' });
        return;
      }

      // Golden Spirit Orb
      if (target.closest('#goldenSpiritOrb')) {
        RandomEventSystem.claimEvent();
        return;
      }

      // View Quests CTA
      if (target.closest('#viewAllQuestsBtn')) {
        events.emit('screen:change', { screenId: 'quests' });
        return;
      }

      // Category Tab: Buildings
      if (target.closest('#tabBuildingsBtn')) {
        if (this.activeCategory !== 'buildings') {
          this.activeCategory = 'buildings';
          this.updateTabStyles();
          this.buildListDOM();
          this.updateList();
        }
        return;
      }

      // Category Tab: Upgrades
      if (target.closest('#tabUpgradesBtn')) {
        if (this.activeCategory !== 'upgrades') {
          this.activeCategory = 'upgrades';
          this.updateTabStyles();
          this.buildListDOM();
          this.updateList();
        }
        return;
      }

      // Multiplier buttons
      const multBtn = target.closest('.buy-mult-btn') as HTMLElement;
      if (multBtn) {
        const val = multBtn.dataset.mult;
        this.buyMultiplier = val === 'max' ? 'max' : (Number(val) as 1 | 10 | 100);
        sound.playTap();
        this.updateMultiplierStyles();
        this.updateList();
        return;
      }
    });

    this.buildListDOM();
    this.update();
  }

  private updateTabStyles(): void {
    const bTab = this.el.querySelector('#tabBuildingsBtn') as HTMLElement;
    const uTab = this.el.querySelector('#tabUpgradesBtn') as HTMLElement;

    if (bTab) {
      bTab.style.borderColor = this.activeCategory === 'buildings' ? '#f59e0b' : 'var(--border-subtle)';
      bTab.style.background = this.activeCategory === 'buildings' ? 'rgba(245,158,11,0.2)' : 'rgba(30,41,59,0.5)';
      bTab.style.color = this.activeCategory === 'buildings' ? '#fde047' : 'var(--text-muted)';
    }

    if (uTab) {
      uTab.style.borderColor = this.activeCategory === 'upgrades' ? '#38bdf8' : 'var(--border-subtle)';
      uTab.style.background = this.activeCategory === 'upgrades' ? 'rgba(56,189,248,0.2)' : 'rgba(30,41,59,0.5)';
      uTab.style.color = this.activeCategory === 'upgrades' ? '#7dd3fc' : 'var(--text-muted)';
    }
  }

  private updateMultiplierStyles(): void {
    this.el.querySelectorAll('.buy-mult-btn').forEach((btn) => {
      const el = btn as HTMLElement;
      const val = el.dataset.mult;
      const isActive = (val === 'max' && this.buyMultiplier === 'max') || (Number(val) === this.buyMultiplier);
      el.classList.toggle('active', isActive);
      el.style.background = isActive ? '#f59e0b' : 'transparent';
      el.style.color = isActive ? '#000' : 'var(--text-muted)';
    });
  }

  private update(): void {
    this.updateStageHeader();
    this.updateList();
    this.updateNextGoal();
  }

  private updateStageHeader(): void {
    const state = store.get();
    CampaignProgressionSystem.ensureCampaignState(state);
    const stage = CampaignProgressionSystem.getCurrentStage(state);
    const world = getCampaignWorldById(stage.worldId);

    const worldTitleEl = this.el.querySelector('#campaignWorldTitle') as HTMLElement;
    const stageTitleEl = this.el.querySelector('#campaignStageTitle') as HTMLElement;
    const modeBadgeEl = this.el.querySelector('#campaignModeBadge') as HTMLElement;
    const autoAdvanceBtn = this.el.querySelector('#autoAdvanceToggleBtn') as HTMLElement;

    if (worldTitleEl) worldTitleEl.textContent = `${t('campaign.world').toUpperCase()} ${stage.worldId} — ${world ? t(world.nameKey).toUpperCase() : t('common.unknown').toUpperCase()}`;
    if (stageTitleEl) stageTitleEl.textContent = `${t('campaign.stage')} ${stage.id} ${stage.isBoss ? '👑' : ''}`;

    if (modeBadgeEl) {
      const mode = state.campaign.campaignMode;
      modeBadgeEl.textContent = t(`campaign.mode_${mode}`).toUpperCase();
      if (mode === 'rush') {
        modeBadgeEl.style.background = 'rgba(239,68,68,0.3)';
        modeBadgeEl.style.color = '#f87171';
        modeBadgeEl.style.borderColor = '#ef4444';
      } else if (mode === 'farm') {
        modeBadgeEl.style.background = 'rgba(16,185,129,0.3)';
        modeBadgeEl.style.color = '#34d399';
        modeBadgeEl.style.borderColor = '#10b981';
      } else if (mode === 'boss_blocked') {
        modeBadgeEl.style.background = 'rgba(245,158,11,0.3)';
        modeBadgeEl.style.color = '#fbbf24';
        modeBadgeEl.style.borderColor = '#f59e0b';
      } else {
        modeBadgeEl.style.background = 'rgba(56,189,248,0.2)';
        modeBadgeEl.style.color = '#38bdf8';
        modeBadgeEl.style.borderColor = '#0284c7';
      }
    }

    const bossRetryContainer = this.el.querySelector('#bossRetryContainer') as HTMLElement;
    if (bossRetryContainer) {
      bossRetryContainer.style.display = state.campaign.campaignMode === 'boss_blocked' ? 'flex' : 'none';
    }

    if (autoAdvanceBtn) {
      autoAdvanceBtn.textContent = state.campaign.autoAdvance ? t('campaign.auto_advance_on') : t('campaign.auto_advance_off');
      autoAdvanceBtn.style.background = state.campaign.autoAdvance ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)';
      autoAdvanceBtn.style.borderColor = state.campaign.autoAdvance ? '#10b981' : '#64748b';
      autoAdvanceBtn.style.color = state.campaign.autoAdvance ? '#34d399' : '#94a3b8';
    }

    this.updateProgressStrip(stage.stageNumber, world?.stageCount || 10);
  }

  private updateProgressStrip(stageNumber: number, maxStages: number): void {
    const stripEl = this.el.querySelector('#stageNodeStrip') as HTMLElement;
    if (!stripEl) return;

    let nodes = '';
    for (let s = 1; s <= maxStages; s++) {
      const isCompleted = s < stageNumber;
      const isCurrent = s === stageNumber;
      const isBoss = s === maxStages;
      const isMiniBoss = s === Math.floor(maxStages / 2);

      let symbol = isBoss ? '☠' : isMiniBoss ? '◆' : '●';
      let color = isCompleted ? '#10b981' : isCurrent ? '#fde047' : '#64748b';

      nodes += `<span style="color:${color}; font-weight:bold; font-size:${isCurrent ? '13px' : '11px'};">${symbol}</span>`;
      if (s < maxStages) {
        nodes += `<span style="color:${isCompleted ? '#10b981' : '#334155'}; font-size:10px;">━</span>`;
      }
    }
    stripEl.innerHTML = nodes;
  }

  private updateNextGoal(): void {
    const state = store.get();
    const metrics = EconomyEngine.calculateMetrics(state);
    const rank = getRankById(state.rankId);
    const nextRank = getNextRank(state.rankId);

    const stagePowerNumber = this.el.querySelector('#stagePowerNumber') as HTMLElement;
    const stagePowerRate = this.el.querySelector('#stagePowerRate') as HTMLElement;
    const stageComboDisplay = this.el.querySelector('#stageComboDisplay') as HTMLElement;
    const stageRankName = this.el.querySelector('#stageRankName') as HTMLElement;
    const stageProgressPct = this.el.querySelector('#stageProgressPct') as HTMLElement;
    const stageProgressBar = this.el.querySelector('#stageProgressBar') as HTMLElement;
    const nextGoalText = this.el.querySelector('#nextGoalText') as HTMLElement;
    const ascendQuickBtn = this.el.querySelector('#ascendQuickBtn') as HTMLElement;
    const goldenSpiritOrb = this.el.querySelector('#goldenSpiritOrb') as HTMLElement;

    if (stagePowerNumber) stagePowerNumber.textContent = BigNumber.format(state.power);
    if (stagePowerRate) stagePowerRate.textContent = t('battle.per_second', { value: BigNumber.format(metrics.passivePowerPerSec) });

    if (stageComboDisplay) {
      if (state.combo && state.combo.count > 0 && state.combo.timer > 0) {
        stageComboDisplay.style.display = 'block';
        stageComboDisplay.textContent = t('battle.combo', { multiplier: state.combo.multiplier.toFixed(1), count: state.combo.count });
      } else {
        stageComboDisplay.style.display = 'none';
      }
    }

    if (stageRankName) stageRankName.textContent = t(rank.nameKey);

    if (nextRank) {
      const req = nextRank.reqPower;
      const pct = Math.min(100, Math.floor((state.power / req) * 100));
      if (nextGoalText) nextGoalText.textContent = `${t(nextRank.nameKey)} (${pct}%)`;
      if (stageProgressPct) stageProgressPct.textContent = `${pct}%`;
      if (stageProgressBar) stageProgressBar.style.width = `${pct}%`;

      if (ascendQuickBtn) {
        if (state.power >= req) {
          ascendQuickBtn.style.display = 'block';
          ascendQuickBtn.innerHTML = `✨ ${t('ascend.ready')}`;
        } else {
          ascendQuickBtn.style.display = 'none';
        }
      }
    } else {
      if (nextGoalText) nextGoalText.textContent = t('battle.max_rank');
      if (stageProgressPct) stageProgressPct.textContent = '100%';
      if (stageProgressBar) stageProgressBar.style.width = '100%';
      if (ascendQuickBtn) ascendQuickBtn.style.display = 'none';
    }

    if (goldenSpiritOrb) {
      goldenSpiritOrb.style.display = state.randomEvent?.active ? 'flex' : 'none';
    }

    // Quick Quests Deck
    const quickQuestsContainer = this.el.querySelector('#homeQuickQuests');
    if (quickQuestsContainer) {
      const activeQuest = QUESTS.find(q => !state.completedQuests.includes(q.id));
      if (activeQuest) {
        const progress = Math.min(activeQuest.targetCount, activeQuest.getProgress(state));
        const pct = Math.floor((progress / activeQuest.targetCount) * 100);
        const canClaim = progress >= activeQuest.targetCount;

        quickQuestsContainer.innerHTML = `
          <div style="background:rgba(17,24,39,0.9); border:1px solid ${canClaim ? '#fde047' : 'var(--border-subtle)'}; border-radius:var(--radius-sm); padding:8px 10px; display:flex; flex-direction:column; gap:4px; box-shadow:${canClaim ? '0 0 12px rgba(253,224,71,0.3)' : 'none'};">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:bold; font-size:12px; color:var(--text-main);">${t(activeQuest.nameKey)}</span>
              <span style="font-size:10px; color:${canClaim ? '#fde047' : '#94a3b8'}; font-weight:bold;">${progress}/${activeQuest.targetCount} (${pct}%)</span>
            </div>
            <div style="width:100%; height:4px; background:rgba(30,41,59,0.8); border-radius:var(--radius-full); overflow:hidden;">
              <div style="width:${pct}%; height:100%; background:${canClaim ? '#fde047' : '#f59e0b'}; transition:width 0.2s ease;"></div>
            </div>
            ${canClaim ? `
              <button class="quick-claim-btn" data-quest="${activeQuest.id}" style="margin-top:4px; padding:4px 8px; font-size:11px; font-weight:bold; background:linear-gradient(135deg, #d97706, #f59e0b); color:#000; border:none; border-radius:4px; cursor:pointer;">
                🎁 ${t('btn.claim')}${activeQuest.reward?.gold ? ` (+${activeQuest.reward.gold}🪙)` : ''}
              </button>
            ` : ''}
          </div>
        `;

        const quickClaimBtn = quickQuestsContainer.querySelector('.quick-claim-btn');
        if (quickClaimBtn) {
          quickClaimBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            QuestSystem.claimQuest(activeQuest.id);
            sound.playClaim();
          });
        }
      }
    }
  }

  private buildListDOM(): void {
    const list = this.el.querySelector('#homeListContainer');
    if (!list) return;

    const s = store.get();
    this.renderedCategory = this.activeCategory;
    this.renderedRankIndex = s.rankIndex;
    list.innerHTML = '';

    if (this.activeCategory === 'buildings') {
      BUILDINGS.forEach((building) => {
        // Show current rank buildings and locked preview for next rank
        if (s.rankIndex < building.requiredRankIndex) {
          if (building.requiredRankIndex === s.rankIndex + 1) {
            const lockCard = document.createElement('div');
            lockCard.className = 'building-card-locked';
            lockCard.style.cssText = `
              display: flex;
              align-items: center;
              gap: 10px;
              background: rgba(15, 23, 42, 0.5);
              border: 1px dashed var(--border-subtle);
              border-radius: var(--radius-md);
              padding: 8px 12px;
              opacity: 0.6;
            `;
            lockCard.innerHTML = `
              <div style="font-size:20px; width:38px; height:38px; display:flex; align-items:center; justify-content:center; background:rgba(30,41,59,0.4); border-radius:var(--radius-sm);">
                🔒
              </div>
              <div style="flex:1;">
                <div style="font-weight:bold; font-size:12px; color:var(--text-muted);">
                  ${t(building.nameKey)}
                </div>
                <div style="font-size:10px; color:#f59e0b;">
                  🔒 ${t('sect.unlocked_rank')} ${building.requiredRankIndex + 1}
                </div>
              </div>
            `;
            list.appendChild(lockCard);
          }
          return;
        }

        const card = document.createElement('div');
        card.className = 'building-card';
        card.id = `bcard_${building.id}`;
        card.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(17, 24, 39, 0.85);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 8px 12px;
          transition: all 0.15s ease;
        `;

        card.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px; flex:1;">
            <div style="font-size:24px; width:40px; height:40px; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle, rgba(245,158,11,0.15), rgba(30,41,59,0.8)); border-radius:var(--radius-sm); border:1px solid rgba(245,158,11,0.3); box-shadow:0 0 8px rgba(0,0,0,0.5);">
              ${building.icon}
            </div>
            <div style="flex:1;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-right:8px;">
                <span style="font-weight:bold; font-size:13px; color:var(--text-main); display:flex; align-items:center; gap:4px;">
                  ${t(building.nameKey)} <span class="b-owned" style="font-size:12px; color:#fde047; font-weight:bold;">×0</span>
                  <span class="b-best-value" style="display:none; font-size:9px; background:linear-gradient(90deg, #f59e0b, #ef4444); color:#000; font-weight:900; padding:1px 5px; border-radius:3px; letter-spacing:0.5px;">${t('battle.best')}</span>
                </span>
                <span class="b-contrib" style="font-size:10px; color:#38bdf8; font-weight:bold;"></span>
              </div>
              <div style="font-size:11px; color:var(--text-muted); display:flex; gap:6px; align-items:center;">
                <span class="b-rate">+0/s</span>
                <span class="b-milestone" style="color:#10b981; font-size:10px; font-weight:bold;"></span>
              </div>
            </div>
          </div>

          <button class="buy-building-action-btn" data-building-id="${building.id}" style="
            min-width: 84px;
            height: 38px;
            background: rgba(51, 65, 85, 0.5);
            border: 1px solid transparent;
            border-radius: var(--radius-sm);
            color: #64748b;
            font-weight: bold;
            font-size: 11px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          ">
            <span class="btn-count">+1</span>
            <span class="btn-cost" style="font-size:10px;">🪙 0</span>
          </button>
        `;

        const btn = card.querySelector('.buy-building-action-btn') as HTMLElement;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.executeBuildingPurchase(building.id);
        });

        list.appendChild(card);
      });
    } else {
      UPGRADES.forEach((upg) => {
        if (s.rankIndex < upg.requiredRankIndex) return;

        // Check synergy unlock requirements
        if (upg.unlockCheck && !upg.unlockCheck(s)) return;

        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.id = `ucard_${upg.id}`;
        card.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(17, 24, 39, 0.85);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 8px 12px;
        `;

        card.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="font-size:22px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(30,41,59,0.7); border-radius:var(--radius-sm);">
              ${upg.icon}
            </div>
            <div>
              <div style="font-weight:bold; font-size:12px; color:var(--text-main);">
                ${t(upg.nameKey)} <span class="u-lvl" style="font-size:11px; color:#38bdf8;">Lv.0/${upg.maxLevel}</span>
              </div>
              <div style="font-size:10px; color:var(--text-muted);">
                ${t(upg.descKey)}
              </div>
            </div>
          </div>

          <button class="buy-upg-action-btn" data-upgrade-id="${upg.id}" style="
            min-width: 80px;
            height: 36px;
            background: rgba(51, 65, 85, 0.5);
            border: 1px solid transparent;
            border-radius: var(--radius-sm);
            color: #64748b;
            font-weight: bold;
            font-size: 11px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span class="upg-cost">🪙 0</span>
          </button>
        `;

        const btn = card.querySelector('.buy-upg-action-btn') as HTMLElement;
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.executeUpgradePurchase(upg.id);
        });

        list.appendChild(card);
      });
    }
  }

  private updateList(): void {
    const s = store.get();

    if (this.renderedCategory !== this.activeCategory || this.renderedRankIndex !== s.rankIndex) {
      this.buildListDOM();
    }

    const metrics = EconomyEngine.calculateMetrics(s);
    const discount = metrics.buildingCostDiscount || 0;

    if (this.activeCategory === 'buildings') {
      // Find best value purchase (highest power gained per gold spent)
      let bestBuildingId = '';
      let highestEfficiency = 0;

      BUILDINGS.forEach((building) => {
        if (s.rankIndex < building.requiredRankIndex) return;
        const currentOwned = s.buildings[building.id] || 0;
        const cost = calculateBuildingCost(building, currentOwned, 1, discount);
        const milestoneMult = getBuildingMilestoneMultiplier(currentOwned);
        const powerGain = building.baseProduction * milestoneMult;
        const eff = cost > 0 ? powerGain / cost : 0;
        if (eff > highestEfficiency) {
          highestEfficiency = eff;
          bestBuildingId = building.id;
        }
      });

      BUILDINGS.forEach((building) => {
        const card = this.el.querySelector(`#bcard_${building.id}`);
        if (!card) return;

        const currentOwned = s.buildings[building.id] || 0;
        let buyCount = 1;
        let totalCost = 0;

        if (this.buyMultiplier === 1) {
          buyCount = 1;
          totalCost = calculateBuildingCost(building, currentOwned, 1, discount);
        } else if (this.buyMultiplier === 10) {
          buyCount = 10;
          totalCost = calculateBuildingCost(building, currentOwned, 10, discount);
        } else if (this.buyMultiplier === 100) {
          buyCount = 100;
          totalCost = calculateBuildingCost(building, currentOwned, 100, discount);
        } else {
          const maxInfo = calculateMaxAffordableBuildings(building, currentOwned, s.gold, discount);
          buyCount = Math.max(1, maxInfo.count);
          totalCost = maxInfo.totalCost > 0 ? maxInfo.totalCost : calculateBuildingCost(building, currentOwned, 1, discount);
        }

        const canAfford = s.gold >= totalCost && totalCost > 0;
        const detail = metrics.buildingDetails[building.id];
        const milestoneMult = getBuildingMilestoneMultiplier(currentOwned);
        const nextMilestone = getNextBuildingMilestone(currentOwned);

        const ownedEl = card.querySelector('.b-owned') as HTMLElement;
        const contribEl = card.querySelector('.b-contrib') as HTMLElement;
        const rateEl = card.querySelector('.b-rate') as HTMLElement;
        const milestoneEl = card.querySelector('.b-milestone') as HTMLElement;
        const bestValueEl = card.querySelector('.b-best-value') as HTMLElement;
        const btnCountEl = card.querySelector('.btn-count') as HTMLElement;
        const btnCostEl = card.querySelector('.btn-cost') as HTMLElement;
        const btn = card.querySelector('.buy-building-action-btn') as HTMLElement;

        if (ownedEl) ownedEl.innerText = `×${currentOwned}`;
        if (contribEl) contribEl.innerText = detail && detail.contributionPct > 0 ? `${detail.contributionPct}%` : '';
        if (rateEl) rateEl.innerText = `+${BigNumber.format(detail ? detail.totalBuildingPowerPerSec : building.baseProduction * milestoneMult)}/s`;
        if (milestoneEl) {
          if (nextMilestone) {
            milestoneEl.innerText = `[${currentOwned}/${nextMilestone.target}] (×${nextMilestone.multiplier.toFixed(1)})`;
          } else {
            milestoneEl.innerText = `(×${milestoneMult.toFixed(1)})`;
          }
        }
        if (bestValueEl) {
          bestValueEl.style.display = (building.id === bestBuildingId && currentOwned > 0) ? 'inline-block' : 'none';
        }
        if (btnCountEl) btnCountEl.innerText = `+${buyCount}`;
        if (btnCostEl) btnCostEl.innerText = `🪙 ${BigNumber.format(totalCost)}`;

        if (btn) {
          btn.style.background = canAfford ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'rgba(51, 65, 85, 0.5)';
          btn.style.borderColor = canAfford ? '#fde047' : 'transparent';
          btn.style.color = canAfford ? '#000' : '#64748b';
          btn.style.cursor = canAfford ? 'pointer' : 'not-allowed';
          btn.style.boxShadow = canAfford ? '0 0 10px rgba(245,158,11,0.3)' : 'none';
        }
      });
    } else {
      UPGRADES.forEach((upg) => {
        const card = this.el.querySelector(`#ucard_${upg.id}`);
        if (!card) return;

        const currentLvl = s.upgrades[upg.id] || 0;
        const isMax = currentLvl >= upg.maxLevel;
        const cost = calculateUpgradeCost(upg, currentLvl);
        const canAfford = s.gold >= cost && !isMax;

        const lvlEl = card.querySelector('.u-lvl') as HTMLElement;
        const costEl = card.querySelector('.upg-cost') as HTMLElement;
        const btn = card.querySelector('.buy-upg-action-btn') as HTMLElement;

        if (lvlEl) lvlEl.innerText = t('common.level_progress', { current: currentLvl, max: upg.maxLevel });
        if (costEl) costEl.innerText = isMax ? t('btn.max') : `🪙 ${BigNumber.format(cost)}`;

        if (btn) {
          if (isMax) {
            btn.style.background = 'rgba(30, 41, 59, 0.5)';
            btn.style.color = '#64748b';
            btn.style.cursor = 'default';
          } else {
            btn.style.background = canAfford ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'rgba(51, 65, 85, 0.5)';
            btn.style.borderColor = canAfford ? '#38bdf8' : 'transparent';
            btn.style.color = canAfford ? '#000' : '#64748b';
            btn.style.cursor = canAfford ? 'pointer' : 'not-allowed';
          }
        }
      });
    }
  }

  private executeBuildingPurchase(buildingId: string): void {
    const s = store.get();
    const b = BUILDINGS.find((item) => item.id === buildingId);
    if (!b) return;

    const metrics = EconomyEngine.calculateMetrics(s);
    const discount = metrics.buildingCostDiscount || 0;
    const currentOwned = s.buildings[b.id] || 0;
    let buyCount = 1;
    let totalCost = 0;

    if (this.buyMultiplier === 1) {
      buyCount = 1;
      totalCost = calculateBuildingCost(b, currentOwned, 1, discount);
    } else if (this.buyMultiplier === 10) {
      buyCount = 10;
      totalCost = calculateBuildingCost(b, currentOwned, 10, discount);
    } else if (this.buyMultiplier === 100) {
      buyCount = 100;
      totalCost = calculateBuildingCost(b, currentOwned, 100, discount);
    } else {
      const maxInfo = calculateMaxAffordableBuildings(b, currentOwned, s.gold, discount);
      buyCount = maxInfo.count;
      totalCost = maxInfo.totalCost;
    }

    if (buyCount <= 0 || s.gold < totalCost) return;

    store.set((draft) => {
      draft.gold -= totalCost;
      draft.buildings[b.id] = currentOwned + buyCount;
      draft.stats.totalBuildingsOwned = (draft.stats.totalBuildingsOwned || 0) + buyCount;
    });

    sound.playBuy();
    events.emit('building:buy', { buildingId: b.id, count: buyCount, totalCost });
    this.updateList();
  }

  private executeUpgradePurchase(upgradeId: string): void {
    const s = store.get();
    const upg = UPGRADES.find((item) => item.id === upgradeId);
    if (!upg) return;

    const currentLvl = s.upgrades[upg.id] || 0;
    if (currentLvl >= upg.maxLevel) return;

    const cost = calculateUpgradeCost(upg, currentLvl);
    if (s.gold < cost) return;

    store.set((draft) => {
      draft.gold -= cost;
      draft.upgrades[upg.id] = currentLvl + 1;
    });

    sound.playUpgrade();
    events.emit('upgrade:buy', { upgradeId: upg.id, newLevel: currentLvl + 1, cost });
    this.updateList();
  }

  private render(): void {
    this.el.innerHTML = `
      <div class="home-desktop-grid">
        <!-- Left Column: Sect Buildings & Upgrades (Desktop) -->
        <div class="home-col-left" id="homeLeftCol">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid var(--border-subtle); padding-bottom:8px;">
            <div style="display:flex; gap:6px;">
              <button id="tabBuildingsBtn" style="padding:5px 12px; font-size:12px; font-weight:bold; border-radius:var(--radius-sm); border:1px solid ${this.activeCategory === 'buildings' ? '#f59e0b' : 'var(--border-subtle)'}; background:${this.activeCategory === 'buildings' ? 'rgba(245,158,11,0.2)' : 'rgba(30,41,59,0.5)'}; color:${this.activeCategory === 'buildings' ? '#fde047' : 'var(--text-muted)'}; cursor:pointer;">
                🏯 ${t('building.title')}
              </button>
              <button id="tabUpgradesBtn" style="padding:5px 12px; font-size:12px; font-weight:bold; border-radius:var(--radius-sm); border:1px solid ${this.activeCategory === 'upgrades' ? '#38bdf8' : 'var(--border-subtle)'}; background:${this.activeCategory === 'upgrades' ? 'rgba(56,189,248,0.2)' : 'rgba(30,41,59,0.5)'}; color:${this.activeCategory === 'upgrades' ? '#7dd3fc' : 'var(--text-muted)'}; cursor:pointer;">
                ⚡ ${t('upgrade.title')}
              </button>
            </div>

            <!-- Multipliers -->
            <div style="display:flex; gap:3px; background:rgba(15,23,42,0.9); padding:2px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
              <button class="buy-mult-btn ${this.buyMultiplier === 1 ? 'active' : ''}" data-mult="1" style="padding:3px 7px; font-size:11px; font-weight:bold; border-radius:4px; cursor:pointer; color:${this.buyMultiplier === 1 ? '#000' : 'var(--text-muted)'}; background:${this.buyMultiplier === 1 ? '#f59e0b' : 'transparent'};">1x</button>
              <button class="buy-mult-btn ${this.buyMultiplier === 10 ? 'active' : ''}" data-mult="10" style="padding:3px 7px; font-size:11px; font-weight:bold; border-radius:4px; cursor:pointer; color:${this.buyMultiplier === 10 ? '#000' : 'var(--text-muted)'}; background:${this.buyMultiplier === 10 ? '#f59e0b' : 'transparent'};">10x</button>
              <button class="buy-mult-btn ${this.buyMultiplier === 100 ? 'active' : ''}" data-mult="100" style="padding:3px 7px; font-size:11px; font-weight:bold; border-radius:4px; cursor:pointer; color:${this.buyMultiplier === 100 ? '#000' : 'var(--text-muted)'}; background:${this.buyMultiplier === 100 ? '#f59e0b' : 'transparent'};">100x</button>
              <button class="buy-mult-btn ${this.buyMultiplier === 'max' ? 'active' : ''}" data-mult="max" style="padding:3px 7px; font-size:11px; font-weight:bold; border-radius:4px; cursor:pointer; color:${this.buyMultiplier === 'max' ? '#000' : 'var(--text-muted)'}; background:${this.buyMultiplier === 'max' ? '#f59e0b' : 'transparent'};">${t('btn.max')}</button>
            </div>
          </div>

          <div id="homeListContainer" style="display:flex; flex-direction:column; gap:8px; padding-bottom:16px;"></div>
        </div>

        <!-- Center Column: Zone A (Power/Progress) + Zone B (Progress) + Zone C (Battlefield) + Zone D (Action) -->
        <div class="home-col-center" id="battleCenterCol" style="display:flex; flex-direction:column; gap:8px; width:100%; position:relative;">
          
          <!-- Zone A / Header HUD: Power, Rate, Rank Progress & Combo -->
          <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:8px 12px; display:flex; flex-direction:column; align-items:center; gap:2px; width:100%; position:relative;">
            <div style="font-size:10px; color:var(--text-muted); font-weight:bold; letter-spacing:1px; text-transform:uppercase;">
              ${t('currency.power')}
            </div>
            <div id="stagePowerNumber" style="font-family:var(--font-display); font-size:28px; font-weight:900; color:#fde047; text-shadow:0 0 16px rgba(245,158,11,0.6); line-height:1.1;">
              0
            </div>
            <div id="stagePowerRate" style="font-size:11px; color:var(--color-cyan); font-weight:600;">
              +0 / sec
            </div>
            <div id="stageComboDisplay" style="display:none; font-size:11px; color:#f43f5e; font-weight:bold; margin-top:2px;">
              ${t('battle.combo', { multiplier: '1.0', count: 0 })}
            </div>

            <!-- Rank & Progress Bar -->
            <div style="width:100%; max-width:280px; margin-top:2px;">
              <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:bold; margin-bottom:2px;">
                <span id="stageRankName" style="color:var(--text-main);">${t('rank.e.name')}</span>
                <span id="stageProgressPct" style="color:var(--color-gold);">0%</span>
              </div>
              <div style="width:100%; height:6px; background:rgba(30,41,59,0.8); border-radius:var(--radius-full); overflow:hidden; border:1px solid var(--border-subtle);">
                <div id="stageProgressBar" style="width:0%; height:100%; background:linear-gradient(90deg, #f59e0b, #fde047); border-radius:var(--radius-full); transition:width 0.2s ease;"></div>
              </div>
            </div>

            <!-- Floating Golden Spirit Orb (Random Event) -->
            <div id="goldenSpiritOrb" style="display:none; position:absolute; right:12px; top:12px; width:36px; height:36px; border-radius:50%; background:radial-gradient(circle, #fde047 0%, #f59e0b 60%, #b45309 100%); border:2px solid #ffffff; box-shadow:0 0 20px #fde047; animation:auraPulse 1s infinite; cursor:pointer; z-index:50; align-items:center; justify-content:center; font-size:18px;">
              ✨
            </div>
          </div>

          <!-- Zone B: Campaign Stage Header & Progress Strip -->
          <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:8px 12px; display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div id="campaignWorldTitle" style="font-size:10px; font-weight:bold; color:var(--text-muted); letter-spacing:1px;">${t('battle.world_initial')}</div>
                <div id="campaignStageTitle" style="font-size:15px; font-weight:900; color:#fde047; font-family:var(--font-display);">${t('battle.stage_initial')}</div>
              </div>

              <!-- Mode Badge & Controls -->
              <div style="display:flex; gap:6px; align-items:center;">
                <span id="campaignModeBadge" style="font-size:10px; font-weight:bold; padding:2px 8px; border-radius:var(--radius-full); border:1px solid #0284c7; background:rgba(56,189,248,0.2); color:#38bdf8;">${t('campaign.mode_progress').toUpperCase()}</span>
                <button id="autoAdvanceToggleBtn" style="padding:3px 8px; font-size:10px; font-weight:bold; border-radius:var(--radius-sm); border:1px solid #10b981; background:rgba(16,185,129,0.2); color:#34d399; cursor:pointer;">${t('campaign.auto_advance_on')}</button>
              </div>
            </div>

            <!-- Progress Node Strip -->
            <div id="stageNodeStrip" style="display:flex; align-items:center; justify-content:center; gap:3px; padding-top:2px;"></div>

            <!-- Boss Retry CTAs (if blocked) -->
            <div id="bossRetryContainer" style="display:none; gap:6px; margin-top:2px;">
              <button id="bossRetryBtn" style="flex:1; padding:6px; font-size:11px; font-weight:bold; border-radius:var(--radius-sm); background:linear-gradient(90deg, #f59e0b, #ef4444); color:#000; cursor:pointer; border:none;">
                ⚔️ ${t('battle.retry_boss')}
              </button>
              <button id="bossBoostedRetryBtn" style="flex:1.2; padding:6px; font-size:11px; font-weight:bold; border-radius:var(--radius-sm); background:linear-gradient(90deg, #8b5cf6, #ec4899); color:#fff; cursor:pointer; border:none; box-shadow:0 0 10px rgba(236,72,153,0.5);">
                🔥 ${t('battle.boosted_retry', { percent: 25 })}
              </button>
            </div>
          </div>

          <!-- Zone C: Battlefield Viewport Container -->
          <div id="battlefieldContainer" style="display:flex; flex-direction:column; flex:1;"></div>

          <!-- Zone D: Primary Action Controls -->
          <div style="display:flex; gap:8px; align-items:center; width:100%;">
            <!-- Primary Attack Button -->
            <button id="trainActionBtn" class="btn btn-primary" style="flex:1; padding:12px; font-size:16px; font-weight:900; font-family:var(--font-display); letter-spacing:1px; border-radius:var(--radius-md); background:linear-gradient(135deg, #f59e0b, #d97706); box-shadow:0 0 20px rgba(245,158,11,0.5); cursor:pointer; border:none; display:flex; align-items:center; justify-content:center; gap:8px;">
              <span>⚔️</span>
              <span>${t('battle.attack')}</span>
            </button>

            <!-- Quick Ascension button (if ready) -->
            <button id="ascendQuickBtn" style="display:none; padding:12px 16px; font-size:13px; font-weight:bold; border-radius:var(--radius-md); background:linear-gradient(135deg, #10b981, #059669); color:#fff; border:none; cursor:pointer; box-shadow:0 0 15px rgba(16,185,129,0.5);">
              ✨ ${t('btn.ascend')}
            </button>
          </div>
        </div>

        <!-- Right Column: Quests & Goals (Desktop) -->
        <div class="home-col-right" id="homeRightCol" style="gap:12px;">
          <!-- Next Goal Banner -->
          <div id="nextGoalBanner" style="background:rgba(30,41,59,0.7); border:1px solid var(--border-gold); border-radius:var(--radius-md); padding:8px 12px; font-size:12px; font-weight:bold; color:#fde047; display:flex; justify-content:space-between; align-items:center;">
            <span>🎯 ${t('battle.next_goal')}:</span>
            <span id="nextGoalText">${t('battle.next_rank_initial')}</span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-subtle); padding-bottom:6px;">
            <div style="font-weight:bold; font-size:14px; color:#38bdf8;">
              📜 ${t('quest.title')}
            </div>
            <button id="viewAllQuestsBtn" style="font-size:11px; color:var(--color-gold); font-weight:bold; cursor:pointer; background:none; border:none;">
              ${t('battle.view_all')} ➔
            </button>
          </div>
          <div id="homeQuickQuests" style="display:flex; flex-direction:column; gap:6px;">
            <div style="font-size:11px; color:var(--text-muted); padding:8px; background:rgba(30,41,59,0.3); border-radius:var(--radius-sm);">
              ${t('battle.quick_quest_hint')}
            </div>
          </div>

          <div style="margin-top:auto; background:rgba(30,41,59,0.5); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:10px; text-align:center;">
            <div style="font-size:11px; color:var(--text-muted);">${t('app.subtitle')}</div>
            <div style="font-size:10px; color:#94a3b8; margin-top:2px;">${t('battle.genre_line')}</div>
          </div>
        </div>
      </div>
    `;

    // Attach Battlefield Viewport to center container
    const bfContainer = this.el.querySelector('#battlefieldContainer');
    if (bfContainer) {
      bfContainer.appendChild(this.viewport.getElement());
    }
  }

  private handleKeydown = (e: KeyboardEvent): void => {
    if (typeof HTMLInputElement !== 'undefined' && e.target instanceof HTMLInputElement) return;
    if (typeof HTMLTextAreaElement !== 'undefined' && e.target instanceof HTMLTextAreaElement) return;

    if (e.code === 'Space') {
      e.preventDefault?.();
      this.viewport.triggerAttack();
      const attackBtn = this.el.querySelector('#trainActionBtn') as HTMLElement;
      if (attackBtn) {
        attackBtn.style.transform = 'scale(0.96)';
        setTimeout(() => { attackBtn.style.transform = ''; }, 100);
      }
    } else if (e.code === 'KeyA') {
      e.preventDefault?.();
      store.set((draft) => {
        CampaignProgressionSystem.toggleAutoAdvance(draft);
      });
      sound.playTap();
      this.updateStageHeader();
    } else if (e.code === 'KeyB') {
      if (store.get().campaign.campaignMode === 'boss_blocked') {
        e.preventDefault?.();
        store.set((draft) => {
          CampaignProgressionSystem.retryBoss(draft, false);
        });
        campaignCombatService.spawnCurrentEncounter();
        sound.playTap();
        this.updateStageHeader();
      }
    }
  };

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeydown);
    }
  }
}
