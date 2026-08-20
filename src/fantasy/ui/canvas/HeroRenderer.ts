import { CombatEngine } from '../../engine/CombatEngine';

export class HeroRenderer {
  private runAnimTimer: number = 0;
  private attackAnimTimer: number = 0;
  private isAttacking: boolean = false;
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
    this.isAttacking = true;
    this.attackAnimTimer = 0.18;
  }

  public update(dt: number): void {
    const phase = CombatEngine.getPhase();
    if (phase === 'RUNNING') {
      this.runAnimTimer += dt * 10;
    } else {
      this.runAnimTimer += dt * 3;
    }

    if (this.attackAnimTimer > 0) {
      this.attackAnimTimer -= dt;
      if (this.attackAnimTimer <= 0) {
        this.isAttacking = false;
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const phase = CombatEngine.getPhase();
    const isRunning = phase === 'RUNNING';

    // Hero Base Anchor Position (Display Area: 240x280)
    const displayW = 240;
    const displayH = 280;
    const heroX = width * 0.22;
    const groundY = height * 0.78;
    const heroY = groundY - displayH + 30;

    // Bobbing offset
    const bob = isRunning ? Math.sin(this.runAnimTimer) * 6 : Math.sin(this.runAnimTimer) * 2;
    const tilt = isRunning ? 0.05 : (this.isAttacking ? 0.15 : 0);

    ctx.save();
    ctx.translate(heroX + displayW / 2, heroY + displayH / 2 + bob);
    ctx.rotate(tilt);

    if (this.isLoaded && this.spriteImg) {
      // Draw High-Res Knight Sprite
      ctx.drawImage(this.spriteImg, -displayW / 2, -displayH / 2, displayW, displayH);
    } else {
      // Procedural Fallback
      ctx.fillStyle = '#d4d4d8';
      ctx.fillRect(-25, -50, 50, 80);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-8, -40, 16, 60);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-45, -30, 20, 50);
    }

    ctx.restore();
  }
}
