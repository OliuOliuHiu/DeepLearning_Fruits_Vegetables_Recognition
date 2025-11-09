import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { ThemeProvider } from './contexts/ThemeContext';

export function AppRouter() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
}