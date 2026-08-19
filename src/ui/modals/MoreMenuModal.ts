import { ModalInstance, modalManager } from '../components/ModalManager';
import { events } from '../../core/EventBus';
import { t } from '../../services/i18n/I18nService';
import { sound } from '../../services/audio/SoundService';
import { resolveUIIcon } from '../art/runtime/UIIconRegistry';

export const MoreMenuModal: ModalInstance = {
  id: 'more_menu',
  render: () => {
    const el = document.createElement('div');
    el.style.textAlign = 'center';

    const menuItems = [
      // UX IA V3: More is reserved for legacy/meta systems, not primary-domain overflow.
      { id: 'sect', iconId: 'more_sect', labelKey: 'nav.sect', color: '#d9902f', type: 'screen' },
      { id: 'souls', iconId: 'more_legacy', labelKey: 'nav.souls', color: '#9a70b5', type: 'screen' },
      { id: 'relics', iconId: 'more_relics', labelKey: 'nav.relics', color: '#9a70b5', type: 'screen' },
      { id: 'dailies', iconId: 'more_dailies', labelKey: 'nav.dailies', color: '#d6a03c', type: 'screen' },
      { id: 'legacy_codex_modal', iconId: 'more_codex', labelKey: 'nav.legacy_codex', color: '#9a70b5', type: 'modal' },
      { id: 'stats', iconId: 'more_stats', labelKey: 'btn.stats', color: '#48a7bf', type: 'modal' },
      { id: 'settings', iconId: 'more_settings', labelKey: 'nav.settings', color: '#a8a29e', type: 'modal' }
    ];

    const gridHtml = menuItems.map(item => `
      <button class="more-menu-tile" data-id="${item.id}" data-type="${item.type}" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-3);
        background: var(--surface-stone);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        color: var(--text-main);
        cursor: pointer;
        transition: all 0.15s ease;
        gap: var(--space-2);
      ">
        <span style="width:28px;height:28px;color:${item.color};filter:drop-shadow(0 0 5px ${item.color}40);">${resolveUIIcon(item.iconId).fallbackSvg}</span>
        <span style="font-size: 12px; font-weight: bold;">${t(item.labelKey)}</span>
      </button>
    `).join('');

    el.innerHTML = `
      <h2 style="font-family:var(--font-display); font-size:22px; color:#fde047; margin-bottom:14px; text-shadow:0 0 10px rgba(253,224,71,0.4);">
        ${t('modal.more.title')}
      </h2>

      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:var(--space-3); margin-bottom:var(--space-4);">
        ${gridHtml}
      </div>

      <button id="closeMoreMenuBtn" style="
        width: 100%;
        height: 44px;
        background: var(--surface-stone);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        color: #ffffff;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
      ">
        ${t('btn.close')}
      </button>
    `;

    el.querySelectorAll('.more-menu-tile').forEach((tile) => {
      tile.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement);
        const id = target.getAttribute('data-id')!;
        const type = target.getAttribute('data-type')!;

        sound.playTap();
        modalManager.close('more_menu');

        if (type === 'screen') {
          events.emit('screen:change', { screenId: id });
        } else if (type === 'modal') {
          events.emit('modal:open', { modalId: id });
        }
      });
    });

    el.querySelector('#closeMoreMenuBtn')?.addEventListener('click', () => {
      sound.playTap();
      modalManager.close('more_menu');
    });

    return el;
  }
};
