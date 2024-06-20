import React from 'react';
import { useTranslation } from 'react-i18next';
import './StartPage.css';

const StartPage = () => {
  const { t } = useTranslation();

  const sections = [
    { id: 'section1', title: t('start.sections.section1.title'), content: t('start.sections.section1.content') },
    { id: 'section2', title: t('start.sections.section2.title'), content: t('start.sections.section2.content') },
    { id: 'section3', title: t('start.sections.section3.title'), content: t('start.sections.section3.content') },
    { id: 'section4', title: t('start.sections.section4.title'), content: t('start.sections.section4.content') },
    { id: 'section5', title: t('start.sections.section5.title'), content: t('start.sections.section5.content') },
    { id: 'section6', title: t('start.sections.section6.title'), content: t('start.sections.section6.content') },
    { id: 'section7', title: t('start.sections.section7.title'), content: t('start.sections.section7.content') },
    
  ];

  return (
    <div className="start-page">
      
      <div className="subheader">
        <h2>{t('start.text0')}</h2>
      </div>
      <div className="subheader">
        <h2>{t('start.text1')}</h2>
      </div>
      <div className="content">
        {sections.map((section) => (
          <section key={section.id} className="section">
            <h2>{section.title}</h2>
            <p>{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default StartPage;
