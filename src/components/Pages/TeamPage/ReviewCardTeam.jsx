import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import ReactStars from 'react-rating-stars-component';
import { useTranslation } from 'react-i18next';
import './ReviewCardTeam.css';

const ReviewCardTeam = ({ review }) => {
  const { t } = useTranslation();

  const name = review?.name || t('reviews.anonymous') || 'Anonymous';
  const text = review?.reviewText || '';
  const rating = Number(review?.rating) || 0;
  const reviewId = review?.id ?? '';

  return (
    <div className="review-card-team">
      <div className="review-header-team">
        <p><strong>{name}</strong></p>
        <ReactStars
          count={5}
          value={rating}
          edit={false}
          size={20}
          activeColor="#ffd700"
        />
      </div>

      <p className="review-text-team">{text}</p>

      <div className="read-more-team">
        {/* передаём id через state, без якорного автоскролла */}
        <Link to="/reviews" state={{ reviewId }}>
          {t('reviews.readMore')}
        </Link>
      </div>
    </div>
  );
};

export default memo(ReviewCardTeam);
