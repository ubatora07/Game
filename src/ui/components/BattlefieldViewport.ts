import { store } from '../../core/GameState';
import { campaignCombatService } from '../../systems/CampaignCombatService';
import { getRankById } from '../../content/ranks';
import { BigNumber } from '../../core/BigNumber';
import { ParticleCanvas } from '../vfx/ParticleCanvas';
import { FloatingNumbers } from '../vfx/FloatingNumbers';
import { events } from '../../core/EventBus';
import { sound } from '../../services/audio/SoundService';
import { t } from '../../services/i18n/I18nService';
import { HeroSystem } from '../../systems/HeroSystem';
import { getCampaignWorldById, CAMPAIGN_WORLDS } from '../../content/campaignWorlds';
import { PixelSpriteRenderer, CharacterAnimationState, GoblinTier } from '../art/PixelSpriteRenderer';
import { petSystem } from '../../systems/PetSystem';

export class BattlefieldViewport {
  private el: HTMLElement;
  private particleCanvas: ParticleCanvas | null = null;
  private heroAvatarEl: HTMLElement | null = null;
  private petAvatarEl: HTMLElement | null = null;
  private enemyAvatarEl: HTMLElement | null = null;
  private enemyHpFillEl: HTMLElement | null = null;
  private enemyHpTextEl: HTMLElement | null = null;
  private bossTimerBarEl: HTMLElement | null = null;
  private bossTimerTextEl: HTMLElement | null = null;
  private bossWarningBannerEl: HTMLElement | null = null;
  private lastHitSoundTime: number = 0;
  private heroAnimState: CharacterAnimationState = 'idle';
  private heroAnimTimer: any = null;

