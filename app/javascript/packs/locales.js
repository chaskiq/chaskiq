import { I18n } from 'i18n-js'
import translations from '../src/locales/translations.json'

export const i18n = new I18n(translations)
i18n.locale = document.documentElement.lang || 'en'
window.I18n = i18n
