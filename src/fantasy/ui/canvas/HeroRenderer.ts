import { CombatEngine } from '../../engine/CombatEngine';

export class HeroRenderer {
  private runAnimTimer: number = 0;
  private attackAnimTimer: number = 0;
  private isAttacking: boolean = false;

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

    // Hero Base Anchor Position (Left Side of screen)
    const heroX = width * 0.28;
    const groundY = height * 0.78;
    const heroY = groundY - 45;

    // Bobbing offset
    const bob = isRunning ? Math.sin(this.runAnimTimer) * 4 : Math.sin(this.runAnimTimer) * 1.5;
    const legOffset = isRunning ? Math.sin(this.runAnimTimer) * 8 : 0;

    ctx.save();
    ctx.translate(heroX, heroY + bob);

    // 1. Cape (Royal Blue)
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(-24 - (isRunning ? Math.cos(this.runAnimTimer) * 6 : 0), 28);
    ctx.lineTo(-6, 28);
    ctx.closePath();
    ctx.fill();

    // 2. Legs / Boots (Dark Iron)
    ctx.fillStyle = '#3f3f46';
    // Left Leg
    ctx.fillRect(-8 - legOffset * 0.5, 24, 6, 16);
    // Right Leg
    ctx.fillRect(2 + legOffset * 0.5, 24, 6, 16);

    // 3. Torso Armor (Silver & Gold Inlay)
    ctx.fillStyle = '#e4e4e7';
    ctx.fillRect(-10, 4, 20, 22);
    // Gold trim
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-2, 6, 4, 18);
    ctx.fillRect(-8, 12, 16, 3);

    // 4. Shield (Left Arm / Front)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(-16, 6);
    ctx.lineTo(-8, 6);
    ctx.lineTo(-8, 22);
    ctx.lineTo(-12, 28);
    ctx.lineTo(-16, 22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. Head / Great Helmet
    ctx.fillStyle = '#d4d4d8';
    ctx.fillRect(-8, -14, 16, 16);
    // Visor slit
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-4, -8, 12, 3);
    // Golden Plume
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-4, -14);
    ctx.lineTo(0, -22);
    ctx.lineTo(8, -14);
    ctx.closePath();
    ctx.fill();

    // 6. Sword / Weapon (Right Arm)
    ctx.save();
    if (this.isAttacking) {
      // Forward slash swing
      ctx.translate(14, 8);
      ctx.rotate(Math.PI / 3);
    } else {
      // Resting / ready angle
      ctx.translate(10, 10);
      ctx.rotate(-Math.PI / 6);
    }

    // Blade
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, -26, 4, 26);
    ctx.fillStyle = '#60a5fa'; // Blue glow edge
    ctx.fillRect(3, -26, 1, 26);
    // Crossguard & Hilt
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-4, 0, 12, 3);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 3, 4, 6);
    ctx.restore();

    ctx.restore();
  }
}
