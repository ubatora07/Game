import { store } from '../../core/FantasyState';
import { WORLDS } from '../../content/worlds';
import { CombatEngine } from '../../engine/CombatEngine';
import { BATTLE_LAYOUT } from '../layout/BattleLayout';

export class WorldRenderer {
  private offsetFar: number = 0;
  private offsetMid: number = 0;
  private offsetNear: number = 0;
  private offsetGround: number = 0;

  private bgImg: HTMLImageElement | null = null;

  constructor() {
    if (typeof Image !== 'undefined') {
      this.bgImg = new Image();
      this.bgImg.src = '/assets/fantasy/bg/Background_Greenvale.png';
    }
  }

  public update(dt: number): void {
    const isRunning = CombatEngine.getPhase() === 'RUNNING';
    const speed = isRunning ? 160 : 0; // 160px/s travel speed

    this.offsetFar = (this.offsetFar + speed * 0.25 * dt) % 1920;
    this.offsetMid = (this.offsetMid + speed * 0.50 * dt) % 10000;
    this.offsetNear = (this.offsetNear + speed * 0.85 * dt) % 10000;
    this.offsetGround = (this.offsetGround + speed * 1.30 * dt) % 10000;
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const s = store.get();
    const worldDef = WORLDS[s.world.currentWorldId] || WORLDS[1];

    if (this.bgImg && this.bgImg.complete && this.bgImg.naturalWidth > 0) {
      const { x: bgX, y: bgY, width: bgW, height: bgH } = BATTLE_LAYOUT.background;
      ctx.drawImage(this.bgImg, bgX, bgY, bgW, bgH);
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
      const groundY = height * 0.72;
      ctx.fillStyle = worldDef.nearGroundColor;
      ctx.fillRect(0, groundY, width, height - groundY);

      const pathY = height * 0.78;
      ctx.fillStyle = worldDef.pathColor;
      ctx.fillRect(0, pathY, width, height - pathY);
    }
  }
}
