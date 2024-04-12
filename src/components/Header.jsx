import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher.js';

function Header() {
  const { t } = useTranslation();

  return (
    <div>
      <ul>
        <li>{t('menu.start')}</li>
        <li>{t('menu.team')}</li>
        <li>{t('menu.howWeWork')}</li>
        <li>{t('menu.price')}</li>
        <li>{t('menu.offer')}</li>
        <li>{t('menu.contact')}</li>
        <li>{t('menu.reviews')}</li>
      </ul>
      <LanguageSwitcher />
    </div>
  );
}

export default Header;
