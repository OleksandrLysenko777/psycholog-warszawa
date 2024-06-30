import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import './Header.css';

function Header() {
  const { t } = useTranslation();

  return (
    <header className="header">
      <div className="logo">
        <img src={process.env.PUBLIC_URL + '/images/logo.png'} alt="Logo" />
      </div>
      <nav className="nav-container">
        <ul className="nav-links">
          <li><Link to="/start">{t('menu.start')}</Link></li>
          <li><Link to="/team">{t('menu.team')}</Link></li>
          <li><Link to="/how-we-work">{t('menu.howWeWork')}</Link></li>
          <li><Link to="/price">{t('menu.price')}</Link></li>
          <li><Link to="/offer">{t('menu.offer')}</Link></li>
          <li><Link to="/contact">{t('menu.contact')}</Link></li>
          <li><Link to="/reviews">{t('menu.reviews')}</Link></li>
          <li><Link to="/admin-login" className="hidden-admin-link">Admin</Link></li>
          <li><Link to="/admin-register" className="hidden-admin-link">Admin Register</Link></li>
        </ul>
      </nav>
      <LanguageSwitcher />
    </header>
  );
}

export default Header;
