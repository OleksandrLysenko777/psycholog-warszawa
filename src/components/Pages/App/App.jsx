import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from '../Header/Header';
import StartPage from '../StartPage/StartPage';
import TeamPage from '../TeamPage/TeamPage';
import HowWeWorkPage from '../HowWeWorkPage/HowWeWorkPage';
import PricePage from '../PricePage';
import OfferPage from '../OfferPage';
import ContactPage from '../ContactPage/ContactPage';
import ReviewsPage from '../ReviewsPage/ReviewsPage';

function App() {
  const [reviews, setReviews] = useState([]);

  const addReview = (review) => {
    setReviews([...reviews, review]);
  };

  const specialists = [
    { id: 'natalia', name: 'Natalia Basko' },
    { id: 'sebastian', name: 'Sebastian Chmieliński' },
  ];

  return (
    <Router basename="/psycholog-warszawa">
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/start" />} />
          <Route path="/start" element={<StartPage reviews={reviews} specialists={specialists} />} />
          <Route path="/team" element={<TeamPage reviews={reviews} />} />
          <Route path="/how-we-work" element={<HowWeWorkPage />} />
          <Route path="/price" element={<PricePage />} />
          <Route path="/offer" element={<OfferPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/reviews" element={<ReviewsPage specialists={specialists} addReview={addReview} reviews={reviews} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
