import React from 'react';
import AddReview from './AddReview';
import { useTranslation } from 'react-i18next';
import StarRatings from 'react-star-ratings';
import './ReviewsPage.css';
import './AddReview.css';

const ReviewsPage = ({ specialists, addReview, reviews }) => {
  const { t } = useTranslation();

  // Сортировка отзывов по убыванию даты добавления (предполагается, что отзывы имеют поле `date`)
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="reviews-page">
      <AddReview specialists={specialists} addReview={addReview} />
      <div className="reviews-list">
        <h1>{t('reviews.title')}</h1>
        {sortedReviews.map((review, index) => (
          <div key={index} className="review">
            <h3>{specialists.find(spec => spec.id === review.specialistId)?.name || review.specialistName}</h3>
            <p><strong>{review.name} {review.lastName[0]}.</strong></p>
            <StarRatings
              rating={review.rating}
              starRatedColor="blue"
              numberOfStars={5}
              name='rating'
              starDimension="20px"
              starSpacing="2px"
            />
            <p>{review.reviewText}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;
