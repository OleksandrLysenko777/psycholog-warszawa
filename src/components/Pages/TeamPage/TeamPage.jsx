import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Accordion from './Accordion';
import ReactStars from 'react-rating-stars-component';
import './TeamPage.css';

function TeamPage({ reviews }) {
  const { t } = useTranslation();

  const specialists = [
    {
      id: 'natalia',
      name: t('specialist1.name'),
      photo: process.env.PUBLIC_URL + '/images/natalia.jpg',
      description: t('specialist1.description'),
      details: [
        { title: t('specialist1.details.0.title'), content: t('specialist1.details.0.content') },
        { title: t('specialist1.details.1.title'), content: t('specialist1.details.1.content') },
        { title: t('specialist1.details.2.title'), content: t('specialist1.details.2.content') },
        { title: t('specialist1.details.3.title'), content: t('specialist1.details.3.content') },
        { title: t('specialist1.details.4.title'), content: t('specialist1.details.4.content') },
      ],
    },
    {
      id: 'sebastian',
      name: t('specialist2.name'),
      photo: process.env.PUBLIC_URL + '/images/sebastian.jpg',
      description: t('specialist2.description'),
      details: [
        { title: t('specialist2.details.0.title'), content: t('specialist2.details.0.content') },
        { title: t('specialist2.details.1.title'), content: t('specialist2.details.1.content') },
        { title: t('specialist2.details.2.title'), content: t('specialist2.details.2.content') },
        { title: t('specialist2.details.3.title'), content: t('specialist2.details.3.content') },
        { title: t('specialist2.details.4.title'), content: t('specialist2.details.4.content') },
      ],
    },
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const reviewsPerPage = 3;

  const handleNext = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrev = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <div className="team-page">
      {specialists.map((specialist, index) => (
        <div key={index} className="specialist">
          <h2 className="specialist-name">{specialist.name}</h2>
          <div className="specialist-info">
            <img src={specialist.photo} alt={specialist.name} className="specialist-photo" />
            <p className="specialist-description">{specialist.description}</p>
          </div>
          <Accordion items={specialist.details} />
          <div className="specialist-reviews">
            <h3>{t('reviews.title')}</h3>
            <div className="reviews-slider">
              {reviews
                .filter((review) => review.specialistId === specialist.id)
                .slice(currentPage * reviewsPerPage, (currentPage + 1) * reviewsPerPage)
                .map((review, index) => (
                  <div key={index} className="review-card">
                    <p><strong>{review.name} {review.lastName[0]}.</strong></p>
                    <ReactStars
                      count={5}
                      value={review.rating}
                      edit={false}
                      size={24}
                      activeColor="#ffd700"
                    />
                    <p>{review.reviewText}</p>
                  </div>
                ))}
            </div>
            <div className="reviews-navigation">
              <button onClick={handlePrev} disabled={currentPage === 0}>Previous</button>
              <button onClick={handleNext} disabled={(currentPage + 1) * reviewsPerPage >= reviews.length}>Next</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TeamPage;
