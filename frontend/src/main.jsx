// src/main.jsx   (or index.jsx, whatever your Vite/CRA entry is)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';        // <-- the palette you defined
import App from './App.jsx';

import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />         {/* MUI reset + background.default */}
      <App />
    </ThemeProvider>
  </StrictMode>
);
