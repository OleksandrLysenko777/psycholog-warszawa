import React, { useState, useEffect } from 'react';
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
  const [isAdmin, setIsAdmin] = useState(false);  // Состояние для отслеживания логина администратора

  // Загрузка отзывов с сервера при монтировании компонента
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:3001/reviews');
        const data = await response.json();
        setReviews(data);  // Установка полученных отзывов в состояние
      } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
      }
    };

    fetchReviews();
  }, []); // Пустой массив зависимостей означает, что этот эффект выполнится один раз при монтировании

  const addReview = (review) => {
    setReviews([...reviews, review]);
  };

  const deleteReview = (index) => {
    const updatedReviews = reviews.filter((_, i) => i !== index);
    setReviews(updatedReviews);
  };

  const handleLogin = () => {
    setIsAdmin(true);  // Логиним администратора
  };

  const handleLogout = () => {
    setIsAdmin(false);  // Выходим из системы
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
            <Route path="/start" element={<StartPage reviews={reviews} specialists={specialists} />} />
            <Route path="/team" element={<TeamPage reviews={reviews} isAdmin={isAdmin}/>} />
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
