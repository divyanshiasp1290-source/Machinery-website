import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { businessHours } from './config/businessHours';

if (typeof window !== 'undefined') {
  window.businessHours = businessHours;
  window.businessHoursConfig = businessHours;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
