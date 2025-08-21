import React from 'react';
import { Link } from 'react-router-dom';
import ReactStars from 'react-rating-stars-component';
import { useTranslation } from 'react-i18next';
import './ReviewCard.css';

const ReviewCard = ({ review, specialist }) => {
  const { t } = useTranslation();

  return (
    <div className="review-card">
      <div className="specialist-name">
        <p><strong>{specialist.name}</strong></p>
      </div>
      <div className="review-header">
        <p><strong>{review.name}</strong></p>
        <ReactStars
          count={5}
          value={review.rating}
          edit={false}
          size={20}
          activeColor="#ffd700"
        />
      </div>
      <p>{review.reviewText}</p>
      <div className="read-more">
        <Link to={`/reviews#review-${review.id}`}>{t('reviews.readMore')}</Link>
      </div>
    </div>
  );
};

export default ReviewCard;
