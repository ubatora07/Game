export type TickCallback = (dt: number, now: number) => void;

export class GameLoop {
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private animFrameId: number | null = null;
  private tickCallbacks: Set<TickCallback> = new Set();
  private maxDelta: number = 0.5; // Cap delta to 500ms to prevent huge jumps from single micro-stutters

  public addCallback(cb: TickCallback): () => void {
    this.tickCallbacks.add(cb);
    return () => {
      this.tickCallbacks.delete(cb);
    };
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (currentTime: number) => {
      if (!this.isRunning) return;

      const rawDt = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      // Clamp delta time to avoid frame spikes
      const dt = Math.min(rawDt, this.maxDelta);

      if (dt > 0) {
        const now = Date.now();
        this.tickCallbacks.forEach((cb) => {
          try {
            cb(dt, now);
          } catch (err) {
            console.error('Error in GameLoop tick:', err);
          }
        });
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public get running(): boolean {
    return this.isRunning;
  }
}

export const gameLoop = new GameLoop();
