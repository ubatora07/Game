import { events } from '../../core/EventBus';
import { BigNumber } from '../../core/BigNumber';
import { store } from '../../core/FantasyState';

interface FloatingNumber {
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  fontSize: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

export class VfxRenderer {
  private static numbers: FloatingNumber[] = [];
  private static particles: Particle[] = [];
  private static shakeTimer: number = 0;
  private static shakeMagnitude: number = 0;

  public static init(): void {
    events.on('combat:damage_dealt', (data) => {
      this.spawnDamageNumber(data.damage, data.isCrit, data.screenX, data.screenY);
      if (data.isCrit && store.get().settings.screenShake) {
        this.triggerShake(0.12, 6);
      }
    });

    events.on('combat:enemy_defeated', () => {
      this.spawnDeathSparks();
    });
  }

  public static triggerShake(duration: number, magnitude: number): void {
    this.shakeTimer = duration;
    this.shakeMagnitude = magnitude;
  }

  public static spawnDamageNumber(damage: number, isCrit: boolean, screenX?: number, screenY?: number): void {
    if (!store.get().settings.damageNumbers) return;

    const x = (screenX !== undefined ? screenX : (window.innerWidth ? window.innerWidth * 0.72 : 400)) + (Math.random() * 30 - 15);
    const y = (screenY !== undefined ? screenY : (window.innerHeight ? window.innerHeight * 0.55 : 300)) + (Math.random() * 20 - 10);

    const formatted = BigNumber.format(damage);
    const text = isCrit ? `CRIT! -${formatted}` : `-${formatted}`;

    this.numbers.push({
      text,
      x,
      y,
      vy: isCrit ? -1.8 : -1.2,
      alpha: 1.0,
      color: isCrit ? '#fbbf24' : '#ffffff',
      fontSize: isCrit ? 20 : 15,
    });
  }

  public static spawnDeathSparks(): void {
    const x = window.innerWidth ? window.innerWidth * 0.72 : 400;
    const y = window.innerHeight ? window.innerHeight * 0.60 : 300;

    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        alpha: 1.0,
        color: Math.random() > 0.3 ? '#f59e0b' : '#fbbf24',
        size: Math.random() * 4 + 2,
      });
    }
  }

  public static update(dt: number): void {
    // 1. Update Floating Numbers
    for (let i = this.numbers.length - 1; i >= 0; i--) {
      const n = this.numbers[i];
      n.y += n.vy;
      n.alpha -= dt * 1.5;
      if (n.alpha <= 0) {
        this.numbers.splice(i, 1);
      }
    }

    // 2. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += dt * 5; // Gravity
      p.alpha -= dt * 2.0;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 3. Shake Timer
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
    }
  }

  public static getShakeOffset(): { x: number; y: number } {
    if (this.shakeTimer > 0) {
      const sx = (Math.random() - 0.5) * this.shakeMagnitude * 2;
      const sy = (Math.random() - 0.5) * this.shakeMagnitude * 2;
      return { x: sx, y: sy };
    }
    return { x: 0, y: 0 };
  }

  public static render(ctx: CanvasRenderingContext2D): void {
    // Render Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render Floating Numbers
    for (const n of this.numbers) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, n.alpha);
      ctx.fillStyle = n.color;
      ctx.font = `900 ${n.fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(n.text, n.x, n.y);
      ctx.restore();
    }
  }
}
