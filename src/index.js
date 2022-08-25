import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { StoriesProvider } from './context/StoriesContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StoriesProvider>
    <UserProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </UserProvider>
  </StoriesProvider>
);


