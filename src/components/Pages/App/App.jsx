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


function App() {
  const [reviews, setReviews] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // Состояние для отслеживания логина администратора
  const logoutTimerRef = useRef(null); // Ссылка для отслеживания таймера
  const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 минут

  // Функция для начала таймера выхода, обернута в useCallback
  const startLogoutTimer = useCallback(() => {
    clearTimeout(logoutTimerRef.current); // Очищаем предыдущий таймер
    logoutTimerRef.current = setTimeout(() => {
      handleLogout(); // Автоматический logout через 15 минут
    }, TIMEOUT_DURATION);
  }, [TIMEOUT_DURATION]);

  // Обработчики событий активности пользователя, обернуты в useCallback
  const resetTimer = useCallback(() => {
    if (isAdmin) {
      startLogoutTimer(); // Сбрасываем таймер при активности
    }
  }, [isAdmin, startLogoutTimer]);

  // Проверка состояния входа при первой загрузке
  useEffect(() => {
    const storedAdminStatus = localStorage.getItem('isAdmin');
    if (storedAdminStatus === 'true') {
      setIsAdmin(true);
      startLogoutTimer(); // Запускаем таймер при загрузке, если админ залогинен
    }
  }, [startLogoutTimer]);

  useEffect(() => {
    // Слушаем события активности пользователя
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    return () => {
      // Очищаем слушатели при размонтировании компонента
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [resetTimer]);

  // Загрузка отзывов с сервера при монтировании компонента
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:3001/reviews');
        const data = await response.json();
        setReviews(data); // Установка полученных отзывов в состояние
      } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
      }
    };

    fetchReviews();
  }, []);

  const addReview = (review) => {
    setReviews([...reviews, review]);
  };

  const deleteReview = (index) => {
    const updatedReviews = reviews.filter((_, i) => i !== index);
    setReviews(updatedReviews);
  };

  const handleLogin = () => {
    setIsAdmin(true);
    localStorage.setItem('isAdmin', 'true'); // Сохранение состояния в localStorage
    startLogoutTimer(); // Запускаем таймер после логина
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin'); // Удаление состояния из localStorage
    clearTimeout(logoutTimerRef.current); // Очищаем таймер при выходе
  };

  const specialists = [
    { id: 'natalia', name: 'Natalia Basko' },
    { id: 'sebastian', name: 'Sebastian Chmieliński' },
  ];

  return (
    <Router basename="/psycholog-warszawa">
      <div className="page-container">
        <Header isAdmin={isAdmin} onLogout={handleLogout} />  {/* Передаем состояние и функцию выхода */}
        <div className="content-wrap">
          <Routes>
            <Route path="/" element={<Navigate to="/start" />} />
            <Route path="/start" element={<StartPage reviews={reviews} specialists={specialists} addReview={addReview}/>} />
            <Route path="/team" element={<TeamPage reviews={reviews} isAdmin={isAdmin} addReview={addReview}/>} />
            <Route path="/how-we-work" element={<HowWeWorkPage />} />
            <Route path="/price" element={<PricePage isAdmin={isAdmin} />} />
            <Route path="/offer" element={<OfferPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route 
              path="/reviews" 
              element={<ReviewsPage 
                specialists={specialists} 
                addReview={addReview} 
                deleteReview={deleteReview} 
                reviews={reviews} 
                isAdmin={isAdmin} 
              />} 
            />
            <Route 
              path="/admin-login" 
              element={<AdminLogin onLogin={handleLogin} />} 
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
