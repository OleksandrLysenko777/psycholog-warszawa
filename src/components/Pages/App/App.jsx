import React, { useState } from 'react';
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
import AdminDashboard from '../AdminDashboard/AdminDashboard';

function App() {
  const [reviews, setReviews] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); 

  const addReview = (review) => {
    setReviews([...reviews, review]);
  };

  const deleteReview = (index) => {
    const updatedReviews = reviews.filter((_, i) => i !== index);
    setReviews(updatedReviews);
  };

  const handleLogin = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const specialists = [
    { id: 'natalia', name: 'Natalia Basko' },
    { id: 'sebastian', name: 'Sebastian Chmieliński' },
  ];

  return (
    <Router basename="/psycholog-warszawa">
      <div className="page-container">
        <Header isAdmin={isAdmin} onLogout={handleLogout} />
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
            <Route 
              path="/admin-dashboard" 
              element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin-login" />} 
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
