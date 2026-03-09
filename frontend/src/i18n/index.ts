import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en/translation.json'
import hi from './locales/hi/translation.json'
import pa from './locales/pa/translation.json'
import mr from './locales/mr/translation.json'
import gu from './locales/gu/translation.json'
import te from './locales/te/translation.json'
import ta from './locales/ta/translation.json'
import kn from './locales/kn/translation.json'
import bn from './locales/bn/translation.json'
import or_ from './locales/or/translation.json'
import ml from './locales/ml/translation.json'

export const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳', nativeLabel: 'हिन्दी' },
  { code: 'pa', label: 'Punjabi', flag: '🌾', nativeLabel: 'ਪੰਜਾਬੀ' },
  { code: 'mr', label: 'Marathi', flag: '🇮🇳', nativeLabel: 'मराठी' },
  { code: 'gu', label: 'Gujarati', flag: '🇮🇳', nativeLabel: 'ગુજરાતી' },
  { code: 'te', label: 'Telugu', flag: '🇮🇳', nativeLabel: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', flag: '🇮🇳', nativeLabel: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', flag: '🇮🇳', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'bn', label: 'Bengali', flag: '🇮🇳', nativeLabel: 'বাংলা' },
  { code: 'or', label: 'Odia', flag: '🇮🇳', nativeLabel: 'ଓଡ଼ିଆ' },
  { code: 'ml', label: 'Malayalam', flag: '🇮🇳', nativeLabel: 'മലയാളം' },
]

export const fontMap: Record<string, string> = {
  en: 'Nunito, sans-serif',
  hi: '"Noto Sans Devanagari", Nunito, sans-serif',
  mr: '"Noto Sans Devanagari", Nunito, sans-serif',
  pa: '"Noto Sans Gurmukhi", Nunito, sans-serif',
  gu: '"Noto Sans Gujarati", Nunito, sans-serif',
  te: '"Noto Sans Telugu", Nunito, sans-serif',
  ta: '"Noto Sans Tamil", Nunito, sans-serif',
  kn: '"Noto Sans Kannada", Nunito, sans-serif',
  bn: '"Noto Sans Bengali", Nunito, sans-serif',
  or: '"Noto Sans Oriya", Nunito, sans-serif',
  ml: '"Noto Sans Malayalam", Nunito, sans-serif',
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      pa: { translation: pa },
      mr: { translation: mr },
      gu: { translation: gu },
      te: { translation: te },
      ta: { translation: ta },
      kn: { translation: kn },
      bn: { translation: bn },
      or: { translation: or_ },
      ml: { translation: ml },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'pa', 'mr', 'gu', 'te', 'ta', 'kn', 'bn', 'or', 'ml'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'kissan-mitra-lang',
      caches: ['localStorage'],
    },
  })

// Apply font on language change
const applyFont = (lng: string) => {
  document.documentElement.style.fontFamily = fontMap[lng] || fontMap.en
}

applyFont(i18n.language)
i18n.on('languageChanged', applyFont)

export default i18n
