import React, { useState, useEffect } from 'react';
import './PricePage.css';
import { useTranslation } from 'react-i18next';
import SaveButton from '../../SaveButton/SaveButton';  // Импорт кнопки сохранения

const PricePage = ({ isAdmin }) => {
  const { t } = useTranslation();

  const [prices, setPrices] = useState({
    psychologicalConsultation: '',
    individualPsychotherapy: '',
    interventionConsultationsForCouples: '',
    onlineConsultation: '',
  });

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('http://localhost:3001/prices');
        const data = await response.json();
        setPrices(data);
      } catch (error) {
        console.error(t('prices.updateFailure'), error);
      }
    };

    fetchPrices();
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrices((prevPrices) => ({
      ...prevPrices,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:3001/update-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prices),
      });

      const data = await response.json();
      if (data.success) {
        alert(t('prices.updateSuccess'));
      } else {
        alert(t('prices.updateFailure'));
      }
    } catch (error) {
      console.error(t('prices.updateFailure'), error);
    }
  };

  return (
    <div className="price-page">
      <h1>{t('prices.title')}</h1>
      <table className="price-table">
        <thead>
          <tr>
            <th>{t('prices.service')}</th>
            <th>{t('prices.price')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{t('prices.psychologicalConsultation')}</td>
            <td>
              {isAdmin ? (
                <input
                  type="text"
                  name="psychologicalConsultation"
                  value={prices.psychologicalConsultation || ''}
                  onChange={handleChange}
                />
              ) : (
                prices.psychologicalConsultation || ''
              )}
            </td>
          </tr>
          <tr>
            <td>{t('prices.individualPsychotherapy')}</td>
            <td>
              {isAdmin ? (
                <input
                  type="text"
                  name="individualPsychotherapy"
                  value={prices.individualPsychotherapy || ''}
                  onChange={handleChange}
                />
              ) : (
                prices.individualPsychotherapy || ''
              )}
            </td>
          </tr>
          <tr>
            <td>{t('prices.interventionConsultationsForCouples')}</td>
            <td>
              {isAdmin ? (
                <input
                  type="text"
                  name="interventionConsultationsForCouples"
                  value={prices.interventionConsultationsForCouples || ''}
                  onChange={handleChange}
                />
              ) : (
                prices.interventionConsultationsForCouples || ''
              )}
            </td>
          </tr>
          <tr>
            <td>{t('prices.onlineConsultation')}</td>
            <td>
              {isAdmin ? (
                <input
                  type="text"
                  name="onlineConsultation"
                  value={prices.onlineConsultation || ''}
                  onChange={handleChange}
                />
              ) : (
                prices.onlineConsultation || ''
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {isAdmin && <SaveButton onClick={handleSave} />}
    </div>
  );
};

export default PricePage;
