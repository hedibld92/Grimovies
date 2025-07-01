import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/hooks/useAuth';
import { ThemeProvider, useTheme } from './src/hooks/useTheme';
import AppNavigator from './src/navigation/AppNavigator';

// Composant interne pour accéder au thème
const AppContent = () => {
  const { isDark, theme } = useTheme();
  
  return (
    <>
      <AppNavigator />
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={theme.BACKGROUND} />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
