import React, { useState } from 'react';
import ReactStars from 'react-rating-stars-component';
import { useTranslation } from 'react-i18next';
import './AddReview.css';

const AddReview = ({ specialists, addReview }) => {
  const { t } = useTranslation();
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [name, setName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [ratingKey, setRatingKey] = useState(Date.now()); 
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (rating === 0) {
      setError(t('reviews.errorNoRating'));
      return;
    }
    if (!selectedSpecialist || !name || !reviewText) {
      setError(t('reviews.errorIncomplete'));
      return;
    }
    addReview({
      specialistId: selectedSpecialist,
      name,
      reviewText,
      rating,
      date: new Date().toISOString(), 
    });
    setSelectedSpecialist('');
    setName('');
    setReviewText('');
    setRating(0); 
    setRatingKey(Date.now()); 
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="add-review">
      <h2>{t('reviews.addTitle')}</h2>
      <div className="form-group">
        <label htmlFor="specialist">{t('reviews.selectSpecialist')}</label>
        <select
          id="specialist"
          value={selectedSpecialist}
          onChange={e => setSelectedSpecialist(e.target.value)}
        >
          <option value="">{t('reviews.selectSpecialist')}</option>
          {specialists.map((specialist, index) => (
            <option key={index} value={specialist.id}>
              {specialist.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="name">{t('reviews.name')}</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="reviewText">{t('reviews.reviewText')}</label>
        <textarea
          id="reviewText"
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
        ></textarea>
      </div>
      <div className="form-group">
        <label>{t('reviews.rating')}</label>
        <ReactStars
          key={ratingKey}
          count={5}
          value={rating}
          onChange={newRating => setRating(newRating)}
          size={24}
          activeColor="#ffd700"
        />
      </div>
      {error && <p className="error">{error}</p>}
      <button type="submit">{t('reviews.submitButton')}</button>
    </form>
  );
};

export default AddReview;
