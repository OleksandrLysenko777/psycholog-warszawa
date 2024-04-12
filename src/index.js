import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../src/components/App'; 
import './locales/i18n'; 

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement); 
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);