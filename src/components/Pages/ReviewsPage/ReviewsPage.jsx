import React, { useState, useEffect } from 'react';
import AddReview from './AddReview';
import { useTranslation } from 'react-i18next';
import StarRatings from 'react-star-ratings';
import './ReviewsPage.css';

const ReviewsPage = ({ specialists, isAdmin }) => {
  const { t } = useTranslation();
  const [localReviews, setLocalReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:3001/reviews');
        const data = await response.json();
        setLocalReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(t('reviews.updateFailure'), error);
      }
    };

    fetchReviews();
  }, [t]);

  const handleReviewAdded = (newReview) => {
    // Добавляем новый отзыв в список отзывов и обновляем состояние
    setLocalReviews(prevReviews => [newReview, ...prevReviews]);
  };

  const handleDeleteReview = (reviewId) => {
    const updatedReviews = localReviews.filter((review) => review.id !== reviewId);
    setLocalReviews(updatedReviews);
    handleSaveChanges(updatedReviews); // Автоматически сохраняем изменения после удаления отзыва
  };

  const handleSaveChanges = async (updatedReviews) => {
    try {
      console.log('Saving reviews:', updatedReviews); // Логирование перед отправкой

      const response = await fetch('http://localhost:3001/update-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviews: updatedReviews }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Server response:', data); // Логирование ответа сервера

      if (data.success) {
        // Обработка успешного сохранения
      } else {
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const sortedReviews = [...localReviews].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="reviews-page">
      <AddReview specialists={specialists} onReviewAdded={handleReviewAdded} />
      <div className="reviews-list">
        <h1>{t('reviews.title')}</h1>
        {sortedReviews.map((review) => (
          <div key={review.id} className="review">
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
                  onClick={() => handleDeleteReview(review.id)}
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
