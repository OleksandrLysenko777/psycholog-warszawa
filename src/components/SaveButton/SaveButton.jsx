import React from 'react';
import { useTranslation } from 'react-i18next';
import './SaveButton.css';

const SaveButton = ({ onClick, disabled }) => {
  const { t } = useTranslation();

  return (
    <button 
      onClick={onClick} 
      className="save-button" 
      disabled={disabled}
    >
      {t('saveButton')}
    </button>
  );
};

export default SaveButton;
