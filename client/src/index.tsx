import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Modal from 'react-modal';

console.log('LIVE_MARK', new Date().toISOString());
console.log('Index.tsx loaded successfully');
console.log('Root element:', document.getElementById('root'));

Modal.setAppElement('#root');

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
