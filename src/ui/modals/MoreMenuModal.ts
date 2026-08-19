import { ModalInstance, modalManager } from '../components/ModalManager';
import { events } from '../../core/EventBus';
import { t } from '../../services/i18n/I18nService';
import { sound } from '../../services/audio/SoundService';

export const MoreMenuModal: ModalInstance = {
  id: 'more_menu',
  render: () => {
    const el = document.createElement('div');
    el.style.textAlign = 'center';

    const menuItems = [
      // UX IA V3: More is reserved for legacy/meta systems, not primary-domain overflow.
      { id: 'sect', icon: '◆', labelKey: 'nav.sect', color: '#f59e0b', type: 'screen' },
      { id: 'souls', icon: '◎', labelKey: 'nav.souls', color: '#ec4899', type: 'screen' },
      { id: 'relics', icon: '◇', labelKey: 'nav.relics', color: '#a855f7', type: 'screen' },
      { id: 'dailies', icon: '▣', labelKey: 'nav.dailies', color: '#eab308', type: 'screen' },
      { id: 'legacy_codex_modal', icon: '✦', labelKey: 'nav.legacy_codex', color: '#a855f7', type: 'modal' },
      { id: 'stats', icon: '▥', labelKey: 'btn.stats', color: '#06b6d4', type: 'modal' },
      { id: 'settings', icon: '⚙', labelKey: 'nav.settings', color: '#94a3b8', type: 'modal' }
    ];

    const gridHtml = menuItems.map(item => `
      <button class="more-menu-tile" data-id="${item.id}" data-type="${item.type}" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 14px 10px;
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: var(--radius-md);
        color: var(--text-main);
        cursor: pointer;
        transition: all 0.15s ease;
        gap: 6px;
      ">
        <span style="font-size: 28px; filter: drop-shadow(0 0 8px ${item.color}60);">${item.icon}</span>
        <span style="font-size: 12px; font-weight: bold;">${t(item.labelKey)}</span>
      </button>
    `).join('');

    el.innerHTML = `
      <h2 style="font-family:var(--font-display); font-size:22px; color:#fde047; margin-bottom:14px; text-shadow:0 0 10px rgba(253,224,71,0.4);">
        ✨ ${t('modal.more.title')}
      </h2>

      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-bottom:18px;">
        ${gridHtml}
      </div>

      <button id="closeMoreMenuBtn" style="
        width: 100%;
        height: 44px;
        background: rgba(51, 65, 85, 0.8);
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
