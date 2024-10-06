import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import './Header.css';

function Header({ isAdmin, onLogout }) {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="logo">
        <img src={process.env.PUBLIC_URL + '/images/logo.png'} alt="Logo" />
      </div>

      {/* Бургер-меню для мобильных версий */}
      <div
        className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={toggleMobileMenu}
      >
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      {/* Навигация */}
      <nav className={`nav-container ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul className="nav-links">
          <li><Link to="/start" onClick={() => setMobileMenuOpen(false)}>{t('menu.start')}</Link></li>
          <li><Link to="/team" onClick={() => setMobileMenuOpen(false)}>{t('menu.team')}</Link></li>
          <li><Link to="/how-we-work" onClick={() => setMobileMenuOpen(false)}>{t('menu.howWeWork')}</Link></li>
          <li><Link to="/price" onClick={() => setMobileMenuOpen(false)}>{t('menu.price')}</Link></li>
          <li><Link to="/offer" onClick={() => setMobileMenuOpen(false)}>{t('menu.offer')}</Link></li>
          <li><Link to="/contact" onClick={() => setMobileMenuOpen(false)}>{t('menu.contact')}</Link></li>
          <li><Link to="/reviews" onClick={() => setMobileMenuOpen(false)}>{t('menu.reviews')}</Link></li>
          {isAdmin && (
            <li>
              <button onClick={onLogout} className="logout-button">{t('menu.logout')}</button>
            </li>
          )}
        </ul>
      </nav>

      {/* Переключатель языка */}
      <LanguageSwitcher />
    </header>
  );
}

export default Header;
