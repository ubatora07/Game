import { en } from './translations/en';
import { ru } from './translations/ru';
import { store } from '../../core/GameState';

export type Language = 'ru' | 'en';

export class I18nService {
  private static instance: I18nService;
  private currentLang: Language = 'ru';
  private dictionaries: Record<Language, Record<string, string>> = {
    ru,
    en
  };

  private constructor() {
    // Sync with initial store settings
    this.currentLang = store.get().settings.language || 'ru';
  }

  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  public setLanguage(lang: Language): void {
    if (lang !== this.currentLang && (lang === 'ru' || lang === 'en')) {
      this.currentLang = lang;
      store.set((draft) => {
        draft.settings.language = lang;
      });
      // Trigger full UI text refresh
      if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('i18n:change', { detail: { lang } }));
      }
    }
  }

  public getLanguage(): Language {
    return this.currentLang;
  }

  public t(key: string, params?: Record<string, string | number>): string {
    const dict = this.dictionaries[this.currentLang] || this.dictionaries.ru;
    let text = dict[key] || this.dictionaries.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`{${paramKey}}`, 'g'), String(value));
      });
    }

    return text;
  }
}

export const i18n = I18nService.getInstance();
export const t = (key: string, params?: Record<string, string | number>) => i18n.t(key, params);
