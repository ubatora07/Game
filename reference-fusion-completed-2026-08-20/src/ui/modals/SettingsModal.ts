import { ModalInstance, modalManager } from '../components/ModalManager';
import { store } from '../../core/GameState';
import { t, i18n } from '../../services/i18n/I18nService';
import { sound } from '../../services/audio/SoundService';
import { saveService } from '../../services/save/SaveService';

export const SettingsModal: ModalInstance = {
  id: 'settings',
  render: () => {
    const s = store.get().settings;
    const el = document.createElement('div');

    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-16);">
        <h2 style="font-family:var(--font-display); font-size:20px; color:#fde047;">
          ⚙️ ${t('nav.settings')}
        </h2>
        <button id="settingsCloseBtn" style="font-size:20px; color:var(--text-muted); cursor:pointer;">✕</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:var(--space-14); font-size:13px;">
        <!-- Sound FX -->
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>${t('settings.sound')}</span>
          <input type="checkbox" id="setSound" ${s.soundEnabled ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;" />
        </div>

        <!-- BGM Music -->
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>${t('settings.music')}</span>
          <input type="checkbox" id="setMusic" ${s.musicEnabled ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;" />
        </div>

        <!-- Reduced Motion -->
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>${t('settings.reduced_motion')}</span>
          <input type="checkbox" id="setReducedMotion" ${s.reducedMotion ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;" />
        </div>

        <!-- Screen Shake -->
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>${t('settings.screen_shake')}</span>
          <input type="checkbox" id="setScreenShake" ${s.screenShake ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;" />
        </div>

        <!-- Number Notation -->
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>${t('settings.notation')}</span>
          <select id="setNotation" style="background:#1e293b; color:#fff; border:1px solid var(--border-subtle); padding:var(--space-04) var(--space-08); border-radius:var(--radius-sm);">
            <option value="standard" ${s.notation === 'standard' ? 'selected' : ''}>${t('settings.notation_standard')}</option>
            <option value="scientific" ${s.notation === 'scientific' ? 'selected' : ''}>${t('settings.notation_scientific')}</option>
          </select>
        </div>

        <!-- Language -->
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>${t('settings.language')}</span>
          <select id="setLang" style="background:#1e293b; color:#fff; border:1px solid var(--border-subtle); padding:var(--space-04) var(--space-08); border-radius:var(--radius-sm);">
            <option value="ru" ${s.language === 'ru' ? 'selected' : ''}>${t('settings.language_ru')}</option>
            <option value="en" ${s.language === 'en' ? 'selected' : ''}>${t('settings.language_en')}</option>
          </select>
        </div>

        <hr style="border:none; border-top:1px solid var(--border-subtle); margin:var(--space-08) 0;" />

        <!-- Reset Save -->
        <button id="resetSaveBtn" style="height:40px; background:rgba(239,68,68,0.2); border:1px solid #ef4444; color:#f87171; border-radius:var(--radius-md); font-weight:bold; cursor:pointer;">
          ${t('settings.reset')}
        </button>
      </div>
    `;

    // Bindings
    el.querySelector('#settingsCloseBtn')?.addEventListener('click', () => {
      modalManager.close('settings');
    });

    el.querySelector('#setSound')?.addEventListener('change', (e) => {
      const val = (e.target as HTMLInputElement).checked;
      store.set((draft) => { draft.settings.soundEnabled = val; });
      sound.updateVolumes();
    });

    el.querySelector('#setMusic')?.addEventListener('change', (e) => {
      const val = (e.target as HTMLInputElement).checked;
      store.set((draft) => { draft.settings.musicEnabled = val; });
      sound.updateVolumes();
      if (val) sound.startAmbientBgm();
      else sound.stopAmbientBgm();
    });

    el.querySelector('#setReducedMotion')?.addEventListener('change', (e) => {
      const val = (e.target as HTMLInputElement).checked;
      store.set((draft) => { draft.settings.reducedMotion = val; });
    });

    el.querySelector('#setScreenShake')?.addEventListener('change', (e) => {
      const val = (e.target as HTMLInputElement).checked;
      store.set((draft) => { draft.settings.screenShake = val; });
    });

    el.querySelector('#setNotation')?.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value as 'standard' | 'scientific';
      store.set((draft) => { draft.settings.notation = val; });
    });

    el.querySelector('#setLang')?.addEventListener('change', (e) => {
      const val = (e.target as HTMLSelectElement).value as 'ru' | 'en';
      i18n.setLanguage(val);
      modalManager.close('settings');
    });

    el.querySelector('#resetSaveBtn')?.addEventListener('click', () => {
      if (confirm(t('settings.reset_confirm'))) {
        saveService.clearSave();
        modalManager.close('settings');
        location.reload();
      }
    });

    return el;
  }
};
