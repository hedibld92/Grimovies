import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Définition des thèmes
export const themes = {
  dark: {
    PRIMARY: '#E50914',        // Rouge Netflix
    SECONDARY: '#221F1F',      // Noir foncé
    BACKGROUND: '#141414',     // Noir de fond
    CARD_BG: '#2F2F2F',       // Gris foncé pour les cartes
    SURFACE: '#1F1F1F',       // Surface pour les éléments
    TEXT_PRIMARY: '#FFFFFF',   // Blanc pour le texte principal
    TEXT_SECONDARY: '#B3B3B3', // Gris pour le texte secondaire
    BORDER: '#333333',         // Bordures
    ACCENT: '#FFD700',         // Or pour les étoiles/notes
    SUCCESS: '#46D369',        // Vert pour les succès
    WARNING: '#FF9500',        // Orange pour les avertissements
    ERROR: '#FF375F',          // Rouge pour les erreurs
    SHADOW: 'rgba(0, 0, 0, 0.3)',
    OVERLAY: 'rgba(0, 0, 0, 0.7)',
  },
  light: {
    PRIMARY: '#E50914',        // Rouge Netflix (reste identique)
    SECONDARY: '#F5F5F5',      // Gris très clair
    BACKGROUND: '#FFFFFF',     // Blanc de fond
    CARD_BG: '#F8F9FA',       // Gris très clair pour les cartes
    SURFACE: '#FFFFFF',        // Surface blanche
    TEXT_PRIMARY: '#212529',   // Noir pour le texte principal
    TEXT_SECONDARY: '#6C757D', // Gris pour le texte secondaire
    BORDER: '#DEE2E6',         // Bordures claires
    ACCENT: '#FFC107',         // Jaune pour les étoiles/notes
    SUCCESS: '#28A745',        // Vert pour les succès
    WARNING: '#FD7E14',        // Orange pour les avertissements
    ERROR: '#DC3545',          // Rouge pour les erreurs
    SHADOW: 'rgba(0, 0, 0, 0.1)',
    OVERLAY: 'rgba(0, 0, 0, 0.5)',
  }
};

// Context pour le thème
const ThemeContext = createContext();

// Provider du thème
export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Dark par défaut
  const [loading, setLoading] = useState(true);

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du thème:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
      console.log('🎨 Thème changé vers:', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du thème:', error);
    }
  };

  const setTheme = async (themeName) => {
    try {
      const newIsDark = themeName === 'dark';
      setIsDark(newIsDark);
      await AsyncStorage.setItem('theme', themeName);
      console.log('🎨 Thème défini sur:', themeName);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du thème:', error);
    }
  };

  const currentTheme = isDark ? themes.dark : themes.light;

  const value = {
    isDark,
    theme: currentTheme,
    toggleTheme,
    setTheme,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook pour utiliser le thème
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  }
  
  return context;
};

// Hook pour obtenir les couleurs actuelles (compatible avec l'ancien système)
export const useColors = () => {
  const { theme } = useTheme();
  return theme;
}; 