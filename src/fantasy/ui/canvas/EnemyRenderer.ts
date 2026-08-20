import { CombatEngine } from '../../engine/CombatEngine';
import { BigNumber } from '../../core/BigNumber';

export class EnemyRenderer {
  public static render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const enemy = CombatEngine.getActiveEnemy();
    if (!enemy) return;

    // Anchor position: Right Side
    const enemyX = width * 0.72 + (enemy.recoilOffset || 0);
    const groundY = height * 0.78;
    const enemyY = groundY - 40;

    ctx.save();
    ctx.translate(enemyX, enemyY);

    const isFlashing = enemy.flashTimer > 0;
    const def = enemy.def;
    const scale = def.sizeMultiplier || 1.0;
    ctx.scale(scale, scale);

    // 1. Render Specific Monster Archetype
    if (isFlashing) {
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = def.color;
    }

    if (def.id.includes('slime')) {
      // Green Slime
      ctx.beginPath();
      ctx.ellipse(0, 10, 20, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(-8, 6, 4, 6);
      ctx.fillRect(4, 6, 4, 6);
    } else if (def.id.includes('wolf')) {
      // Wolf / Dire Wolf
      ctx.beginPath();
      ctx.ellipse(0, 12, 28, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Snout & Head
      ctx.fillRect(-22, -2, 16, 12);
      // Ears
      ctx.beginPath();
      ctx.moveTo(-16, -2);
      ctx.lineTo(-20, -14);
      ctx.lineTo(-12, -2);
      ctx.fill();
      // Red Eye
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-18, 2, 4, 3);
    } else if (def.id.includes('spider')) {
      // Spider
      ctx.beginPath();
      ctx.ellipse(0, 10, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // 8 Legs
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 2;
      for (let i = -3; i <= 3; i += 2) {
        ctx.beginPath();
        ctx.moveTo(i * 4, 10);
        ctx.lineTo(i * 10, 24);
        ctx.stroke();
      }
      // Glowing Eyes
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(-6, 6, 3, 3);
      ctx.fillRect(3, 6, 3, 3);
    } else if (def.id.includes('dragon')) {
      // Elder Dragon Boss
      // Giant Horns & Head
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
      // Massive Body
      ctx.beginPath();
      ctx.ellipse(0, 10, 42, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fiery Wings
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
      // Treant King
      ctx.fillRect(-22, -15, 44, 45);
      // Foliage crown
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(0, -25, 24, 0, Math.PI * 2);
      ctx.fill();
      // Glowing yellow eyes
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-10, -5, 6, 6);
      ctx.fillRect(4, -5, 6, 6);
    } else {
      // Default Goblin / Orc / Bipedal
      ctx.fillRect(-14, 0, 28, 28);
      ctx.fillRect(-10, -16, 20, 18);
      // Red / Yellow Eyes
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-6, -10, 4, 4);
      ctx.fillRect(2, -10, 4, 4);
      // Weapon
      ctx.fillStyle = '#78716c';
      ctx.fillRect(14, -8, 6, 24);
    }

    ctx.restore();

    // 2. Health Bar Above Head
    const hpPct = Math.max(0, enemy.currentHp / enemy.maxHp);
    const barWidth = def.isBoss ? 160 : 80;
    const barHeight = def.isBoss ? 12 : 8;
    const barX = enemyX - barWidth / 2;
    const barY = enemyY - (scale * 35) - 20;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

    // HP Fill (Red gradient)
    const hpFill = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    hpFill.addColorStop(0, '#dc2626');
    hpFill.addColorStop(1, '#ef4444');
    ctx.fillStyle = hpFill;
    ctx.fillRect(barX, barY, barWidth * hpPct, barHeight);

    // HP Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${BigNumber.format(enemy.currentHp)} / ${BigNumber.format(enemy.maxHp)}`, enemyX, barY - 4);

    // Enemy Name
    ctx.fillStyle = def.isBoss ? '#f59e0b' : '#f5f5f4';
    ctx.font = def.isBoss ? 'bold 12px sans-serif' : 'bold 11px sans-serif';
    ctx.fillText(def.name, enemyX, barY - 16);
  }
}
