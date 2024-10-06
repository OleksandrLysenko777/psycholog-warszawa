import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PolandSVG from '../../../locales/Flags/PolandSVG';
import UkraineSVG from '../../../locales/Flags/UkraineSVG';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'pl');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage !== language) {
      i18n.changeLanguage(savedLanguage);
      setLanguage(savedLanguage);
    }
  }, [i18n, language]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng).then(() => {
      localStorage.setItem('language', lng);
      setLanguage(lng);
    });
  };

  return (
    <div className="language-switcher">
      <button onClick={() => changeLanguage('pl')} className={`lang-button ${language === 'pl' ? 'active' : ''}`}>
        <PolandSVG />
      </button>
      <button onClick={() => changeLanguage('ua')} className={`lang-button ${language === 'ua' ? 'active' : ''}`}>
        <UkraineSVG />
      </button>
    </div>
  );
}

export default LanguageSwitcher;
