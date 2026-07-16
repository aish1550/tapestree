'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#FAF6EE', // Soft Cream background
      paper: '#FFFFFF',   // Solid White panels/cards
    },
    primary: {
      main: '#1E3F20',    // Forest Green active accent
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#1E2522', // Dark slate charcoal
      secondary: '#6E7672',
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), sans-serif',
    h1: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: 700,
    },
    h6: {
      fontFamily: 'var(--font-montserrat), sans-serif',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
        },
      },
    },
  },
});

export default theme;
