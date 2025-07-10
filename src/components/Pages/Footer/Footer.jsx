import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import IconBxlFacebookSquare from './IconBxlFacebookSquareSVG';
import IconCustomLogo from './IconCustomLogoSVG';
import IconEmail from './IconIconMailSVG';
import IconPhone from './IconPhoneSVG';
import './Footer.css';

function Footer() {
  const { t } = useTranslation();

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-contact">
          <a
            href="mailto:psycholog.basko@gmail.com"
            className="footer-contact-item"
          >
            <IconEmail className="footer-icon" />
            <span>psycholog.basko@gmail.com</span>
          </a>
          <div className="footer-phones">
            <a href="tel:794555809" className="footer-contact-item">
              <IconPhone className="footer-icon" />
              <span>794 555 809</span>
            </a>
          </div>
          <a
            href="https://facebook.com/login/?next=https%3A%2F%2Fm.facebook.com%2Fprofile.php%3Fid%3D100063593322120%26mibextid%3DwwXIfr%26rdid%3DeS9ueh4tqt8vLiB0%26share_url%3Dhttps%253A%252F%252Fm.facebook.com%252Fshare%252F156fxAJF1xW%252F%253Fmibextid%253DwwXIfr%2526wtsid%253Drdr_0Wxsbhi8lCvc9J8dT%26wtsid%3Drdr_0Wxsbhi8lCvc9J8dT%26refsrc%3Ddeprecated&rdid=eS9ueh4tqt8vLiB0&refsrc=deprecated"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-contact-item"
          >
            <IconBxlFacebookSquare className="footer-icon" />
            <span>Facebook</span>
          </a>
          <a
            href="https://www.znanylekarz.pl/natalia-basko/psycholog-psycholog-dzieciecy/warszawa"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-contact-item"
          >
            <IconCustomLogo className="footer-icon" />
            <span>ZnanyLekarz</span>
          </a>
        </div>
      </div>
      <div className="footer-middle">
        <div className="footer-logo">
          <img
            src={process.env.PUBLIC_URL + '/images/logo.png'}
            alt="Логотип"
          />
        </div>
        <nav className="footer-nav">
          <div className="footer-nav-row">
            <li>
              <Link to="/start" onClick={scrollToTop}>
                {t('menu.start')}
              </Link>
            </li>
            <li>
              <Link to="/team" onClick={scrollToTop}>
                {t('menu.team')}
              </Link>
            </li>
            <li>
              <Link to="/how-we-work" onClick={scrollToTop}>
                {t('menu.howWeWork')}
              </Link>
            </li>
          </div>
          <div className="footer-nav-row">
            <li>
              <Link to="/price" onClick={scrollToTop}>
                {t('menu.price')}
              </Link>
            </li>
            <li>
              <Link to="/offer" onClick={scrollToTop}>
                {t('menu.offer')}
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={scrollToTop}>
                {t('menu.contact')}
              </Link>
            </li>
            <li>
              <Link to="/reviews" onClick={scrollToTop}>
                {t('menu.reviews')}
              </Link>
            </li>
          </div>
        </nav>
      </div>
      <div className="footer-bottom">
        <p>{t('footer.cookiesInfo')}</p>
        <p>&copy; 2024 - {t('footer.allRightsReserved')}</p>
      </div>
    </footer>
  );
}

export default Footer;
