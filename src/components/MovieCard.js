import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks/useTheme';
import { Sizes, formatters } from '../types';
import TMDBService from '../services/tmdb';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 colonnes avec marges

const MovieCard = ({ 
  movie, 
  onPress, 
  onRemove,
  showRating = true,
  showRemoveButton = false
}) => {
  const Colors = useColors();
  const styles = createStyles(Colors);
  const imageUrl = TMDBService.getImageUrl(movie.poster_path);
  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;
  
  // Debug: vérifier les données du film
  if (!movie.id) {
    console.warn('⚠️ Film sans ID:', movie);
  }

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(movie)}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.poster}
          resizeMode="cover"
        />
        
        {/* Bouton de suppression uniquement dans les listes */}
        {showRemoveButton && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => onRemove && onRemove(movie)}
            >
              <Ionicons
                name="trash"
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Note en bas à gauche */}
        {showRating && movie.vote_average > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={Colors.ACCENT} />
            <Text style={styles.ratingText}>
              {formatters.formatRating(movie.vote_average)}
            </Text>
          </View>
        )}
      </View>

      {/* Informations */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        {releaseDate && (
          <Text style={styles.year}>
            {new Date(releaseDate).getFullYear()}
          </Text>
        )}
        
        {movie.genre_ids && movie.genre_ids.length > 0 && (
          <Text style={styles.genre} numberOfLines={1}>
            {movie.genre_ids.slice(0, 2).join(' • ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (Colors) => StyleSheet.create({
  card: {
    backgroundColor: Colors.CARD_BG,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  imageContainer: {
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  actionsContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  favoriteActive: {
    backgroundColor: 'rgba(220, 53, 69, 0.9)',
  },
  removeButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.9)',
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  info: {
    padding: 12,
  },
  title: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  year: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 4,
  },
  genre: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default MovieCard; 