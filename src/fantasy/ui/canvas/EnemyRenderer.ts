import { CombatEngine } from '../../engine/CombatEngine';
import { BigNumber } from '../../core/BigNumber';
import { BATTLE_LAYOUT } from '../layout/BattleLayout';

export class EnemyRenderer {
  private static hpFrameImg: HTMLImageElement | null = null;
  private static isFrameLoaded: boolean = false;
  public static goblinImg: HTMLImageElement | null = null;

  static {
    if (typeof Image !== 'undefined') {
      this.hpFrameImg = new Image();
      this.hpFrameImg.src = '/assets/fantasy/ui/frame_enemy_hp.png';
      this.hpFrameImg.onload = () => {
        this.isFrameLoaded = true;
      };

      this.goblinImg = new Image();
      this.goblinImg.src = '/assets/fantasy/enemy/Enemy_Goblin.png';
    }
  }

  public static render(ctx: CanvasRenderingContext2D, _width: number, _height: number): void {
    const enemy = CombatEngine.getActiveEnemy();
    if (!enemy) return;

    const { x: baseX, y: baseY, width: goblinW, height: goblinH } = BATTLE_LAYOUT.enemy;
    let goblinX = baseX;
    let goblinY = baseY;

    let scale = (enemy.def.sizeMultiplier || 1.0) * (enemy.isElite ? 1.15 : 1.0);
    let alpha = 1.0;
    let rotation = 0;

    switch (enemy.state) {
      case 'SPAWN':
        scale *= 0.5 + (1 - enemy.flashTimer / 0.2) * 0.5;
        break;
      case 'IDLE':
        goblinY += Math.sin(performance.now() * 0.005) * 2;
        break;
      case 'ATTACK':
        goblinX -= 25;
        rotation = -0.15;
        break;
      case 'HURT':
        goblinX += enemy.recoilOffset || 0;
        rotation = 0.12;
        break;
      case 'DEATH':
        scale *= Math.max(0, enemy.flashTimer / 0.35);
        rotation = Math.PI / 4;
        alpha = Math.max(0, enemy.flashTimer / 0.35);
        break;
    }

    const isFlashing = enemy.state === 'HURT' || enemy.flashTimer > 0;
    const def = enemy.def;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(goblinX + goblinW / 2, goblinY + goblinH / 2);
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
      ctx.arc(0, 0, goblinW * 0.45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (isFlashing) {
      ctx.filter = 'brightness(2) drop-shadow(0 0 16px #ef4444)';
    }

    if (this.goblinImg && this.goblinImg.complete && this.goblinImg.naturalWidth > 0) {
      ctx.drawImage(this.goblinImg, -goblinW / 2, -goblinH / 2, goblinW, goblinH);
    } else {
      ctx.fillStyle = isFlashing ? '#ffffff' : '#15803d';
      ctx.fillRect(-goblinW / 2, -goblinH / 2, goblinW, goblinH);
    }

    ctx.restore();

    // 2. Health Bar Frame Above Head (1920x1080 coordinate space)
    if (enemy.state !== 'DEATH') {
      const hpPct = Math.max(0, enemy.currentHp / enemy.maxHp);
      const frameW = def.isBoss ? BATTLE_LAYOUT.enemy.hpBar.bossWidth : BATTLE_LAYOUT.enemy.hpBar.normalWidth;
      const frameH = def.isBoss ? BATTLE_LAYOUT.enemy.hpBar.bossHeight : BATTLE_LAYOUT.enemy.hpBar.normalHeight;
      const centerX = goblinX + goblinW / 2;
      const barX = centerX - frameW / 2;
      const barY = goblinY + BATTLE_LAYOUT.enemy.hpBar.yOffset;

      if (this.isFrameLoaded && this.hpFrameImg && this.hpFrameImg.complete && this.hpFrameImg.naturalWidth > 0) {
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
      ctx.fillText(`${BigNumber.format(enemy.currentHp)} / ${BigNumber.format(enemy.maxHp)}`, centerX, barY + (def.isBoss ? 24 : 19));

      // Enemy Name + Elite / Boss Tag
      const prefix = def.isBoss ? '👑 ' : (enemy.isElite ? '⭐ ELITE ' : '');
      ctx.fillStyle = def.isBoss ? '#fbbf24' : (enemy.isElite ? '#f59e0b' : '#f5f5f4');
      ctx.font = def.isBoss ? '900 13px sans-serif' : 'bold 12px sans-serif';
      ctx.fillText(`${prefix}${def.name}`, centerX, barY - 6);
    }
  }
}
