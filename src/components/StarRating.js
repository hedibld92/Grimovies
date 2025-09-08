import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks/useTheme';

const StarRating = ({ rating = 0, onRatingChange, readonly = false, size = 24 }) => {
  const Colors = useColors();
  const styles = createStyles(Colors);
  
  // Convertir la note sur 10 en étoiles sur 5
  const starRating = rating / 2;
  
  const handleStarPress = (starIndex) => {
    if (readonly) return;
    // Convertir l'index d'étoile (1-5) en note sur 10 (2-10)
    const newRating = (starIndex + 1) * 2;
    onRatingChange(newRating);
  };

  const renderStar = (index) => {
    const filled = index < Math.floor(starRating);
    const halfFilled = index === Math.floor(starRating) && starRating % 1 >= 0.5;
    
    let iconName = 'star-outline';
    if (filled) {
      iconName = 'star';
    } else if (halfFilled) {
      iconName = 'star-half';
    }
    
    return (
      <TouchableOpacity
        key={index}
        style={styles.star}
        onPress={() => handleStarPress(index)}
        disabled={readonly}
        activeOpacity={readonly ? 1 : 0.7}
      >
        <Ionicons
          name={iconName}
          size={size}
          color={filled || halfFilled ? Colors.ACCENT : Colors.TEXT_SECONDARY}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4].map(index => renderStar(index))}
    </View>
  );
};

const createStyles = (Colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
    padding: 4,
  },
});

export default StarRating; 