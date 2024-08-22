import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import IconBxlFacebookSquare from './IconBxlFacebookSquareSVG';
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
                    <a href="mailto:psychologwaw2@gmail.com" className="footer-contact-item">
                        <IconEmail className="footer-icon" />
                        <span>psychologwaw2@gmail.com</span>
                    </a>
                    <div className="footer-phones">
                        <a href="tel:794555809" className="footer-contact-item">
                            <IconPhone className="footer-icon" />
                            <span>794 555 809</span>
                        </a>
                        <a href="tel:601949472" className="footer-contact-item">
                            <IconPhone className="footer-icon" />
                            <span>601 949 472</span>
                        </a>
                    </div>
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="footer-contact-item">
                        <IconBxlFacebookSquare className="footer-icon" />
                        <span>Facebook</span>
                    </a>
                </div>
            </div>
            <div className="footer-middle">
                <div className="footer-logo">
                    <img src={process.env.PUBLIC_URL + '/images/logo.png'} alt="Логотип" />
                </div>
                <nav className="footer-nav">
                    <li><Link to="/start" onClick={scrollToTop}>{t('menu.start')}</Link></li>
                    <li><Link to="/team" onClick={scrollToTop}>{t('menu.team')}</Link></li>
                    <li><Link to="/how-we-work" onClick={scrollToTop}>{t('menu.howWeWork')}</Link></li>
                    <li><Link to="/price" onClick={scrollToTop}>{t('menu.price')}</Link></li>
                    <li><Link to="/offer" onClick={scrollToTop}>{t('menu.offer')}</Link></li>
                    <li><Link to="/contact" onClick={scrollToTop}>{t('menu.contact')}</Link></li>
                    <li><Link to="/reviews" onClick={scrollToTop}>{t('menu.reviews')}</Link></li>
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
