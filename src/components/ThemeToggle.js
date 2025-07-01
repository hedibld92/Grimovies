import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = ({ style }) => {
  const { isDark, theme, toggleTheme } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: theme.CARD_BG }, style]}
      onPress={toggleTheme}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={isDark ? "moon" : "sunny"} 
            size={20} 
            color={theme.PRIMARY} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.TEXT_PRIMARY }]}>
            Thème
          </Text>
          <Text style={[styles.subtitle, { color: theme.TEXT_SECONDARY }]}>
            {isDark ? 'Mode sombre' : 'Mode clair'}
          </Text>
        </View>
        
        <View style={[styles.toggle, { backgroundColor: isDark ? theme.PRIMARY : theme.BORDER }]}>
          <Animated.View 
            style={[
              styles.toggleButton,
              {
                backgroundColor: theme.BACKGROUND,
                transform: [{ translateX: isDark ? 22 : 2 }]
              }
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ThemeToggle; 