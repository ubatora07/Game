import { CombatEngine } from '../../engine/CombatEngine';
import { BigNumber } from '../../core/BigNumber';

export class EnemyRenderer {
  private static hpFrameImg: HTMLImageElement | null = null;
  private static isFrameLoaded: boolean = false;

  static {
    if (typeof Image !== 'undefined') {
      this.hpFrameImg = new Image();
      this.hpFrameImg.src = '/assets/fantasy/ui/frame_enemy_hp.png';
      this.hpFrameImg.onload = () => {
        this.isFrameLoaded = true;
      };
    }
  }

  public static render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const enemy = CombatEngine.getActiveEnemy();
    if (!enemy) return;

    // Anchor position: Right Side
    let enemyX = width * 0.72 + (enemy.recoilOffset || 0);
    const groundY = height * 0.78;
    let enemyY = groundY - 40;

    let scale = (enemy.def.sizeMultiplier || 1.0) * (enemy.isElite ? 1.25 : 1.0);
    let alpha = 1.0;
    let rotation = 0;

    switch (enemy.state) {
      case 'SPAWN':
        scale *= 0.5 + (1 - enemy.flashTimer / 0.2) * 0.5;
        break;
      case 'IDLE':
        enemyY += Math.sin(performance.now() * 0.005) * 2;
        break;
      case 'ATTACK':
        enemyX -= 25; // Lunge towards hero
        rotation = -0.15;
        break;
      case 'HURT':
        enemyX += enemy.recoilOffset;
        rotation = 0.12;
        break;
      case 'DEATH':
        scale *= Math.max(0, enemy.flashTimer / 0.35);
        rotation = Math.PI / 4;
        alpha = Math.max(0, enemy.flashTimer / 0.35);
        break;
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(enemyX, enemyY);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    // Elite Golden Aura
    if (enemy.isElite) {
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 5, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const isFlashing = enemy.state === 'HURT' || enemy.flashTimer > 0;
    const def = enemy.def;

    if (isFlashing) {
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = def.color;
    }

    // 1. Render Specific Monster Body
    if (def.id.includes('slime')) {
      ctx.beginPath();
      ctx.ellipse(0, 10, 20, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillRect(-8, 6, 4, 6);
      ctx.fillRect(4, 6, 4, 6);
    } else if (def.id.includes('wolf')) {
      ctx.beginPath();
      ctx.ellipse(0, 12, 28, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-22, -2, 16, 12);
      ctx.beginPath();
      ctx.moveTo(-16, -2);
      ctx.lineTo(-20, -14);
      ctx.lineTo(-12, -2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-18, 2, 4, 3);
    } else if (def.id.includes('spider')) {
      ctx.beginPath();
      ctx.ellipse(0, 10, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 2;
      for (let i = -3; i <= 3; i += 2) {
        ctx.beginPath();
        ctx.moveTo(i * 4, 10);
        ctx.lineTo(i * 10, 24);
        ctx.stroke();
      }
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(-6, 6, 3, 3);
      ctx.fillRect(3, 6, 3, 3);
    } else if (def.id.includes('dragon')) {
      ctx.beginPath();
      ctx.moveTo(-20, -10);
      ctx.lineTo(-40, -40);
      ctx.lineTo(-10, -20);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(20, -10);
      ctx.lineTo(40, -40);
      ctx.lineTo(10, -20);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 10, 42, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(-70, -35);
      ctx.lineTo(-40, 15);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(30, 0);
      ctx.lineTo(70, -35);
      ctx.lineTo(40, 15);
      ctx.closePath();
      ctx.fill();
    } else if (def.id.includes('treant')) {
      ctx.fillRect(-22, -15, 44, 45);
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(0, -25, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-10, -5, 6, 6);
      ctx.fillRect(4, -5, 6, 6);
    } else {
      ctx.fillRect(-14, 0, 28, 28);
      ctx.fillRect(-10, -16, 20, 18);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-6, -10, 4, 4);
      ctx.fillRect(2, -10, 4, 4);
      ctx.fillStyle = '#78716c';
      ctx.fillRect(14, -8, 6, 24);
    }

    ctx.restore();

    // 2. Health Bar Frame Above Head (Display: 360x40 for Boss, 200x26 for normal/elite)
    if (enemy.state !== 'DEATH') {
      const hpPct = Math.max(0, enemy.currentHp / enemy.maxHp);
      const frameW = def.isBoss ? 360 : 220;
      const frameH = def.isBoss ? 40 : 28;
      const barX = enemyX - frameW / 2;
      const barY = enemyY - (scale * 45) - 30;

      if (this.isFrameLoaded && this.hpFrameImg) {
        ctx.drawImage(this.hpFrameImg, barX, barY, frameW, frameH);

        const innerX = barX + (def.isBoss ? 52 : 32);
        const innerY = barY + (def.isBoss ? 9 : 7);
        const innerW = (frameW - (def.isBoss ? 70 : 44)) * hpPct;
        const innerH = def.isBoss ? 22 : 14;

        const hpFill = ctx.createLinearGradient(innerX, 0, innerX + innerW, 0);
        hpFill.addColorStop(0, '#dc2626');
        hpFill.addColorStop(1, '#f87171');
        ctx.fillStyle = hpFill;
        ctx.fillRect(innerX, innerY, innerW, innerH);
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(barX, barY, frameW, frameH);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(barX, barY, frameW * hpPct, frameH);
      }

      // HP Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${BigNumber.format(enemy.currentHp)} / ${BigNumber.format(enemy.maxHp)}`, enemyX, barY + (def.isBoss ? 24 : 19));

      // Enemy Name + Elite / Boss Tag
      const prefix = def.isBoss ? '👑 ' : (enemy.isElite ? '⭐ ELITE ' : '');
      ctx.fillStyle = def.isBoss ? '#fbbf24' : (enemy.isElite ? '#f59e0b' : '#f5f5f4');
      ctx.font = def.isBoss ? '900 13px sans-serif' : 'bold 12px sans-serif';
      ctx.fillText(`${prefix}${def.name}`, enemyX, barY - 6);
    }
  }
}
