import { events } from '../../core/EventBus';
import { RhythmEvaluation } from '../../core/rhythm/RhythmTypes';
import { t } from '../../services/i18n/I18nService';

export class RhythmBeatIndicator {
  private element: HTMLElement;
  private feedbackEl: HTMLElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'rhythm-beat-indicator pixel-fantasy-rhythm';
    this.element.style.cssText = 'position:relative; width:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; margin-top:var(--space-04);';

    this.element.innerHTML = `
      <!-- Fantasy Rhythm Reticle Gauge -->
      <div style="display:flex; align-items:center; gap:var(--space-06);">
        <span style="font-size:10px; color:#d97706; font-weight:bold;">❮</span>
        <div class="rhythm-pulse-bar" style="width:180px; height:8px; background:#0c0a09; border:1px solid #78350f; border-radius:var(--radius-02); position:relative; overflow:hidden; box-shadow:var(--shadow-inset-deep);">
          <!-- Dynamic Target Zone -->
          <div class="rhythm-pulse-fill" style="position:absolute; left:50%; top:0; bottom:0; width:24px; transform:translateX(-50%); background:rgba(217,119,6,0.3); border-radius:var(--radius-01); box-shadow:var(--glow-gold);"></div>
          <!-- Precision Center Notch -->
          <div class="rhythm-center-notch" style="position:absolute; left:50%; top:0; bottom:0; width:2px; transform:translateX(-50%); background:#fde047; box-shadow:var(--glow-gold);"></div>
        </div>
        <span style="font-size:10px; color:#d97706; font-weight:bold;">❯</span>
      </div>

      <div class="rhythm-feedback-text" style="font-size:11px; font-weight:bold; font-family:var(--font-display); height:16px; margin-top:var(--space-03); color:#94a3b8; transition:all 0.15s ease; text-transform:uppercase; letter-spacing:0.5px;">
        RHYTHM CADENCE
      </div>
    `;

    this.feedbackEl = this.element.querySelector('.rhythm-feedback-text') as HTMLElement;

    events.on('rhythm:hit', (e: RhythmEvaluation) => {
      this.onRhythmHit(e);
    });
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  private onRhythmHit(e: RhythmEvaluation): void {
    if (!this.feedbackEl) return;

    if (e.isDebouncedSpam) return;

    if (e.rating === 'PERFECT') {
      this.feedbackEl.textContent = t('rhythm.perfect', { streak: e.streak });
      this.feedbackEl.style.color = '#fde047';
      this.feedbackEl.style.textShadow = '0 0 12px rgba(245,158,11,0.9)';
    } else if (e.rating === 'GOOD') {
      this.feedbackEl.textContent = t('rhythm.great', { streak: e.streak });
      this.feedbackEl.style.color = '#38bdf8';
      this.feedbackEl.style.textShadow = '0 0 8px rgba(56,189,248,0.8)';
    } else {
      this.feedbackEl.textContent = t('rhythm.missed');
      this.feedbackEl.style.color = '#64748b';
      this.feedbackEl.style.textShadow = 'none';
    }
  }
}
