import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from 'notistack';
import axios from 'axios';

// Configure axios baseURL based on environment
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5555';
axios.defaults.baseURL = baseURL;

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <React.StrictMode>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </React.StrictMode>
  </BrowserRouter>
);
