import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#c9c9c9ff' },
  },
});
createRoot(document.getElementById('root')).render(
    <StrictMode>
    <ThemeProvider theme={theme}>
        <App />
    </ThemeProvider>
  </StrictMode>
)
