// COUCHE PRÉSENTATION — Thème, provider et accès aux couleurs
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const themes = {
  dark: {
    PRIMARY: '#E50914',
    SECONDARY: '#221F1F',
    BACKGROUND: '#141414',
    CARD_BG: '#2F2F2F',
    SURFACE: '#1F1F1F',
    TEXT_PRIMARY: '#FFFFFF',
    TEXT_SECONDARY: '#B3B3B3',
    BORDER: '#333333',
    ACCENT: '#FFD700',
    SUCCESS: '#46D369',
    WARNING: '#FF9500',
    ERROR: '#FF375F',
    SHADOW: 'rgba(0, 0, 0, 0.3)',
    OVERLAY: 'rgba(0, 0, 0, 0.7)',
  },
  light: {
    PRIMARY: '#E50914',
    SECONDARY: '#F5F5F5',
    BACKGROUND: '#FFFFFF',
    CARD_BG: '#F8F9FA',
    SURFACE: '#FFFFFF',
    TEXT_PRIMARY: '#212529',
    TEXT_SECONDARY: '#6C757D',
    BORDER: '#DEE2E6',
    ACCENT: '#FFC107',
    SUCCESS: '#28A745',
    WARNING: '#FD7E14',
    ERROR: '#DC3545',
    SHADOW: 'rgba(0, 0, 0, 0.1)',
    OVERLAY: 'rgba(0, 0, 0, 0.5)',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(true);

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
      console.error('Erreur lors du chargement du thème:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème:', error);
    }
  };

  const setTheme = async (themeName) => {
    try {
      const newIsDark = themeName === 'dark';
      setIsDark(newIsDark);
      await AsyncStorage.setItem('theme', themeName);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème:', error);
    }
  };

  const currentTheme = isDark ? themes.dark : themes.light;

  const value = {
    isDark,
    theme: currentTheme,
    toggleTheme,
    setTheme,
    loading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  }
  return context;
};

export const useColors = () => {
  const { theme } = useTheme();
  return theme;
};
