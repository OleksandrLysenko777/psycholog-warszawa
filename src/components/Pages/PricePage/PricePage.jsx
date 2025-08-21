import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PricePage.css';
import { useTranslation } from 'react-i18next';
import SaveButton from '../../SaveButton/SaveButton';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

const PricePage = ({ isAdmin }) => {
  const { t } = useTranslation();

  const [prices, setPrices] = useState({
    psychologicalConsultation: '',
    individualPsychotherapy: '',
    interventionConsultationsForCouples: '',
    onlineConsultation: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/prices`);
        // data ожидается объектом вида { key: value }
        if (data && typeof data === 'object') {
          setPrices(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error(t('prices.updateFailure'), error);
      }
    };
    fetchPrices();
  }, [t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrices(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert(t('common.authRequired') || 'Требуется авторизация. Войдите как админ.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await axios.post(`${API_BASE}/update-prices`, prices, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (data?.success) {
        alert(t('prices.updateSuccess'));
      } else {
        alert(t('prices.updateFailure'));
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        alert(t('common.authExpired') || 'Сессия истекла. Войдите снова.');
      } else {
        console.error(t('prices.updateFailure'), error);
        alert(t('prices.updateFailure'));
      }
    } finally {
      setSaving(false);
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

      {isAdmin && (
        <SaveButton onClick={handleSave} disabled={saving} title={saving ? t('common.saving') || 'Сохранение…' : undefined} />
      )}
    </div>
  );
};

export default PricePage;
