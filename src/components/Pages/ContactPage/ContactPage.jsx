import React from 'react';
import { useTranslation } from 'react-i18next';
import './ContactPage.css';

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <div className="contact-page">
      <div className="contact-info">
        <h1>{t('contact.title')}</h1>
        <div className="contact-details">
          <p><strong>{t('contact.addressTitle')}:</strong> {t('contact.address')}</p>
          <p><strong>{t('contact.phoneTitle')}:</strong> {t('contact.phone')}</p>
          <p><strong>{t('contact.emailTitle')}:</strong> {t('contact.email')}</p>
         
          <p><strong>{t('contact.hoursTitle')}:</strong> {t('contact.hours')}</p>
        </div>
        <div className="resignation-info">
          <h2>{t('contact.resignationTitle')}</h2>
          <p>{t('contact.resignationText1')}</p>
          
        </div>
      </div>
      <div className="map-container">
        <iframe
          title="Google Map of Aleja Stanów Zjednoczonych 51, Warszawa"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2444.6733531386058!2d21.1860303120842!3d52.2129832587982!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ed3a50b2c9c27%3A0xc1fed08185ec83ed!2sCzarno%C5%82%C4%99cka%2026D%2C%2004-740%20Warszawa!5e0!3m2!1sru!2spl!4v1755802082494!5m2!1sru!2spl"
          width="800"
          height="600"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
        ></iframe>
      </div>
    </div>
  );
};

export default ContactPage;
