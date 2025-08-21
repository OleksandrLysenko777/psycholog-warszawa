import React, { useState, useEffect, useRef } from 'react';
import AddReview from './AddReview';
import { useTranslation } from 'react-i18next';
import StarRatings from 'react-star-ratings';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import './ReviewsPage.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

const ReviewsPage = ({ specialists, isAdmin, addReview }) => {
  const { t } = useTranslation();
  const [localReviews, setLocalReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // держим сокет в ref, чтобы не пересоздавать на каждый рендер
  const socketRef = useRef(null);

  // Инициализация сокета + подписки
  useEffect(() => {
    const token = localStorage.getItem('authToken') || null;

    // создаём новое соединение (с токеном, если есть)
    socketRef.current = io(API_BASE, {
      auth: token ? { token } : {}, // сервер вытащит из handshake.auth.token
    });

    const socket = socketRef.current;

    // новые отзывы
    socket.on('new_review', (newReview) => {
      setLocalReviews((prev) => [newReview, ...prev]);
      addReview?.(newReview);
    });

    // удаление отзывов
    socket.on('review_deleted', (deletedReviewId) => {
      setLocalReviews((prev) => prev.filter((r) => r.id !== deletedReviewId));
    });

    return () => {
      if (!socket) return;
      socket.off('new_review');
      socket.off('review_deleted');
      socket.disconnect(); // корректно закрываем
    };
    // Пересоздаём соединение, если статус админа меняется (например, после логина)
  }, [isAdmin, addReview]);

  // Первичная загрузка отзывов
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE}/reviews`);
        const data = await res.json();
        setLocalReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(t('reviews.updateFailure'), error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [t]);

  // Скролл к конкретному отзыву по хэшу
  useEffect(() => {
    if (isLoading) return;
    const hash = location.hash;
    if (hash && hash.startsWith('#review-')) {
      const reviewElement = document.querySelector(hash);
      const list = document.querySelector('.reviews-list');
      if (reviewElement && list) {
        setTimeout(() => {
          const offset = reviewElement.offsetTop - list.offsetTop;
          list.scrollTo({ top: offset - 20, behavior: 'smooth' });
        }, 300);
      }
    }
  }, [location, isLoading]);

  const handleReviewAdded = (newReview) => {
    setLocalReviews((prev) => [newReview, ...prev]);
  };

  const handleDeleteReview = (reviewId) => {
    // Токен уже передан при коннекте; сервер проверит право админа в io.use(...)
    socketRef.current?.emit('delete_review', reviewId);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
  };

  const sortedReviews = [...localReviews].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="reviews-page">
      <AddReview specialists={specialists} onReviewAdded={handleReviewAdded} />

      <div className="reviews-list">
        <h1>{t('reviews.title')}</h1>

        {sortedReviews.map((review) => (
          <div key={review.id} id={`review-${review.id}`} className="review">
            <div className="review-header">
              <h3>
                {specialists.find((s) => s.id === review.specialistId)?.name ||
                  review.specialistName}
              </h3>

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

            <p>
              <strong>{review.name}</strong>
            </p>
            <p>{review.reviewText}</p>
            <p className="review-date">{formatDate(review.date)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;
