import React, { useState, useEffect } from 'react';
import AddReview from './AddReview';
import { useTranslation } from 'react-i18next';
import StarRatings from 'react-star-ratings';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client'; 
import './ReviewsPage.css';

const socket = io('http://localhost:3001');

const ReviewsPage = ({ specialists, isAdmin, addReview }) => {
  const { t } = useTranslation();
  const [localReviews, setLocalReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:3001/reviews');
        const data = await response.json();
        setLocalReviews(Array.isArray(data) ? data : []);
        setIsLoading(false);
      } catch (error) {
        console.error(t('reviews.updateFailure'), error);
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [t]);

  useEffect(() => {
    // Обработка события добавления и удаления отзывов через WebSocket
    socket.on('new_review', (newReview) => {
      console.log('Новый отзыв получен через WebSocket:', newReview);
      setLocalReviews((prevReviews) => [newReview, ...prevReviews]);
      addReview(newReview);
    });

    socket.on('review_deleted', (deletedReviewId) => {
      console.log('Получен отзыв для удаления через WebSocket:', deletedReviewId);
      setLocalReviews((prevReviews) => prevReviews.filter((review) => review.id !== deletedReviewId));
    });

    return () => {
      socket.off('new_review');
      socket.off('review_deleted');
    };
  }, [addReview]);

  useEffect(() => {
    if (!isLoading) {
      const hash = location.hash;
      if (hash && hash.startsWith('#review-')) {
        const reviewElement = document.querySelector(hash);
        const reviewsContainer = document.querySelector('.reviews-list');
        if (reviewElement && reviewsContainer) {
          setTimeout(() => {
            const reviewOffset = reviewElement.offsetTop - reviewsContainer.offsetTop;
            reviewsContainer.scrollTo({
              top: reviewOffset - 20,
              behavior: 'smooth',
            });
          }, 300);
        }
      }
    }
  }, [location, isLoading]);

  const handleReviewAdded = (newReview) => {
    setLocalReviews(prevReviews => [newReview, ...prevReviews]);
  };

  const handleDeleteReview = (reviewId) => {
    console.log('Отправка события удаления через WebSocket:', reviewId);
    socket.emit('delete_review', reviewId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const sortedReviews = [...localReviews].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="reviews-page">
      <AddReview specialists={specialists} onReviewAdded={handleReviewAdded} />
      <div className="reviews-list">
        <h1>{t('reviews.title')}</h1>
       {sortedReviews.map((review, index) => (
          <div key={review.id} id={`review-${review.id}`} className="review">
            <div className="review-header">
              <h3>{specialists.find(spec => spec.id === review.specialistId)?.name || review.specialistName}</h3>
              <StarRatings
                rating={review.rating}
                starRatedColor="#ffd700"
                numberOfStars={5}
                name="rating"
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
            <p className="review-date">{formatDate(review.date)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;
