import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // <--- 여기가 <App /> 이어야 합니다.
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
// …