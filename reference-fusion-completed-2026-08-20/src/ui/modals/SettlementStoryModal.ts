import { ModalInstance, modalManager } from '../components/ModalManager';
import { settlementStorySystem } from '../../systems/SettlementStorySystem';
import { getAllChapters, getChapterDefinition } from '../../content/settlementStoryCatalog';
import { t } from '../../services/i18n/I18nService';

export const SettlementStoryModal: ModalInstance = {
  id: 'settlement_story_modal',
  render: () => {
    let selectedChapterId = settlementStorySystem.getCurrentChapter().id;
    const el = document.createElement('div');
    el.className = 'settlement-story-modal-container pixel-fantasy-modal';
    el.style.cssText = 'max-width:560px; padding:var(--space-16); background:radial-gradient(ellipse at 50% 15%, #1c1917 0%, #0c0a09 100%); border:2px solid #d97706; border-radius:var(--radius-06); box-shadow:var(--shadow-modal);';

    const refresh = () => {
      const allChapters = getAllChapters();
      const currentChapter = getChapterDefinition(selectedChapterId) || allChapters[0];
      const isCompleted = settlementStorySystem.isChapterCompleted(currentChapter.id);
      const canClaim = settlementStorySystem.canClaimChapter(currentChapter.id);
      const chosenPath = settlementStorySystem.getChosenPath();
      const chosenPathName = chosenPath === 'lord'
        ? t('story.path.lord.name')
        : chosenPath === 'adventurer'
          ? t('story.path.adventurer.name')
          : t('story.path.undecided');

      el.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-12); border-bottom:1.5px solid #78350f; padding-bottom:var(--space-08);">
          <div>
            <div style="font-size:9px; color:#f59e0b; font-weight:bold; letter-spacing:0.5px; font-family:var(--font-display);">📜 ${t('story.chronicles_label')} 📜</div>
            <h3 style="font-family:var(--font-display); font-size:16px; color:#fef08a; margin:var(--space-01) 0 0 0;">${t('story.title')}</h3>
          </div>
          <button id="btn-close-story" style="background:#1c1917; border:1px solid #78350f; border-radius:var(--radius-04); color:#fef08a; padding:var(--space-04) var(--space-08); font-family:var(--font-display); font-size:11px; cursor:pointer;">✕ ${t('btn.close')}</button>
        </div>

        <div style="display:flex; gap:var(--space-06); margin-bottom:var(--space-12); overflow-x:auto;">
          ${allChapters.map((chapter) => {
            const done = settlementStorySystem.isChapterCompleted(chapter.id);
            const active = chapter.id === selectedChapterId;
            return `
              <button class="btn-chap-tab" data-chap-id="${chapter.id}" style="flex:1; min-width:80px; padding:var(--space-06) var(--space-04); font-size:10px; font-family:var(--font-display); border-radius:var(--radius-04); border:1px solid ${active ? '#f59e0b' : '#573010'}; background:${active ? 'rgba(180,83,9,0.35)' : 'rgba(0,0,0,0.5)'}; color:${done ? '#34d399' : active ? '#fef08a' : '#94a3b8'}; cursor:pointer;">
                ${done ? '✓ ' : ''}${t('story.chapter_tab', { number: chapter.chapterNumber })}
              </button>
            `;
          }).join('')}
        </div>

        <div style="background:rgba(20,12,7,0.85); border:1.5px solid #78350f; border-radius:var(--radius-04); padding:var(--space-12); margin-bottom:var(--space-12);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-08); gap:var(--space-08);">
            <h4 style="font-size:13px; color:#fde047; margin:0; font-family:var(--font-display);">${t(currentChapter.titleKey)}</h4>
            <span style="font-size:9px; color:#a3e635; font-weight:bold; background:rgba(0,0,0,0.4); padding:var(--space-02) var(--space-06); border-radius:var(--radius-03);">${t('story.speaker', { name: t(currentChapter.npcSpeakerKey) })}</span>
          </div>

          <div style="font-style:italic; font-size:10px; color:#fcd34d; background:rgba(0,0,0,0.4); border-left:2px solid #f59e0b; padding:var(--space-08); margin-bottom:var(--space-10); line-height:1.4;">“${isCompleted ? t(currentChapter.loreOutroKey) : t(currentChapter.loreIntroKey)}”</div>
          <p style="font-size:10px; color:#cbd5e1; margin:0 0 var(--space-10) 0; line-height:1.3;">${t(currentChapter.summaryKey)}</p>

          <div style="background:rgba(0,0,0,0.5); padding:var(--space-08); border-radius:var(--radius-04); border:1px solid #451a03; margin-bottom:var(--space-10);">
            <div style="font-size:10px; color:#fbbf24; font-weight:bold; margin-bottom:var(--space-06);">${t('story.objectives')}</div>
            ${currentChapter.objectives.map((obj) => {
              const prog = settlementStorySystem.getObjectiveProgress(obj);
              return `
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; margin-bottom:var(--space-04); color:${prog.isDone ? '#34d399' : '#e2e8f0'}; gap:var(--space-08);">
                  <span>${prog.isDone ? '☑' : '☐'} ${t(obj.descKey)}</span>
                  <span style="font-weight:bold; font-size:9px;">${prog.current} / ${prog.target}</span>
                </div>
              `;
            }).join('')}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(180,83,9,0.15); border:1px dashed #b45309; padding:var(--space-06) var(--space-10); border-radius:var(--radius-04); font-size:10px; color:#fef08a; gap:var(--space-08);">
            <span>${t('story.rewards')}</span>
            <span>${t('story.reward_line', { gold: currentChapter.rewards.gold, crystals: currentChapter.rewards.crystals })}</span>
          </div>
        </div>

        <div style="background:rgba(0,0,0,0.6); border:1px solid #78350f; border-radius:var(--radius-04); padding:var(--space-10); margin-bottom:var(--space-12);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-06);">
            <span style="font-size:9.5px; font-weight:bold; color:#fbbf24; font-family:var(--font-display);">⚔️ ${t('story.path.label')}: ${chosenPathName}</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-06);">
            <button id="btn-path-lord" style="padding:var(--space-06) var(--space-08); background:${chosenPath === 'lord' ? 'rgba(245,158,11,0.3)' : 'rgba(20,12,7,0.7)'}; border:1px solid ${chosenPath === 'lord' ? '#f59e0b' : '#573010'}; border-radius:var(--radius-04); color:${chosenPath === 'lord' ? '#fde047' : '#94a3b8'}; font-size:9.5px; font-family:var(--font-display); cursor:pointer; text-align:left;">
              <div style="font-weight:bold;">🛡️ ${t('story.path.lord.name')}</div>
              <div style="font-size:8px; color:#a3e635; margin-top:var(--space-02);">${t('story.path.lord.bonus')}</div>
            </button>
            <button id="btn-path-adv" style="padding:var(--space-06) var(--space-08); background:${chosenPath === 'adventurer' ? 'rgba(56,189,248,0.3)' : 'rgba(20,12,7,0.7)'}; border:1px solid ${chosenPath === 'adventurer' ? '#38bdf8' : '#573010'}; border-radius:var(--radius-04); color:${chosenPath === 'adventurer' ? '#7dd3fc' : '#94a3b8'}; font-size:9.5px; font-family:var(--font-display); cursor:pointer; text-align:left;">
              <div style="font-weight:bold;">🦅 ${t('story.path.adventurer.name')}</div>
              <div style="font-size:8px; color:#38bdf8; margin-top:var(--space-02);">${t('story.path.adventurer.bonus')}</div>
            </button>
          </div>
        </div>

        <div>
          ${isCompleted ? `
            <button disabled style="width:100%; padding:var(--space-08); background:rgba(6,78,59,0.3); border:1px solid #059669; border-radius:var(--radius-04); color:#34d399; font-family:var(--font-display); font-size:11px;">✓ ${t('story.completed')}</button>
          ` : canClaim ? `
            <button id="btn-claim-chapter" style="width:100%; padding:var(--space-10); background:linear-gradient(135deg, #f59e0b, #b45309); border:1px solid #fde047; border-radius:var(--radius-04); color:#0c0a09; font-family:var(--font-display); font-weight:bold; font-size:12px; cursor:pointer; box-shadow:var(--glow-gold);">✦ ${t('story.complete_claim')} ✦</button>
          ` : `
            <button disabled style="width:100%; padding:var(--space-08); background:#1c1917; border:1px solid #573010; border-radius:var(--radius-04); color:#78716c; font-family:var(--font-display); font-size:11px;">${t('story.complete_objectives')}</button>
          `}
        </div>
      `;

      el.querySelectorAll('.btn-chap-tab').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          selectedChapterId = (e.currentTarget as HTMLElement).getAttribute('data-chap-id')!;
          refresh();
        });
      });
      el.querySelector('#btn-path-lord')?.addEventListener('click', () => { settlementStorySystem.choosePath('lord'); refresh(); });
      el.querySelector('#btn-path-adv')?.addEventListener('click', () => { settlementStorySystem.choosePath('adventurer'); refresh(); });
      el.querySelector('#btn-claim-chapter')?.addEventListener('click', () => { settlementStorySystem.claimChapter(selectedChapterId); refresh(); });
      el.querySelector('#btn-close-story')?.addEventListener('click', () => modalManager.close('settlement_story_modal'));
    };

    refresh();
    return el;
  },
};
