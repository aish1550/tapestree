import React from 'react';
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import '../globals.css';
import '@xyflow/react/dist/style.css';

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Page Not Found</h2>
        <p>We couldn't find the page you were looking for.</p>
        <a href="/" style={{ color: '#1E3F20', fontWeight: 'bold' }}>Go to Home</a>
      </div>
    );
  },
});

function RootComponent() {
  return (
    <RootDocument>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Outlet />
      </ThemeProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Tapestree – Discover Your Family History</title>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
