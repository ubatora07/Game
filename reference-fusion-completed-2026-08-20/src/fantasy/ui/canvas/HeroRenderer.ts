import { CombatEngine, HeroAnimationState } from '../../engine/CombatEngine';

export class HeroRenderer {
  private animTimer: number = 0;
  private spriteImg: HTMLImageElement | null = null;
  private isLoaded: boolean = false;

  constructor() {
    if (typeof Image !== 'undefined') {
      this.spriteImg = new Image();
      this.spriteImg.src = '/assets/fantasy/hero/hero_knight.png';
      this.spriteImg.onload = () => {
        this.isLoaded = true;
      };
    }
  }

  public triggerAttack(): void {
    // Handled by CombatEngine state machine
  }

  public update(dt: number): void {
    const state = CombatEngine.getHeroState();
    if (state === 'RUN') {
      this.animTimer += dt * 10;
    } else {
      this.animTimer += dt * 4;
    }
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const state: HeroAnimationState = CombatEngine.getHeroState();

    // Display Area: 240x280
    const displayW = 240;
    const displayH = 280;
    let heroX = width * 0.22;
    const groundY = height * 0.85;
    let heroY = groundY - displayH + 30;

    let bob = 0;
    let tilt = 0;
    let scaleX = 1.0;
    let scaleY = 1.0;

    switch (state) {
      case 'RUN':
        bob = Math.sin(this.animTimer) * 6;
        tilt = 0.05;
        break;
      case 'IDLE':
        bob = Math.sin(this.animTimer) * 2;
        tilt = 0;
        break;
      case 'ATTACK':
        heroX += 25; // Lunge forward
        tilt = 0.18;
        scaleX = 1.05;
        break;
      case 'ATTACK_2':
        heroX += 15;
        tilt = 0.12;
        bob = -8;
        break;
      case 'CRIT':
        heroX += 40; // Heavy forward thrust
        tilt = 0.25;
        scaleX = 1.12;
        scaleY = 1.05;
        break;
      case 'HURT':
        heroX -= 15; // Knockback recoil
        tilt = -0.15;
        bob = 4;
        break;
      case 'VICTORY':
        bob = -15 + Math.sin(this.animTimer * 2) * 5; // Joyful jump
        tilt = 0;
        break;
      case 'DEATH':
        tilt = -Math.PI / 2;
        heroY += 40;
        break;
    }

    ctx.save();
    ctx.translate(heroX + displayW / 2, heroY + displayH / 2 + bob);
    ctx.rotate(tilt);
    ctx.scale(scaleX, scaleY);

    if (this.isLoaded && this.spriteImg) {
      if (state === 'HURT') {
        ctx.filter = 'brightness(1.5) sepia(1) hue-rotate(-50deg)';
      } else if (state === 'CRIT') {
        ctx.filter = 'drop-shadow(0 0 16px #f59e0b) brightness(1.2)';
      }
      ctx.drawImage(this.spriteImg, -displayW / 2, -displayH / 2, displayW, displayH);
    } else {
      // Fallback
      ctx.fillStyle = state === 'HURT' ? '#ef4444' : '#d4d4d8';
      ctx.fillRect(-25, -50, 50, 80);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-8, -40, 16, 60);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-45, -30, 20, 50);
    }

    // Critical slash streak VFX
    if (state === 'CRIT') {
      ctx.save();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(40, -20, 70, -Math.PI / 4, Math.PI / 4);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}
