interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  glow: boolean;
}

export class ParticleCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private pool: Particle[] = [];
  private width: number = 0;
  private height: number = 0;
  private isHidden: boolean = false;
  private readonly MAX_ACTIVE_PARTICLES = 120;
  private readonly MAX_POOL_SIZE = 150;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.resize());
      document.addEventListener('visibilitychange', () => {
        this.isHidden = document.hidden;
        if (this.isHidden) {
          this.clear();
        }
      });
    }

    // Pre-populate particle pool
    while (this.pool.length < 50) {
      this.pool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 0,
        alpha: 1,
        decay: 0.02,
        color: '',
        glow: false,
      });
    }
  }

  public resize(): void {
    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
    this.width = this.canvas.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 800);
    this.height = this.canvas.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 600);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  public emitBurst(x: number, y: number, count: number = 16, color: string = '#f59e0b', isCrit: boolean = false): void {
    if (this.isHidden) return;

    const requestedCount = isCrit ? Math.min(count * 2, 24) : Math.min(count, 16);

    // If adding requestedCount would exceed MAX_ACTIVE_PARTICLES, recycle oldest
    const available = this.MAX_ACTIVE_PARTICLES - this.particles.length;
    if (available < requestedCount) {
      const overflow = requestedCount - available;
      for (let i = 0; i < overflow; i++) {
        const recycled = this.particles.shift();
        if (recycled && this.pool.length < this.MAX_POOL_SIZE) {
          this.pool.push(recycled);
        }
      }
    }

    const countToAdd = Math.min(requestedCount, Math.max(0, this.MAX_ACTIVE_PARTICLES - this.particles.length));
    for (let i = 0; i < countToAdd; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (isCrit ? 4 : 2.5) * (0.4 + Math.random() * 0.8);

      const p: Particle = this.pool.pop() || {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 0,
        alpha: 1,
        decay: 0.02,
        color: '',
        glow: false,
      };

      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - (isCrit ? 1.5 : 0.5);
      p.size = (isCrit ? 3.5 : 2.2) + Math.random() * 2;
      p.alpha = 1.0;
      p.decay = 0.025 + Math.random() * 0.02;
      p.color = color;
      p.glow = isCrit;

      this.particles.push(p);
    }
  }

  public update(): void {
    if (!this.ctx || this.isHidden) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        if (this.pool.length < this.MAX_POOL_SIZE) {
          this.pool.push(p);
        }
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;

      if (p.glow) {
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  public clear(): void {
    while (this.particles.length > 0) {
      const p = this.particles.pop();
      if (p && this.pool.length < this.MAX_POOL_SIZE) {
        this.pool.push(p);
      }
    }
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }

  public getStats(): { active: number; pooled: number } {
    return {
      active: this.particles.length,
      pooled: this.pool.length,
    };
  }
}
