import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import StartPage from '../StartPage/StartPage';
import TeamPage from '../TeamPage/TeamPage';
import HowWeWorkPage from '../HowWeWorkPage/HowWeWorkPage';
import PricePage from '../PricePage/PricePage';
import OfferPage from '../OfferPage/OfferPage';
import ContactPage from '../ContactPage/ContactPage';
import ReviewsPage from '../ReviewsPage/ReviewsPage';
import AdminLogin from '../AdminLogin/AdminLogin';

// ===== helpers =====
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function isTokenValid(token) {
  const payload = parseJwt(token);
  if (!payload?.exp) return false;
  return Date.now() < payload.exp * 1000; // exp в секундах
}

// ВАЖНО: вынесли константу за пределы компонента
const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 минут

function App() {
  const [reviews, setReviews] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const logoutTimerRef = useRef(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    setIsAdmin(false);
    clearTimeout(logoutTimerRef.current);
  }, []);

  const startLogoutTimer = useCallback(() => {
    clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = setTimeout(handleLogout, TIMEOUT_DURATION);
  }, [handleLogout]); // TIMEOUT_DURATION вне компонента — в deps не нужен

  const resetTimer = useCallback(() => {
    if (isAdmin) startLogoutTimer();
  }, [isAdmin, startLogoutTimer]);

  // Админ-состояние из JWT на старте
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && isTokenValid(token)) {
      setIsAdmin(true);
      startLogoutTimer();
    } else {
      localStorage.removeItem('authToken');
      setIsAdmin(false);
    }
  }, [startLogoutTimer]);

  // Синхронизация между вкладками (login/logout)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'authToken') {
        const token = e.newValue;
        if (token && isTokenValid(token)) {
          setIsAdmin(true);
          startLogoutTimer();
        } else {
          setIsAdmin(false);
          clearTimeout(logoutTimerRef.current);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [startLogoutTimer]);

  // Слушатели активности
  useEffect(() => {
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [resetTimer]);

  // Отзывы
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('http://localhost:3001/reviews');
        const data = await r.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Ошибка при загрузке отзывов:', e);
      }
    })();
  }, []);

  const addReview = (review) => setReviews(prev => [...prev, review]);
  const deleteReview = (index) => setReviews(prev => prev.filter((_, i) => i !== index));

  // вызывается после успешной верификации в AdminLogin (токен уже сохранён)
  const handleLogin = () => {
    const token = localStorage.getItem('authToken');
    setIsAdmin(!!token && isTokenValid(token));
    startLogoutTimer();
  };

  const specialists = [
    { id: 'natalia', name: 'Nataliya Basko' },
    { id: 'sebastian', name: 'Sebastian Chmieliński', hiddenInReviewForm: true },
  ];

  return (
    <Router basename="/psycholog-warszawa">
      <div className="page-container">
        <Header isAdmin={isAdmin} onLogout={handleLogout} />
        <div className="content-wrap">
          <Routes>
            <Route path="/" element={<Navigate to="/start" />} />
            <Route
              path="/start"
              element={
                <StartPage
                  reviews={reviews}
                  isAdmin={isAdmin}
                  specialists={specialists}
                  addReview={addReview}
                />
              }
            />
            <Route path="/team" element={<TeamPage reviews={reviews} isAdmin={isAdmin} addReview={addReview} />} />
            <Route path="/how-we-work" element={<HowWeWorkPage />} />
            <Route path="/price" element={<PricePage isAdmin={isAdmin} />} />
            <Route path="/offer" element={<OfferPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/reviews"
              element={
                <ReviewsPage
                  specialists={specialists}
                  addReview={addReview}
                  deleteReview={deleteReview}
                  reviews={reviews}
                  isAdmin={isAdmin}
                />
              }
            />
            <Route path="/admin-login" element={<AdminLogin onLogin={handleLogin} />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
