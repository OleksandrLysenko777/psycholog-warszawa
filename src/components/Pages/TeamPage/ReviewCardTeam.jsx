import React from 'react';
import { Link } from 'react-router-dom';
import ReactStars from 'react-rating-stars-component';
import { useTranslation } from 'react-i18next';
import './ReviewCardTeam.css';

const ReviewCardTeam = ({ review }) => {
  const { t } = useTranslation();

  return (
    <div className="review-card-team">
      <div className="review-header-team">
        <p><strong>{review.name}</strong></p>
        <ReactStars
          count={5}
          value={review.rating}
          edit={false}
          size={20}
          activeColor="#ffd700"
        />
      </div>
      <p className="review-text-team">{review.reviewText}</p>
      <div className="read-more-team">
        {/* Переходим на страницу ReviewsPage с якорем, содержащим префикс "review-" */}
        <Link to={`/reviews#review-${review.id}`}>{t('reviews.readMore')}</Link>
      </div>
    </div>
  );
};

export default ReviewCardTeam;
