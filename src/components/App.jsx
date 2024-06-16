import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Pages/Header/Header';
import StartPage from './Pages/StartPage/StartPage';
import TeamPage from './Pages/TeamPage/TeamPage';
import HowWeWorkPage from './Pages/HowWeWorkPage';
import PricePage from './Pages/PricePage';
import OfferPage from './Pages/OfferPage';
import ContactPage from './Pages/ContactPage/ContactPage';
import ReviewsPage from './Pages/ReviewsPage/ReviewsPage';


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
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/start" element={<StartPage />} />
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
