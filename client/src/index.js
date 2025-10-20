import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Modal from 'react-modal';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

console.log('LIVE_MARK', new Date().toISOString());

const theme = createTheme({ palette: { mode: 'dark' } });

Modal.setAppElement('#root');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