  constructor(particleCanvas?: ParticleCanvas) {
    this.particleCanvas = particleCanvas || null;
    this.el = document.createElement('div');
    this.el.className = 'battlefield-viewport pixel-fantasy-battlefield';
    this.el.style.cssText = `
      position: relative;
      width: 100%;
      min-height: 240px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-radius: var(--radius-lg);
      background: #09090b;
      border: 2px solid #b45309;
      box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.8), 0 0 15px rgba(217, 119, 6, 0.2);
      overflow: hidden;
      user-select: none;
      padding: 10px;
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

    events.on('combat:enemy_spawned', () => this.onEnemySpawned());
    events.on('combat:player_attack', (data) => this.onPlayerAttack(data));
    events.on('combat:auto_attack', (data) => this.onAutoAttack(data));
    events.on('combat:enemy_killed', () => this.onEnemyKilled());
    events.on('combat:reward_dropped', (data) => this.onRewardDropped(data));
    events.on('combat:boss_warning', (data) => this.showBossWarning(data.bossName));
    events.on('campaign:boss_failed', () => this.update());
    events.on('ascension:rankUp', () => this.onHeroAscended());
    events.on('hero:unlocked', () => this.render());
    events.on('hero:starUp', () => this.render());
    events.on('combat:hero_skill', (data) => this.onHeroSkill(data));
    events.on('campaign:world_cleared', (data) => this.onWorldCleared(data));
    events.on('combat:boss_mechanic', (data) => this.onBossMechanic(data));
    events.on('combat:samsara_rush_kill', (data) => this.onSamsaraRushKill(data));
    events.on('pet:equipped' as any, () => this.updatePetDisplay());
    events.on('pet:evolved' as any, () => this.updatePetDisplay());

    // Interactive Tap on Battlefield to attack
    this.el.addEventListener('pointerdown', (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button')) return;

      const rect = this.el.getBoundingClientRect();
      const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as MouseEvent).clientX || (rect.left + rect.width * 0.7);
      const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as MouseEvent).clientY || (rect.top + rect.height * 0.5);

      this.triggerAttack(clientX, clientY);
    });
  }

  private setHeroAnimation(state: CharacterAnimationState, durationMs: number = 300): void {
    this.heroAnimState = state;
    this.updateHeroSprite();

    if (this.heroAnimTimer) clearTimeout(this.heroAnimTimer);
    if (state !== 'idle') {
      this.heroAnimTimer = setTimeout(() => {
        this.heroAnimState = 'idle';
        this.updateHeroSprite();
      }, durationMs);
    }
  }

  private updateHeroSprite(): void {
    if (!this.heroAvatarEl) return;
    const state = store.get();
    const rank = getRankById(state.rankId);
    this.heroAvatarEl.innerHTML = PixelSpriteRenderer.getSwordsmanSprite(this.heroAnimState, rank.color);
  }

  private updatePetDisplay(): void {
    if (!this.petAvatarEl) return;
    const activePet = petSystem.getActivePet();
    if (activePet) {
      this.petAvatarEl.style.display = 'block';
      this.petAvatarEl.innerHTML = PixelSpriteRenderer.getPetSprite(activePet.evolutionStage);
    } else {
      this.petAvatarEl.style.display = 'none';
      this.petAvatarEl.innerHTML = '';
    }
  }

  private onSamsaraRushKill(_data: { enemyId: string; stageId: string }): void {
    if (!this.enemyAvatarEl) return;
    const rect = this.enemyAvatarEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    FloatingNumbers.spawn(cx, cy - 20, '⚡ SAMSARA RUSH!', true, '');
    if (this.particleCanvas) {
      this.particleCanvas.emitBurst(cx, cy, 25, '#fbbf24', true);
    }
  }

  private onBossMechanic(data: { bossId: string; mechanic: 'shield' | 'enrage' | 'damage_reduction'; active: boolean }): void {
    if (!this.enemyAvatarEl) return;
    const rect = this.enemyAvatarEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    if (data.active) {
      if (data.mechanic === 'shield') {
        FloatingNumbers.spawn(x, y - 10, '🛡️ SHIELD UP!', true, '');
        this.enemyAvatarEl.style.boxShadow = '0 0 25px #38bdf8';
        if (this.particleCanvas) this.particleCanvas.emitBurst(x, y, 16, '#38bdf8', true);
      } else if (data.mechanic === 'enrage') {
        FloatingNumbers.spawn(x, y - 10, '🔥 ENRAGED!', true, '');
        this.enemyAvatarEl.style.boxShadow = '0 0 30px #ef4444';
        this.enemyAvatarEl.style.filter = 'brightness(1.4) drop-shadow(0 0 15px #ef4444)';
        if (this.particleCanvas) this.particleCanvas.emitBurst(x, y, 20, '#ef4444', true);
      } else if (data.mechanic === 'damage_reduction') {
        FloatingNumbers.spawn(x, y - 10, '⛓️ HARDENED (-50%)', true, '');
        this.enemyAvatarEl.style.boxShadow = '0 0 20px #94a3b8';
        if (this.particleCanvas) this.particleCanvas.emitBurst(x, y, 14, '#94a3b8', true);
      }
    } else {
      this.enemyAvatarEl.style.boxShadow = '';
      this.enemyAvatarEl.style.filter = '';
    }
  }

  private onWorldCleared(data: { worldId: number }): void {
    FloatingNumbers.spawn(window.innerWidth / 2, window.innerHeight / 3, `🌟 REALM ${data.worldId} CONQUERED!`, true, '');
    if (this.particleCanvas) {
      this.particleCanvas.emitBurst(window.innerWidth / 2, window.innerHeight / 3, 40, '#fde047', true);
    }
  }

  private onHeroSkill(data: { heroId: string; heroName: string; skillName: string }): void {
    if (!this.heroAvatarEl) return;
    const rect = this.heroAvatarEl.getBoundingClientRect();
    FloatingNumbers.spawn(rect.left + rect.width / 2, rect.top - 10, `✨ ${data.skillName}`, true, '');
    if (this.particleCanvas) {
      this.particleCanvas.emitBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 12, '#38bdf8', true);
    }
  }

  private onHeroAscended(): void {
    this.setHeroAnimation('victory', 1500);
    this.render();
    if (this.particleCanvas && this.heroAvatarEl) {
      const rect = this.heroAvatarEl.getBoundingClientRect();
      this.particleCanvas.emitBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35, '#fde047', true);
    }
  }

  private showBossWarning(bossName?: string): void {
    if (!this.bossWarningBannerEl) return;
    this.setHeroAnimation('hurt', 400);
    this.bossWarningBannerEl.textContent = `⚠️ BOSS: ${bossName?.toUpperCase() || 'ANCIENT SOVEREIGN'} ⚠️`;
    this.bossWarningBannerEl.style.display = 'block';
    this.bossWarningBannerEl.style.opacity = '1';

    sound.playBossWarning();

    setTimeout(() => {
      if (this.bossWarningBannerEl) {
        this.bossWarningBannerEl.style.opacity = '0';
        setTimeout(() => {
          if (this.bossWarningBannerEl) this.bossWarningBannerEl.style.display = 'none';
        }, 300);
      }
    }, 2000);
  }

  private triggerScreenShake(intensity: number = 6): void {
    const state = store.get();
    if (state.settings?.screenShake === false || state.settings?.reducedMotion) return;

    if (this.el.style) {
      this.el.style.transform = `translate(${intensity}px, -${intensity}px)`;
      setTimeout(() => {
        if (this.el.style) this.el.style.transform = '';
      }, 150);
    }

    if (this.el.classList?.remove) {
      this.el.classList.remove('shake-active');
      void this.el.offsetWidth; // Trigger reflow
      this.el.classList.add('shake-active');

      setTimeout(() => {
        if (this.el.classList?.remove) this.el.classList.remove('shake-active');
      }, 200);
    }
  }

  private flyRewardCoin(startX: number, startY: number, icon: string): void {
    const coin = document.createElement('div');
    coin.textContent = icon;
    coin.style.cssText = `
      position: fixed;
      left: ${startX}px;
      top: ${startY}px;
      font-size: 20px;
      pointer-events: none;
      z-index: 1000;
      transition: all 0.65s cubic-bezier(0.25, 1, 0.5, 1);
      filter: drop-shadow(0 0 6px rgba(234, 179, 8, 0.8));
    `;
    document.body.appendChild(coin);

    const targetX = window.innerWidth * 0.5 + (Math.random() * 40 - 20);
    const targetY = 30;

    requestAnimationFrame(() => {
      coin.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px) scale(0.6)`;
      coin.style.opacity = '0';
    });

    setTimeout(() => {
      if (coin.parentNode) coin.parentNode.removeChild(coin);
    }, 700);
  }

  public triggerAttack(clientX?: number, clientY?: number): void {
    const rect = this.el.getBoundingClientRect();
    const x = clientX || (rect.left + rect.width * 0.7);
    const y = clientY || (rect.top + rect.height * 0.5);

    const result = campaignCombatService.attack(x, y);
    if (result.damage <= 0) return;

    // Trigger Swordsman attack or crit animation
    if (result.isCrit) {
      this.setHeroAnimation('crit', 380);
      this.triggerScreenShake(6);
    } else {
      this.setHeroAnimation('attack', 280);
    }

    // Spawn floating damage text over enemy
    FloatingNumbers.spawn(x, y, result.damage, result.isCrit, '-');

    // Spawn particle burst
    if (this.particleCanvas) {
      const color = result.isCrit ? '#fde047' : '#38bdf8';
      this.particleCanvas.emitBurst(x, y, result.isCrit ? 16 : 8, color, result.isCrit);
    }

    const reducedMotion = store.get().settings?.reducedMotion;
    if (!reducedMotion && this.enemyAvatarEl) {
      this.enemyAvatarEl.style.transform = 'scale(0.92) translateX(4px)';
      this.enemyAvatarEl.style.filter = 'brightness(1.5) drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))';
      setTimeout(() => {
        if (this.enemyAvatarEl) {
          this.enemyAvatarEl.style.transform = '';
          this.enemyAvatarEl.style.filter = '';
        }
      }, 150);
    }
  }

  private onAutoAttack(data: { damage: number; isCrit: boolean; remainingHp: number }): void {
    this.updateHpBar(data.remainingHp);
    const reducedMotion = store.get().settings?.reducedMotion;

    if (!reducedMotion) {
      // Hero slight attack pulse if idle
      if (this.heroAnimState === 'idle') {
        this.setHeroAnimation('attack', 200);
      }

      // Enemy slight hit recoil
      if (this.enemyAvatarEl) {
        this.enemyAvatarEl.style.transform = 'scale(0.96) translateX(2px)';
        this.enemyAvatarEl.style.filter = 'brightness(1.3) drop-shadow(0 0 6px rgba(239, 68, 68, 0.5))';
        setTimeout(() => {
          if (this.enemyAvatarEl) {
            this.enemyAvatarEl.style.transform = '';
            this.enemyAvatarEl.style.filter = '';
          }
        }, 120);
      }
    }

    // Spawn floating damage above enemy center
    if (this.enemyAvatarEl) {
      const rect = this.enemyAvatarEl.getBoundingClientRect();
      const x = rect.left + rect.width / 2 + (Math.random() * 20 - 10);
      const y = rect.top + 10;
      FloatingNumbers.spawn(x, y, data.damage, data.isCrit, '-');
    }

    // Throttle hit sound to max 1 per 280ms
    const now = Date.now();
    if (now - this.lastHitSoundTime >= 280) {
      this.lastHitSoundTime = now;
      sound.playEnemyHit();
    }
  }

  private onPlayerAttack(data: { damage: number; isCrit: boolean; remainingHp: number }): void {
    this.updateHpBar(data.remainingHp);
  }

  private onEnemyKilled(): void {
    this.setHeroAnimation('victory', 1000);

    if (this.enemyAvatarEl) {
      this.enemyAvatarEl.style.transform = 'scale(0) rotate(15deg)';
      this.enemyAvatarEl.style.opacity = '0';
      this.enemyAvatarEl.style.filter = 'brightness(2.0)';
    }

    // Emit gold victory particles
    if (this.particleCanvas && this.enemyAvatarEl) {
      const rect = this.enemyAvatarEl.getBoundingClientRect();
      this.particleCanvas.emitBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20, '#eab308', true);
    }
  }

  private onRewardDropped(data: { rewards: { gold: number; power: number; crystals?: number }; x?: number; y?: number }): void {
    let spawnX = data.x;
    let spawnY = data.y;

    if (spawnX === undefined || spawnY === undefined) {
      if (this.enemyAvatarEl) {
        const rect = this.enemyAvatarEl.getBoundingClientRect();
        spawnX = rect.left + rect.width / 2;
        spawnY = rect.top + rect.height / 3;
      } else {
        const rect = this.el.getBoundingClientRect();
        spawnX = rect.left + rect.width * 0.7;
        spawnY = rect.top + rect.height * 0.5;
      }
    }

    // Spawn gold reward floater & coin flyout
    if (data.rewards.gold > 0) {
      FloatingNumbers.spawn(spawnX, spawnY, `${BigNumber.format(data.rewards.gold)} 🪙`, false, '+');
      this.flyRewardCoin(spawnX, spawnY, '🪙');
    }

    // Spawn power reward floater
    if (data.rewards.power > 0) {
      setTimeout(() => {
        FloatingNumbers.spawn(spawnX!, spawnY! - 18, `${BigNumber.format(data.rewards.power)} ⚡`, false, '+');
        this.flyRewardCoin(spawnX!, spawnY! - 18, '⚡');
      }, 80);
    }

    // Spawn crystals reward floater if any
    if (data.rewards.crystals && data.rewards.crystals > 0) {
      setTimeout(() => {
        FloatingNumbers.spawn(spawnX!, spawnY! - 36, `${data.rewards.crystals} 💎`, true, '+');
        this.flyRewardCoin(spawnX!, spawnY! - 36, '💎');
      }, 160);
    }
  }

  private onEnemySpawned(): void {
    this.updateEnemy();

    // Smooth Entrance Animation
    if (this.enemyAvatarEl) {
      this.enemyAvatarEl.style.transition = 'none';
      this.enemyAvatarEl.style.transform = 'scale(0.6) translateY(20px)';
      this.enemyAvatarEl.style.opacity = '0';
      this.enemyAvatarEl.style.filter = 'brightness(1.5)';

      requestAnimationFrame(() => {
        if (this.enemyAvatarEl) {
          this.enemyAvatarEl.style.transition = 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          this.enemyAvatarEl.style.transform = 'scale(1) translateY(0)';
          this.enemyAvatarEl.style.opacity = '1';
          this.enemyAvatarEl.style.filter = '';
        }
      });
    }
  }

  public updateHpBar(currentHp: number): void {
    const combat = campaignCombatService.getCombatState();
    const enemy = combat.activeEnemy;
    if (!enemy || !this.enemyHpFillEl || !this.enemyHpTextEl) return;

    const pct = Math.max(0, Math.min(100, (currentHp / enemy.maxHp) * 100));
    this.enemyHpFillEl.style.width = `${pct}%`;
    this.enemyHpTextEl.textContent = `${BigNumber.format(Math.max(0, currentHp))} / ${BigNumber.format(enemy.maxHp)} HP`;

    if (pct < 25) {
      this.enemyHpFillEl.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
    } else if (pct < 50) {
      this.enemyHpFillEl.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    } else {
      this.enemyHpFillEl.style.background = 'linear-gradient(90deg, #10b981, #38bdf8)';
    }
  }

  public update(): void {
    const state = store.get();
    const rank = getRankById(state.rankId);
    const combat = campaignCombatService.getCombatState();
    const enemy = combat.activeEnemy;
    const world = getCampaignWorldById(combat.worldId || state.campaign.currentWorldId) || CAMPAIGN_WORLDS[0];

    const worldBadge = this.el.querySelector('#worldBadgeText') as HTMLElement;
    if (worldBadge) {
      worldBadge.innerHTML = `<span style="color:#d97706;">✦</span> <span>${t(world.nameKey)}</span> <span style="color:#94a3b8; font-size:10px;">[${combat.stageId}]</span>`;
      worldBadge.style.color = world.accentColor;
    }

    const heroTitle = this.el.querySelector('#heroRankTitle') as HTMLElement;
    const heroDps = this.el.querySelector('#heroDpsTag') as HTMLElement;
    const partySynergy = this.el.querySelector('#partySynergyBadge') as HTMLElement;

    if (heroTitle) {
      heroTitle.textContent = `[${rank.id}] ${t(rank.nameKey)}`;
      heroTitle.style.color = rank.color;
    }
    if (heroDps) {
      heroDps.textContent = `${BigNumber.format(campaignCombatService.calculateAutoDps())}/s`;
    }

    if (partySynergy) {
      const synergy = HeroSystem.getPartySynergy();
      partySynergy.innerHTML = `<span style="color:#f59e0b;">⚔️</span> <span>${synergy.partyCount > 0 ? `${synergy.synergyPctText} Synergy` : 'Swordsman'}</span>`;
    }

    this.updatePetDisplay();

    if (enemy) {
      this.updateHpBar(enemy.currentHp);

      // Boss Timer
      const bossTimerContainer = this.el.querySelector('#bossTimerContainer') as HTMLElement;
      if (combat.isTimerActive && bossTimerContainer) {
        bossTimerContainer.style.display = 'flex';
        const timerPct = Math.max(0, (combat.encounterTimer / (combat.maxEncounterTimer || 1)) * 100);
        if (this.bossTimerBarEl) this.bossTimerBarEl.style.width = `${timerPct}%`;
        if (this.bossTimerTextEl) this.bossTimerTextEl.textContent = `${Math.ceil(combat.encounterTimer)}s`;
      } else if (bossTimerContainer) {
        bossTimerContainer.style.display = 'none';
      }
    }
  }

  public updateEnemy(): void {
    const combat = campaignCombatService.getCombatState();
    const enemy = combat.activeEnemy;
    if (!enemy) return;

    const enemyNameEl = this.el.querySelector('#enemyNameText') as HTMLElement;
    const enemyTitleEl = this.el.querySelector('#enemyTitleText') as HTMLElement;
    const enemySpriteHolder = this.el.querySelector('#enemySpriteHolder') as HTMLElement;

    if (enemyNameEl) enemyNameEl.textContent = enemy.defaultName;
    if (enemyTitleEl) {
      if (enemy.isBoss && enemy.defaultBossTitle) {
        enemyTitleEl.style.display = 'block';
        enemyTitleEl.textContent = `👑 ${enemy.defaultBossTitle}`;
      } else {
        enemyTitleEl.style.display = 'none';
      }
    }

    if (enemySpriteHolder) {
      const tier: GoblinTier = enemy.isBoss ? 'boss' : enemy.archetype === 'elite' ? 'elite' : 'minion';
      enemySpriteHolder.innerHTML = PixelSpriteRenderer.getGoblinSprite(tier);
    }

    this.update();
  }

  private render(): void {
    const state = store.get();
    const rank = getRankById(state.rankId);
    const combat = campaignCombatService.getCombatState();
    const enemy = combat.activeEnemy;
    const world = getCampaignWorldById(combat.worldId || state.campaign.currentWorldId) || CAMPAIGN_WORLDS[0];

    const enemyTier: GoblinTier = enemy?.isBoss ? 'boss' : enemy?.archetype === 'elite' ? 'elite' : 'minion';

    this.el.innerHTML = `
      <!-- Multi-Layer Pixel Art Forest Background -->
      ${PixelSpriteRenderer.getForestBackground()}

      <!-- Top Pixel Fantasy Header Bar -->
      <div style="width:100%; display:flex; justify-content:space-between; align-items:center; max-width:480px; margin:0 auto; padding:4px 8px; background:rgba(18,15,23,0.92); border:1px solid #78350f; border-radius:6px; z-index:10; box-shadow:0 2px 8px rgba(0,0,0,0.8);">
        <div id="worldBadgeText" style="font-size:11px; font-weight:bold; color:#fde047; display:flex; align-items:center; gap:5px; font-family:var(--font-display);">
          <span style="color:#d97706;">✦</span>
          <span>${t(world.nameKey)}</span>
          <span style="color:#94a3b8; font-size:10px;">[${combat.stageId}]</span>
        </div>
        ${world.worldModifier ? `
          <div id="worldModifierBadge" style="font-size:9px; font-weight:bold; color:#f59e0b; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); padding:1px 6px; border-radius:4px;">
            ${world.worldModifier.label}
          </div>
        ` : ''}
      </div>

      <!-- Enemy Health & Status Bar -->
      <div style="width:100%; max-width:480px; margin:4px auto 0 auto; display:flex; flex-direction:column; align-items:center; gap:3px; z-index:10; background:rgba(18,15,23,0.88); border:1px solid #451a03; border-radius:6px; padding:6px 10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
          <div>
            <div id="enemyTitleText" style="font-size:10px; color:#f59e0b; font-weight:bold; letter-spacing:0.5px; display:${enemy?.isBoss ? 'block' : 'none'};">
              👑 ${enemy?.defaultBossTitle || ''}
            </div>
            <div id="enemyNameText" style="font-size:13px; font-weight:bold; color:#f8fafc; text-shadow:0 1px 4px rgba(0,0,0,0.9); font-family:var(--font-display);">
              ${enemy?.defaultName || 'Forest Goblin Grunt'}
            </div>
          </div>
          <div id="enemyHpText" style="font-size:11px; font-weight:bold; color:#cbd5e1; font-family:var(--font-display);">
            ${BigNumber.format(enemy?.currentHp || 0)} / ${BigNumber.format(enemy?.maxHp || 1)} HP
          </div>
        </div>

        <!-- Ornate Bronze Segmented HP Bar -->
        <div style="width:100%; height:12px; background:#0c0a09; border-radius:3px; border:1px solid #78350f; overflow:hidden; position:relative; box-shadow:inset 0 1px 3px rgba(0,0,0,0.9);">
          <div id="enemyHpFill" style="height:100%; width:100%; background:linear-gradient(90deg, #10b981, #38bdf8); transition:width 0.1s ease-out;"></div>
        </div>

        <!-- Boss Timer Bar (if active) -->
        <div id="bossTimerContainer" style="display:${combat.isTimerActive ? 'flex' : 'none'}; align-items:center; gap:6px; width:100%; margin-top:2px;">
          <span style="font-size:10px; font-weight:bold; color:#ef4444;">⏱️ TIME:</span>
          <div style="flex:1; height:4px; background:#0c0a09; border-radius:2px; overflow:hidden; border:1px solid #450a0a;">
            <div id="bossTimerBar" style="height:100%; width:100%; background:#ef4444; transition:width 0.2s linear;"></div>
          </div>
          <span id="bossTimerText" style="font-size:10px; font-weight:bold; color:#ef4444;">30s</span>
        </div>
      </div>

      <!-- Boss Warning Banner Overlay -->
      <div id="bossWarningBanner" style="display:none; position:absolute; top:35%; left:50%; transform:translate(-50%, -50%); background:rgba(153, 27, 27, 0.95); color:#fef08a; font-size:14px; font-weight:900; font-family:var(--font-display); padding:8px 20px; border-radius:4px; border:2px solid #f59e0b; box-shadow:0 0 30px rgba(239,68,68,0.9); z-index:40; pointer-events:none; transition:all 0.3s ease; text-align:center;">
        ⚠️ BOSS ENCOUNTER ⚠️
      </div>

      <!-- Center Battlefield Arena (Swordsman + Pet on left, Goblin on right) -->
      <div style="display:flex; justify-content:space-around; align-items:flex-end; width:100%; max-width:600px; margin:0 auto; flex:1; position:relative; padding-bottom:12px; z-index:5;">
        
        <!-- Left: Swordsman Main Character + Active Pet Companion -->
        <div id="battleHeroGroup" style="display:flex; align-items:flex-end; gap:8px; position:relative; cursor:pointer;">
          
          <!-- Active Companion Pet (Ignis Ember Drake) -->
          <div id="battlePetAvatar" style="width:48px; height:48px; display:none; filter:drop-shadow(0 0 8px #ef4444);">
            <!-- Pet rendered dynamically -->
          </div>

          <!-- Swordsman Protagonist Sprite -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
            <div id="battleHeroAvatar" style="width:84px; height:84px; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.8));">
              ${PixelSpriteRenderer.getSwordsmanSprite(this.heroAnimState, rank.color)}
            </div>
            
            <div id="heroRankTitle" style="font-size:10px; font-weight:bold; color:${rank.color}; text-shadow:0 1px 3px #000; text-transform:uppercase; letter-spacing:0.5px; font-family:var(--font-display);">
              [${rank.id}] ${t(rank.nameKey)}
            </div>
            <div id="heroDpsTag" style="font-size:9px; color:#cbd5e1; background:rgba(18,15,23,0.85); border:1px solid #78350f; padding:1px 6px; border-radius:3px; font-family:var(--font-display);">
              ${BigNumber.format(campaignCombatService.calculateAutoDps())}/s
            </div>
          </div>
        </div>

        <!-- Center Combat Decal Anchor -->
        <div style="display:flex; flex-direction:column; align-items:center; opacity:0.7;">
          <div style="font-size:16px; color:#d97706; font-weight:900; text-shadow:0 0 8px rgba(217,119,6,0.6);">⚔️</div>
        </div>

        <!-- Right: Active Enemy Entity (Goblin Family) -->
        <div id="battleEnemyAvatar" style="display:flex; flex-direction:column; align-items:center; gap:2px; cursor:pointer; position:relative;">
          <div id="enemySpriteHolder" style="width:${enemy?.isBoss ? '110px' : enemy?.archetype === 'elite' ? '92px' : '74px'}; height:${enemy?.isBoss ? '110px' : enemy?.archetype === 'elite' ? '92px' : '74px'}; filter:drop-shadow(0 4px 10px rgba(0,0,0,0.8));">
            ${PixelSpriteRenderer.getGoblinSprite(enemyTier)}
          </div>
          
          <div style="font-size:10px; font-weight:bold; color:${enemy?.isBoss ? '#f87171' : '#cbd5e1'}; font-family:var(--font-display); background:rgba(18,15,23,0.8); border:1px solid #451a03; padding:1px 6px; border-radius:3px;">
            ${enemy?.isBoss ? 'BOSS' : enemy?.archetype === 'elite' ? 'ELITE' : 'MINION'}
          </div>
        </div>
      </div>
    `;

    this.heroAvatarEl = this.el.querySelector('#battleHeroAvatar');
    this.petAvatarEl = this.el.querySelector('#battlePetAvatar');
    this.enemyAvatarEl = this.el.querySelector('#battleEnemyAvatar');
    this.enemyHpFillEl = this.el.querySelector('#enemyHpFill');
    this.enemyHpTextEl = this.el.querySelector('#enemyHpText');
    this.bossTimerBarEl = this.el.querySelector('#bossTimerBar');
    this.bossTimerTextEl = this.el.querySelector('#bossTimerText');
    this.bossWarningBannerEl = this.el.querySelector('#bossWarningBanner');

    this.updatePetDisplay();
  }
}
