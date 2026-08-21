import { CombatEngine, HeroAnimationState } from '../../engine/CombatEngine';
import { BATTLE_LAYOUT } from '../layout/BattleLayout';

export class HeroRenderer {
  private animTimer: number = 0;
  private idleImg: HTMLImageElement | null = null;
  private attack1Img: HTMLImageElement | null = null;
  private attack2Img: HTMLImageElement | null = null;
  private attack3Img: HTMLImageElement | null = null;

  constructor() {
    if (typeof Image !== 'undefined') {
      this.idleImg = new Image();
      this.idleImg.src = '/assets/fantasy/hero/Hero_IDLE.png';

      this.attack1Img = new Image();
      this.attack1Img.src = '/assets/fantasy/hero/Hero_ATTACK_1.png';

      this.attack2Img = new Image();
      this.attack2Img.src = '/assets/fantasy/hero/Hero_ATTACK_2.png';

      this.attack3Img = new Image();
      this.attack3Img.src = '/assets/fantasy/hero/Hero_ATTACK_3.png';
    }
  }

  public triggerAttack(): void {
    // Handled by CombatEngine state machine
  }

  public update(dt: number): void {
    this.animTimer += dt;
  }

  public render(ctx: CanvasRenderingContext2D, _width: number, _height: number): void {
    const state: HeroAnimationState = CombatEngine.getHeroState();
    const { x: heroX, y: heroY, width: displayW, height: displayH } = BATTLE_LAYOUT.hero;

    let currentImg = this.idleImg;
    let bob = 0;
    let tilt = 0;

    if (state === 'IDLE' || state === 'RUN') {
      currentImg = this.idleImg;
      bob = Math.sin(this.animTimer * 4) * 2;
    } else if (state === 'ATTACK') {
      currentImg = this.attack1Img;
    } else if (state === 'ATTACK_2') {
      currentImg = this.attack2Img;
    } else if (state === 'CRIT') {
      currentImg = this.attack3Img;
    } else if (state === 'HURT') {
      currentImg = this.idleImg;
      tilt = -0.08;
    } else if (state === 'VICTORY') {
      currentImg = this.idleImg;
      bob = -12 + Math.sin(this.animTimer * 8) * 6;
    }

    ctx.save();
    ctx.translate(heroX + displayW / 2, heroY + displayH / 2 + bob);
    ctx.rotate(tilt);

    if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
      if (state === 'HURT') {
        ctx.filter = 'brightness(1.5) sepia(1) hue-rotate(-50deg)';
      } else if (state === 'CRIT') {
        ctx.filter = 'drop-shadow(0 0 16px #f59e0b) brightness(1.2)';
      }
      ctx.drawImage(currentImg, -displayW / 2, -displayH / 2, displayW, displayH);
    } else if (this.idleImg && this.idleImg.complete && this.idleImg.naturalWidth > 0) {
      ctx.drawImage(this.idleImg, -displayW / 2, -displayH / 2, displayW, displayH);
    }

    ctx.restore();
  }
}
