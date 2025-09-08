import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme } from '../hooks/useTheme';

// Tes images originales
const LOGO_IMAGES = {
  dark: require('../../assets/images/grimovies-logo-black.png'), // Pour mode clair
  light: require('../../assets/images/logo-grimovies-logo-white.png')  // Pour mode sombre
};

const Logo = ({ size = 120, style }) => {
  const { isDarkMode } = useTheme();
  
  // Utilise ton image originale selon le thème
  const logoSource = isDarkMode ? LOGO_IMAGES.light : LOGO_IMAGES.dark;
  
  return (
    <View style={[styles.container, style]}>
      <Image 
        source={logoSource}
        style={{ 
          width: size, 
          height: size,
          resizeMode: 'contain'
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Logo; 