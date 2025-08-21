import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactStars from 'react-rating-stars-component';
import { useTranslation } from 'react-i18next';
import './ReviewCardTeam.css';

const ReviewCardTeam = ({ review }) => {
  const { t } = useTranslation();

  // Безопасные значения
  const name = review?.name || t('reviews.anonymous') || 'Anonymous';
  const text = review?.reviewText || '';
  const rating = Number(review?.rating) || 0;

  // Якорная ссылка вида /reviews#review-<id>
  const reviewLink = useMemo(() => {
    const id = review?.id ?? '';
    return `/reviews#review-${id}`;
  }, [review?.id]);

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
        <Link to={reviewLink}>{t('reviews.readMore')}</Link>
      </div>
    </div>
  );
};

export default memo(ReviewCardTeam);
