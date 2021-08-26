//const I18n = window.I18n

import { I18n } from 'i18n-js';

import translations from '../locales/translations.json'; // '../src/locales/translations.json';

const i18n = new I18n(translations);
i18n.locale = document.documentElement.lang || 'en';
// window.I18n = i18n;
// export { I18n };

export default i18n;
