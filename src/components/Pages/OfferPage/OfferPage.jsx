import React from 'react';
import './OfferPage.css';
import { useTranslation } from 'react-i18next';

const OfferPage = () => {
  const { t } = useTranslation();

  return (
    <div className="offer-page">
      <h1>{t('offer.title')}</h1>      

      <section className="individual-psychotherapy">
        <h2>{t('offer.individualPsychotherapy.title')}</h2>
        <p>{t('offer.individualPsychotherapy.content1')}</p>
        <p>{t('offer.individualPsychotherapy.content2')}</p>
      </section>

      <section className="adolescent-therapy">
        <h2>{t('offer.adolescentTherapy.title')}</h2>
        <p>{t('offer.adolescentTherapy.content1')}</p>
      </section>

      <section className="meeting-guidelines">
        <h2>{t('offer.meetingGuidelines.title')}</h2>
        <p>{t('offer.meetingGuidelines.content1')}</p>
        <p>{t('offer.meetingGuidelines.content2')}</p>
        <p>{t('offer.meetingGuidelines.content3')}</p>
      </section>

      <section className="crisis-intervention">
        <h2>{t('offer.crisisIntervention.title')}</h2>
        <p>{t('offer.crisisIntervention.content1')}</p>
        <p>{t('offer.crisisIntervention.content2')}</p>
      </section>

      <section className="cancellation-policy">
        <h2>{t('offer.cancellationPolicy.title')}</h2>
        <p>{t('offer.cancellationPolicy.content1')}</p>
        <p>{t('offer.cancellationPolicy.content2')}</p>
      </section>

      <section className="work-psychology">
        <h2>{t('offer.workPsychology.title')}</h2>
        <p>{t('offer.workPsychology.description')}</p>
      </section>

       <section className="group-therapy">
        <h2>{t('offer.groupTherapy.title')}</h2>
        <p>{t('offer.groupTherapy.description')}</p>
      </section>
    </div>
  );
};

export default OfferPage;
