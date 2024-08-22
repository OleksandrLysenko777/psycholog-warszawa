import React from 'react';
import AddReview from './AddReview';
import { useTranslation } from 'react-i18next';
import StarRatings from 'react-star-ratings';
import './ReviewsPage.css';
import './AddReview.css';

const ReviewsPage = ({ specialists, addReview, deleteReview, reviews, isAdmin }) => {
  const { t } = useTranslation();
  const sortedReviews = [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="reviews-page">
      <AddReview specialists={specialists} addReview={addReview} />
      <div className="reviews-list">
        <h1>{t('reviews.title')}</h1>
        {sortedReviews.map((review, index) => (
          <div key={index} className="review">
            <div className="review-header">
              <h3>{specialists.find(spec => spec.id === review.specialistId)?.name || review.specialistName}</h3>
              <StarRatings
                rating={review.rating}
                starRatedColor="#ffd700"
                numberOfStars={5}
                name='rating'
                starDimension="20px"
                starSpacing="2px"
              />
              {isAdmin && (
                <button
                  onClick={() => deleteReview(index)}
                  className="delete-review-button"
                >
                  {t('reviews.deleteButton')}
                </button>
              )}
            </div>
            <p><strong>{review.name}</strong></p>
            <p>{review.reviewText}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;
