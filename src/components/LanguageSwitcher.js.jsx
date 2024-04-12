import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PolandSVG from '../locales/Flags/PolandSVG';
import UkraineSVG from '../locales/Flags/UkraineSVG';
import RussiaSVG from '../locales/Flags/RussiaSVG';

function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true); // состояние загрузки

  // Получаем сохраненный язык из localStorage при загрузке компонента
  useState(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
    setLoading(false); // Отключаем загрузку после получения языка из localStorage
  });

  const changeLanguage = (lng) => {
    setLoading(true); // Включаем загрузку при смене языка
    setTimeout(() => {
      i18n.changeLanguage(lng);
      localStorage.setItem('language', lng);
      setLoading(false); // Отключаем загрузку после смены языка
    }, 300); // Задержка перед сменой языка
  };

  return (
    <div>
      
      <button onClick={() => changeLanguage('pl')}>
        <PolandSVG /> 
      </button>
      <button onClick={() => changeLanguage('ua')}>
        <UkraineSVG /> 
      </button>
      <button onClick={() => changeLanguage('ru')}>
        <RussiaSVG /> 
      </button>
      {!loading && <p>{t('buttonText')}</p>} {/* Показываем контент только когда загрузка завершена */}
    </div>
  );
}

export default LanguageSwitcher;
