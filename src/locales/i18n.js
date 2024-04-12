import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ruTranslation from './ru.json';
import uaTranslation from './ua.json';
import plTranslation from './pl.json';

const resources = {
  ru: {
    translation: ruTranslation,
  },
  ua: {
    translation: uaTranslation,
  },
  pl: {
    translation: plTranslation,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pl', 
    fallbackLng: 'pl', 
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;
