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
  const [isLoading, setIsLoading] = useState(true); // Флаг для отслеживания загрузки данных
  const location = useLocation();

  useEffect(() => {
        // Прокрутка страницы к верху при её загрузке
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
        setIsLoading(false); // Данные загружены
      } catch (error) {
        console.error(t('reviews.updateFailure'), error);
        setIsLoading(false); // В случае ошибки также снимаем флаг загрузки
      }
    };

    fetchReviews();
  }, [t]);

 useEffect(() => {
    socket.on('new_review', (newReview) => {
      console.log('Новый отзыв получен через WebSocket:', newReview);
      setLocalReviews((prevReviews) => [newReview, ...prevReviews]);
      addReview(newReview);
    });

    socket.on('review_deleted', (deletedReviewId) => {
      console.log('Отзыв удалён через WebSocket:', deletedReviewId);
      setLocalReviews((prevReviews) => prevReviews.filter((review) => review.id !== deletedReviewId));
    });

    return () => {
      socket.off('new_review');
      socket.off('review_deleted');
    };
  }, [addReview]);


 useEffect(() => {
    // Прокрутка к выбранному отзыву
    if (!isLoading) {
        const hash = location.hash;
        if (hash && hash.startsWith('#review-')) {
            const reviewElement = document.querySelector(hash);
            const reviewsContainer = document.querySelector('.reviews-list'); // Контейнер с отзывами
            if (reviewElement && reviewsContainer) {
                setTimeout(() => {
                    const reviewOffset = reviewElement.offsetTop - reviewsContainer.offsetTop; // Позиция отзыва относительно контейнера
                    reviewsContainer.scrollTo({
                        top: reviewOffset - 20, // Отступ внутри контейнера
                        behavior: 'smooth',
                    });

                    // Проверяем, если элемент находится ниже зоны видимости
                    const reviewRect = reviewElement.getBoundingClientRect();
                    const windowHeight = window.innerHeight;

                    if (reviewRect.bottom > windowHeight) {
                        window.scrollTo({
                            top: window.scrollY + reviewRect.bottom - windowHeight,
                            behavior: 'smooth',
                        });
                    } else if (reviewRect.top < 0) {
                        window.scrollTo({
                            top: window.scrollY + reviewRect.top,
                            behavior: 'smooth',
                        });
                    }

                }, 300); // Добавляем задержку для полной загрузки страницы
            }
        }
    }
}, [location, isLoading]);
  
  const handleReviewAdded = (newReview) => {
    setLocalReviews(prevReviews => [newReview, ...prevReviews]);
  };

  const handleDeleteReview = (reviewId) => {
  const updatedReviews = localReviews.filter((review) => review.id !== reviewId);
  setLocalReviews(updatedReviews);

  // Отправляем событие удаления на сервер
  socket.emit('delete_review', reviewId);

  // Сохраняем изменения на сервере
  handleSaveChanges(updatedReviews);
};

  const handleSaveChanges = async (updatedReviews) => {
    try {
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
      if (!data.success) {
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert(`Error: ${error.message}`);
    }
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
  <div key={`${review.id}-${index}`} id={`review-${review.id}`} className="review">
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
