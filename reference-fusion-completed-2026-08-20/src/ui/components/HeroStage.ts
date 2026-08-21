import { store } from '../../core/GameState';
import { getRankById, getNextRank } from '../../content/ranks';
import { BigNumber } from '../../core/BigNumber';
import { EconomyEngine } from '../../economy/EconomyEngine';
import { TrainingSystem } from '../../systems/TrainingSystem';
import { RandomEventSystem } from '../../systems/RandomEventSystem';
import { FloatingNumbers } from '../vfx/FloatingNumbers';
import { ParticleCanvas } from '../vfx/ParticleCanvas';
import { t } from '../../services/i18n/I18nService';
import { events } from '../../core/EventBus';
import { resolveUIIcon } from '../art/runtime/UIIconRegistry';

export class HeroStage {
  private el: HTMLElement;
  private particleCanvas: ParticleCanvas | null = null;

  constructor(particleCanvas?: ParticleCanvas) {
    this.particleCanvas = particleCanvas || null;
    this.el = document.createElement('div');
    this.el.className = 'hero-stage-container';
    this.el.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      position: relative;
      padding: var(--space-10) var(--space-16);
    `;
    this.render();
    this.bind();
  }

  public getElement(): HTMLElement {
    return this.el;
  }

  private bind(): void {
    store.subscribe(() => this.update());
    document.addEventListener('i18n:change', () => this.update());

    const trainBtn = this.el.querySelector('#trainActionBtn') as HTMLElement;
    const heroAvatar = this.el.querySelector('#heroAvatarContainer') as HTMLElement;

    const handleTap = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const rect = this.el.getBoundingClientRect();
      const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as MouseEvent).clientX || (rect.left + rect.width / 2);
      const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as MouseEvent).clientY || (rect.top + rect.height / 2 - 50);

      const result = TrainingSystem.train({ x: clientX, y: clientY });

      // Spawn floating popup
      FloatingNumbers.spawn(clientX, clientY, result.powerGained, result.isCrit, '+');

      // Emit particle burst
      if (this.particleCanvas) {
        const rank = getRankById(store.get().rankId);
        this.particleCanvas.emitBurst(clientX, clientY, 14, result.isCrit ? '#fde047' : rank.color, result.isCrit);
      }

      // Visual click response on avatar
      if (heroAvatar) {
        heroAvatar.style.transform = 'scale(0.95)';
        if (result.isCrit) {
          heroAvatar.classList.add('shake-active');
        }
        setTimeout(() => {
          heroAvatar.style.transform = '';
          heroAvatar.classList.remove('shake-active');
        }, 200);
      }
    };

    trainBtn?.addEventListener('pointerdown', handleTap);
    heroAvatar?.addEventListener('pointerdown', handleTap);

    this.el.querySelector('#ascendQuickBtn')?.addEventListener('click', () => {
      events.emit('screen:change', { screenId: 'ascension' });
    });

    this.el.querySelector('#goldenSpiritOrb')?.addEventListener('click', () => {
      RandomEventSystem.claimEvent();
    });
  }

  private render(): void {
    this.el.innerHTML = `
      <!-- Next Goal HUD Banner -->
      <div id="nextGoalBanner" style="background:rgba(30,41,59,0.7); border:1px solid var(--border-gold); border-radius:var(--radius-full); padding:var(--space-03) var(--space-12); font-size:11px; font-weight:bold; color:#fde047; margin-bottom:var(--space-06); display:flex; align-items:center; gap:var(--space-06); z-index:5;">
        <span>🎯 ${t('battle.next')}:</span>
        <span id="nextGoalText">${t('battle.next_rank_initial')}</span>
      </div>

      <!-- Power & Rate Header -->
      <div style="text-align:center; margin-bottom:var(--space-06); z-index:5;">
        <div style="font-size:12px; color:var(--text-muted); font-weight:bold; letter-spacing:1px; text-transform:uppercase;">
          ${t('currency.power')}
        </div>
        <div id="stagePowerNumber" style="font-family:var(--font-display); font-size:38px; font-weight:900; color:#fde047; text-shadow:0 0 20px rgba(245,158,11,0.6); line-height:1.1;">
          0
        </div>
        <div id="stagePowerRate" style="font-size:13px; color:var(--color-cyan); font-weight:600; text-shadow:0 0 10px rgba(56,189,248,0.5);">
          +0 / sec
        </div>
        <div id="stageComboDisplay" style="display:none; font-size:11px; color:#f43f5e; font-weight:bold; margin-top:var(--space-02);">
          ${t('battle.combo', { multiplier: '1.0', count: 0 })}
        </div>
      </div>

      <!-- Avatar & Aura Container -->
      <div id="heroAvatarContainer" style="position:relative; width:210px; height:210px; display:flex; align-items:center; justify-content:center; cursor:pointer; margin:var(--space-04) 0; transition:transform 0.1s ease;">
        <!-- Aura Circle SVG -->
        <svg id="heroAuraSvg" style="position:absolute; width:100%; height:100%; animation:celestialRotate 20s linear infinite; pointer-events:none;" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="85" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="8 6" opacity="0.4" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="14 10" opacity="0.6" />
          <polygon points="100,20 180,140 20,140" fill="none" stroke="#94a3b8" stroke-width="1" opacity="0.3" />
          <polygon points="100,180 180,60 20,60" fill="none" stroke="#94a3b8" stroke-width="1" opacity="0.3" />
        </svg>

        <!-- Anime Hero Artwork (Stylized vector avatar) -->
        <div id="heroGraphic" style="width:150px; height:150px; border-radius:50%; background:radial-gradient(circle, #1e293b 0%, #0f172a 100%); border:3px solid #94a3b8; display:flex; align-items:center; justify-content:center; box-shadow:var(--glow-neutral); animation:heroFloat 3.5s ease-in-out infinite; z-index:3; overflow:hidden;">
          <div id="heroAvatarArt" style="font-size:68px; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.8));">
            🥋
          </div>
        </div>

        <!-- Floating Golden Spirit Orb (Random Event) -->
        <div id="goldenSpiritOrb" style="display:none; position:absolute; width:48px; height:48px; border-radius:50%; background:radial-gradient(circle, #fde047 0%, #f59e0b 60%, #b45309 100%); border:2px solid #ffffff; box-shadow:var(--glow-gold-strong); animation:auraPulse 1s infinite; cursor:pointer; z-index:50; align-items:center; justify-content:center; font-size:24px;">
          ✨
        </div>
      </div>

      <!-- Rank & Ascension Progress Bar -->
      <div style="width:100%; max-width:320px; margin-bottom:var(--space-12); z-index:5;">
        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:bold; margin-bottom:var(--space-04);">
          <span id="stageRankName" style="color:var(--text-main);">${t('rank.e.name')}</span>
          <span id="stageProgressPct" style="color:var(--color-gold);">0%</span>
        </div>
        <div style="width:100%; height:10px; background:rgba(30,41,59,0.8); border-radius:var(--radius-full); overflow:hidden; border:1px solid var(--border-subtle); position:relative;">
          <div id="stageProgressBar" style="width:0%; height:100%; background:linear-gradient(90deg, #f59e0b, #fde047); border-radius:var(--radius-full); transition:width 0.2s ease; box-shadow:var(--glow-gold);"></div>
        </div>
      </div>

      <!-- TRAIN Action Button -->
      <button id="trainActionBtn" style="
        width:100%;
        max-width:320px;
        height:56px;
        background:linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #b45309 100%);
        border:2px solid #fde047;
        border-radius:var(--radius-lg);
        color:#ffffff;
        font-family:var(--font-display);
        font-size:22px;
        letter-spacing:2px;
        font-weight:900;
        box-shadow:var(--shadow-cta);
        cursor:pointer;
        display:flex;
        align-items:center;
        justify-content:center;
        gap:var(--space-08);
        text-shadow:0 2px 4px rgba(0,0,0,0.6);
        transition:transform 0.08s ease, filter 0.15s ease;
        z-index:5;
      ">
        <span>⚡</span>
        <span id="trainBtnText">${t('btn.train')}</span>
      </button>

      <!-- Quick Ascension Notification Banner (When threshold reached) -->
      <button id="ascendQuickBtn" style="display:none; margin-top:var(--space-10); width:100%; max-width:320px; height:46px; background:linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border:2px solid #e9d5ff; border-radius:var(--radius-md); color:#ffffff; font-weight:bold; font-size:14px; animation:buttonReadyGlow 1.5s infinite; align-items:center; justify-content:center; gap:var(--space-08); cursor:pointer; z-index:5;">
        <span>🌟</span>
        <span>${t('btn.ascend')}</span>
      </button>
    `;
  }

  private update(): void {
    const s = store.get();
    const rank = getRankById(s.rankId);
    const nextRank = getNextRank(s.rankId);
    const metrics = EconomyEngine.calculateMetrics(s);

    const powerNum = this.el.querySelector('#stagePowerNumber') as HTMLElement;
    const powerRate = this.el.querySelector('#stagePowerRate') as HTMLElement;
    const comboDisplay = this.el.querySelector('#stageComboDisplay') as HTMLElement;
    const nextGoalText = this.el.querySelector('#nextGoalText') as HTMLElement;
    const stageRankName = this.el.querySelector('#stageRankName') as HTMLElement;
    const stageProgressPct = this.el.querySelector('#stageProgressPct') as HTMLElement;
    const stageProgressBar = this.el.querySelector('#stageProgressBar') as HTMLElement;
    const heroGraphic = this.el.querySelector('#heroGraphic') as HTMLElement;
    const heroAvatarArt = this.el.querySelector('#heroAvatarArt') as HTMLElement;
    const heroAuraSvg = this.el.querySelector('#heroAuraSvg') as HTMLElement;
    const ascendQuickBtn = this.el.querySelector('#ascendQuickBtn') as HTMLElement;
    const trainBtnText = this.el.querySelector('#trainBtnText') as HTMLElement;
    const goldenSpiritOrb = this.el.querySelector('#goldenSpiritOrb') as HTMLElement;

    if (powerNum) {
      powerNum.innerText = BigNumber.format(s.power, s.settings.notation);
    }

    if (powerRate) {
      powerRate.innerText = `+${BigNumber.format(metrics.passivePowerPerSec, s.settings.notation)} / sec`;
    }

    // Update Combo meter
    if (comboDisplay) {
      if (s.combo && s.combo.count > 1 && s.combo.timer > 0) {
        comboDisplay.style.display = 'block';
        comboDisplay.innerText = t('battle.combo', { multiplier: s.combo.multiplier.toFixed(2), count: s.combo.count });
      } else {
        comboDisplay.style.display = 'none';
      }
    }

    // Update Random Golden Spirit
    if (goldenSpiritOrb) {
      if (s.randomEvent && s.randomEvent.active) {
        goldenSpiritOrb.style.display = 'flex';
        goldenSpiritOrb.style.left = `${s.randomEvent.xPct}%`;
        goldenSpiritOrb.style.top = `${s.randomEvent.yPct}%`;
      } else {
        goldenSpiritOrb.style.display = 'none';
      }
    }

    if (trainBtnText) {
      trainBtnText.innerText = t('btn.train');
    }
    if (heroAvatarArt) {
      heroAvatarArt.innerHTML = resolveUIIcon(`rank_${rank.id.toLowerCase()}`).fallbackSvg;
      heroAvatarArt.style.color = rank.color;
    }

    if (heroGraphic) {
      heroGraphic.style.borderColor = rank.color;
      heroGraphic.style.setProperty('--ui-glow-color', rank.glowColor);
      heroGraphic.style.boxShadow = 'var(--glow-dynamic-xl)';
    }

    if (heroAuraSvg) {
      heroAuraSvg.style.color = rank.color;
      heroAuraSvg.querySelectorAll('circle, polygon').forEach((shape) => {
        (shape as SVGElement).setAttribute('stroke', rank.color);
      });
    }

    if (stageRankName) {
      stageRankName.innerText = t(rank.titleKey);
      stageRankName.style.color = rank.color;
    }

    // Progress to next rank & Next Goal HUD banner
    if (nextRank) {
      const prevReq = rank.reqPower;
      const nextReq = nextRank.reqPower;
      const progress = Math.min(1, Math.max(0, (s.power - prevReq) / (nextReq - prevReq)));
      const pct = Math.floor(progress * 100);

      if (stageProgressPct) stageProgressPct.innerText = `${pct}%`;
      if (stageProgressBar) stageProgressBar.style.width = `${pct}%`;

      if (nextGoalText) {
        nextGoalText.innerText = `${t(nextRank.nameKey)} (${pct}%)`;
      }

      if (s.power >= nextRank.reqPower) {
        if (ascendQuickBtn) ascendQuickBtn.style.display = 'flex';
      } else {
        if (ascendQuickBtn) ascendQuickBtn.style.display = 'none';
      }
    } else {
      if (stageProgressPct) stageProgressPct.innerText = t('btn.max');
      if (stageProgressBar) stageProgressBar.style.width = '100%';
      if (nextGoalText) nextGoalText.innerText = t('battle.max_reached');
      if (ascendQuickBtn) ascendQuickBtn.style.display = 'none';
    }
  }
}
