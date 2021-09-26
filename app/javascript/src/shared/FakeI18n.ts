import { I18n } from 'i18n-js';
import translations from '../locales/translations.json'; // '../src/locales/translations.json';
const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.locale = document.documentElement.lang || 'en';
export default i18n;
