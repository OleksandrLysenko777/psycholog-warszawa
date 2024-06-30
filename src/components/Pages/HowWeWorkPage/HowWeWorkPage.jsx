import React from 'react';
import './HowWeWorkPage.css';
import { useTranslation } from 'react-i18next';

const HowWeWorkPage = () => {
  const { t } = useTranslation();

  return (
    <div className="how-we-work-page">
      <h1>{t('howWeWork.title')}</h1>
      <section className="introduction">
        <p>{t('howWeWork.introduction')}</p>
      </section>
      <section className="therapy-principles">
        <h2>{t('howWeWork.therapyPrinciples.title')}</h2>
        <p>{t('howWeWork.therapyPrinciples.content')}</p>
      </section>
      <section className="goals">
        <h2>{t('howWeWork.goals.title')}</h2>
        <p>{t('howWeWork.goals.content')}</p>
      </section>
      <section className="meeting-rules">
        <h2>{t('howWeWork.meetingRules.title')}</h2>
        <p>{t('howWeWork.meetingRules.content1')}</p>
        <p>{t('howWeWork.meetingRules.content2')}</p>
        <p>{t('howWeWork.meetingRules.content3')}</p>
      </section>
      <section className="confidentiality">
        <h2>{t('howWeWork.confidentiality.title')}</h2>
        <p>{t('howWeWork.confidentiality.content')}</p>
      </section>
      <section className="supervision">
        <h2>{t('howWeWork.supervision.title')}</h2>
        <p>{t('howWeWork.supervision.content1')}</p>
        <p>{t('howWeWork.supervision.content2')}</p>
      </section>
      <section className="cancellation-policy">
        <h2>{t('howWeWork.cancellationPolicy.title')}</h2>
        <p>{t('howWeWork.cancellationPolicy.content1')}</p>
         <p>{t('howWeWork.cancellationPolicy.content2')}</p>
      </section>
    </div>
  );
};

export default HowWeWorkPage;
