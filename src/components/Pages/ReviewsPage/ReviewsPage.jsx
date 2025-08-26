import React, { useState, useEffect, useRef } from 'react';
import AddReview from './AddReview';
import { useTranslation } from 'react-i18next';
import StarRatings from 'react-star-ratings';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './ReviewsPage.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';


const ReviewsPage = ({ specialists, isAdmin, addReview }) => {
  const { t } = useTranslation();
  const [localReviews, setLocalReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const scrolledOnceRef = useRef(false);

  // не восстанавливать прошлую позицию прокрутки браузером
  useEffect(() => {
    let prev;
    if ('scrollRestoration' in window.history) {
      prev = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
    }
    return () => {
      if (prev !== undefined) window.history.scrollRestoration = prev;
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken') || null;
    socketRef.current = io(API_BASE, { auth: token ? { token } : {} });
    const socket = socketRef.current;

    socket.on('new_review', (newReview) => {
      setLocalReviews((prev) => [newReview, ...prev]);
      addReview?.(newReview);
    });
    socket.on('review_deleted', (deletedReviewId) => {
      setLocalReviews((prev) => prev.filter((r) => r.id !== deletedReviewId));
    });

    return () => {
      socket.off('new_review');
      socket.off('review_deleted');
      socket.disconnect();
    };
  }, [isAdmin, addReview]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/reviews`);
        const data = await res.json();
        setLocalReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(t('reviews.updateFailure'), error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [t]);

  // ---- АВТОСКРОЛЛ: сперва окно к .reviews-list, затем внутри списка к отзыву ----
  // ---- АВТОСКРОЛЛ: окно -> контейнер, контейнер -> отзыв, затем финальное выравнивание окна ----
// ---- АВТОСКРОЛЛ: только scrollIntoView + CSS scroll-margin-top ----
useEffect(() => {
  if (isLoading || scrolledOnceRef.current) return;

  const stateId = location.state?.reviewId;
  let targetId = stateId;

  // фолбэк для /reviews#review-123
  if (!targetId && location.hash?.startsWith('#review-')) {
    targetId = location.hash.replace('#review-', '');
  }
  if (!targetId) return;

  let tries = 0;
  const MAX_TRIES = 25;      // ~1 сек
  const TICK_MS   = 40;

  const tick = () => {
    const el = document.getElementById(`review-${targetId}`);
    if (el) {
      // ключевой момент: элемент сам приводит себя «в видимость»
      el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });

      scrolledOnceRef.current = true;

      // очистим state, чтобы при возвращении не автоскроллило снова
      if (stateId) {
        navigate(location.pathname, { replace: true, state: null });
      }
      return;
    }
    if (tries++ < MAX_TRIES) setTimeout(tick, TICK_MS);
  };

  tick();
}, [isLoading, location.state, location.hash, location.pathname, navigate]);



  const handleReviewAdded = (newReview) => {
    setLocalReviews((prev) => [newReview, ...prev]);
  };

  const handleDeleteReview = (reviewId) => {
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
