import { store } from '../../core/FantasyState';
import { WORLDS } from '../../content/worlds';
import { CombatEngine } from '../../engine/CombatEngine';

export class WorldRenderer {
  private offsetFar: number = 0;
  private offsetMid: number = 0;
  private offsetNear: number = 0;
  private offsetGround: number = 0;

  private bgImg: HTMLImageElement | null = null;
  private isBgLoaded: boolean = false;

  constructor() {
    if (typeof Image !== 'undefined') {
      this.bgImg = new Image();
      this.bgImg.src = '/assets/fantasy/bg/fight_bg.png';
      this.bgImg.onload = () => {
        this.isBgLoaded = true;
      };
    }
  }

  public update(dt: number): void {
    const isRunning = CombatEngine.getPhase() === 'RUNNING';
    const speed = isRunning ? 180 : 0; // 180px/s travel speed

    this.offsetFar = (this.offsetFar + speed * 0.6 * dt);
    this.offsetMid = (this.offsetMid + speed * 0.85 * dt);
    this.offsetNear = (this.offsetNear + speed * 1.1 * dt);
    this.offsetGround = (this.offsetGround + speed * 1.30 * dt);
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const s = store.get();
    const worldDef = WORLDS[s.world.currentWorldId] || WORLDS[1];

    if (this.isBgLoaded && this.bgImg) {
      // Draw High-Res Seamless Parallax BG (Aspect Ratio 2172:724 = 3:1)
      const aspect = 2172 / 724;
      const bgH = height;
      const bgW = Math.max(width, bgH * aspect);

      const startX = -(this.offsetFar % bgW);
      for (let x = startX; x < width + bgW; x += bgW) {
        ctx.drawImage(this.bgImg, Math.floor(x), 0, Math.ceil(bgW), Math.ceil(bgH));
      }
    } else {
      // Procedural Fallback
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, worldDef.skyGradient[0]);
      sky.addColorStop(0.7, worldDef.skyGradient[1]);
      sky.addColorStop(1, '#0c0a09');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Far Layer: Distant Mountain Silhouettes
      ctx.fillStyle = worldDef.farHillsColor;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.55);
      const farStep = 180;
      for (let x = -farStep; x <= width + farStep; x += farStep) {
        const hillX = x - (this.offsetFar % farStep);
        const hillH = Math.sin((hillX + this.offsetFar * 0.05) * 0.01) * 35 + height * 0.52;
        ctx.lineTo(hillX, hillH);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Mid Layer: Forest
      ctx.fillStyle = worldDef.midTreesColor;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.65);
      const midStep = 90;
      for (let x = -midStep; x <= width + midStep; x += midStep) {
        const treeX = x - (this.offsetMid % midStep);
        const treeH = height * 0.62 + ((Math.abs(Math.sin(treeX * 0.03)) * 40));
        ctx.lineTo(treeX, treeH);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Ground Layer
      const groundY = height * 0.86;
      ctx.fillStyle = worldDef.nearGroundColor;
      ctx.fillRect(0, groundY, width, height - groundY);

      const pathY = height * 0.88;
      ctx.fillStyle = worldDef.pathColor;
      ctx.fillRect(0, pathY, width, height - pathY);
    }
  }
}
