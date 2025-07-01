import React, { useState, useEffect, Fragment } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useColors } from '../hooks/useTheme';
import { Sizes, formatters } from '../types';
import { useAuth } from '../hooks/useAuth';
import TMDBService from '../services/tmdb';
import userListsService from '../services/userLists';

const MovieDetailScreen = ({ route, navigation }) => {
  const { movie } = route.params;
  const { user, isAuthenticated } = useAuth();
  const Colors = useColors();
  const styles = createStyles(Colors);
  const [movieDetails, setMovieDetails] = useState(movie);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [userLists, setUserLists] = useState([]);

  useEffect(() => {
    loadMovieDetails();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && movieDetails?.id) {
      checkUserStatus();
    }
  }, [isAuthenticated, user, movieDetails?.id]);

  const loadMovieDetails = async () => {
    try {
      setLoading(true);
      console.log('🎭 Chargement détails pour le contenu:', movie.title || movie.name, 'ID:', movie.id, 'Type:', movie.media_type);
      
      // Déterminer si c'est un film ou une série
      const isTV = movie.media_type === 'tv' || movie.first_air_date || (!movie.release_date && movie.name);
      
      const details = isTV 
        ? await TMDBService.getTVShowDetails(movie.id)
        : await TMDBService.getMovieDetails(movie.id);
      console.log('📄 Détails reçus:', {
        title: details.title || details.name,
        hasBackdrop: !!details.backdrop_path,
        hasPoster: !!details.poster_path,
        hasOverview: !!details.overview
      });
      
      setMovieDetails(details);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des détails:', error);
      // En cas d'erreur, utiliser les données de base du film
      setMovieDetails(movie);
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    if (!user?.id || !movieDetails?.id) return;

    try {
      // Vérifier si le film est dans les favoris
      const isInFavorites = await userListsService.isMovieInFavorites(user.id, movieDetails.id);
      setIsFavorite(isInFavorites);

      // Récupérer les listes utilisateur pour vérifier la watchlist
      const lists = await userListsService.getUserLists(user.id);
      setUserLists(lists);
      
      const watchlist = lists.find(list => list.name === 'À voir');
      if (watchlist) {
        const isInWatchlist = await userListsService.isMovieInList(watchlist.id, movieDetails.id);
        setInWatchlist(isInWatchlist);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut:', error);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour ajouter des films à votre liste.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => navigation.navigate('Auth') }
        ]
      );
      return;
    }

    try {
      console.log('🔖 Tentative d\'ajout à la watchlist...');
      console.log('👤 User ID:', user?.id);
      console.log('📋 Listes disponibles:', userLists.length);
      
      const watchlist = userLists.find(list => list.name === 'À voir');
      console.log('🎯 Watchlist trouvée:', watchlist);
      
      if (!watchlist) {
        console.log('❌ Aucune watchlist trouvée, création...');
        Alert.alert('Erreur', 'Liste de visionnage introuvable. Allez dans votre profil pour créer vos listes par défaut.');
        return;
      }

      const movieData = {
        id: movieDetails.id,
        title: movieDetails.title || movieDetails.name,
        poster_path: movieDetails.poster_path,
        overview: movieDetails.overview || '',
        release_date: movieDetails.release_date || movieDetails.first_air_date || '',
        vote_average: movieDetails.vote_average || 0
      };
      console.log('🎬 Données du film:', movieData);

      if (inWatchlist) {
        console.log('➖ Suppression de la watchlist...');
        await userListsService.removeMovieFromList(watchlist.id, movieDetails.id);
        setInWatchlist(false);
        Alert.alert('Succès', `${movieData.title} retiré de votre liste !`);
        
        // Marquer que les données ont changé pour rafraîchir les autres écrans
        navigation.setParams({ dataChanged: Date.now() });
      } else {
        console.log('➕ Ajout à la watchlist...');
        await userListsService.addMovieToList(watchlist.id, movieData);
        setInWatchlist(true);
        Alert.alert('Succès', `${movieData.title} ajouté à votre liste !`);
        
        // Marquer que les données ont changé pour rafraîchir les autres écrans
        navigation.setParams({ dataChanged: Date.now() });
      }
    } catch (error) {
      console.error('❌ Erreur watchlist:', error);
      Alert.alert('Erreur', `Impossible de modifier votre liste: ${error.message}`);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour ajouter des favoris.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => navigation.navigate('Auth') }
        ]
      );
      return;
    }

    try {
      console.log('❤️ Tentative d\'ajout aux favoris...');
      console.log('👤 User ID:', user?.id);
      
      const movieData = {
        id: movieDetails.id,
        title: movieDetails.title || movieDetails.name,
        poster_path: movieDetails.poster_path,
        overview: movieDetails.overview || '',
        release_date: movieDetails.release_date || movieDetails.first_air_date || '',
        vote_average: movieDetails.vote_average || 0
      };
      console.log('🎬 Données du film:', movieData);

      if (isFavorite) {
        console.log('➖ Suppression des favoris...');
        await userListsService.removeFromFavorites(user.id, movieDetails.id);
        setIsFavorite(false);
        Alert.alert('Succès', `${movieData.title} retiré des favoris !`);
        
        // Marquer que les données ont changé pour rafraîchir les autres écrans
        navigation.setParams({ dataChanged: Date.now() });
      } else {
        console.log('➕ Ajout aux favoris...');
        await userListsService.addToFavorites(user.id, movieData);
        setIsFavorite(true);
        Alert.alert('Succès', `${movieData.title} ajouté aux favoris !`);
        
        // Marquer que les données ont changé pour rafraîchir les autres écrans
        navigation.setParams({ dataChanged: Date.now() });
      }
    } catch (error) {
      console.error('❌ Erreur favoris:', error);
      Alert.alert('Erreur', `Impossible de modifier vos favoris: ${error.message}`);
    }
  };

  const handleWatchTrailer = () => {
    const trailer = movieDetails.videos?.results?.find(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    if (trailer) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      Linking.openURL(youtubeUrl);
    } else {
      Alert.alert('Désolé', 'Aucune bande-annonce disponible pour ce film.');
    }
  };

  const renderHeader = () => {
    if (!movieDetails) return null;
    
    const backdropUrl = movieDetails.backdrop_path 
      ? TMDBService.getBackdropUrl(movieDetails.backdrop_path)
      : null;
    const posterUrl = movieDetails.poster_path 
      ? TMDBService.getImageUrl(movieDetails.poster_path)
      : 'https://via.placeholder.com/300x450/333/fff?text=No+Image';

    return (
      <View style={styles.header}>
        {/* Image de fond */}
        <View style={styles.backdropContainer}>
          {backdropUrl ? (
            <Image
              source={{ uri: backdropUrl }}
              style={styles.backdrop}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.backdrop, { backgroundColor: Colors.CARD_BG }]} />
          )}
          <LinearGradient
            colors={['transparent', Colors.BACKGROUND]}
            style={styles.backdropGradient}
          />
        </View>

        {/* Contenu principal */}
        <View style={styles.headerContent}>
          <View style={styles.posterSection}>
            <Image
              source={{ uri: posterUrl }}
              style={styles.poster}
              resizeMode="cover"
            />
            
            <View style={styles.movieInfo}>
              <Text style={styles.title} numberOfLines={2}>
                {movieDetails.title || movieDetails.name || 'Titre inconnu'}
              </Text>
              
              {movieDetails.tagline && (
                <Text style={styles.tagline} numberOfLines={2}>
                  {movieDetails.tagline}
                </Text>
              )}
              
              <View style={styles.metadata}>
                {(movieDetails.release_date || movieDetails.first_air_date) && (
                  <Text style={styles.year}>
                    {new Date(movieDetails.release_date || movieDetails.first_air_date).getFullYear()}
                  </Text>
                )}
                
                {/* Durée pour les films */}
                {movieDetails.runtime && movieDetails.runtime > 0 && (
                  <Fragment>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.runtime}>
                      {formatters.formatRuntime(movieDetails.runtime)}
                    </Text>
                  </Fragment>
                )}
                
                {/* Nombre de saisons/épisodes pour les séries */}
                {movieDetails.number_of_seasons && (
                  <Fragment>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.runtime}>
                      {movieDetails.number_of_seasons} saison{movieDetails.number_of_seasons > 1 ? 's' : ''}
                    </Text>
                  </Fragment>
                )}
                
                {movieDetails.number_of_episodes && (
                  <Fragment>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.runtime}>
                      {movieDetails.number_of_episodes} épisodes
                    </Text>
                  </Fragment>
                )}
                
                {movieDetails.vote_average && movieDetails.vote_average > 0 && (
                  <Fragment>
                    <Text style={styles.separator}>•</Text>
                    <View style={styles.rating}>
                      <Ionicons name="star" size={16} color={Colors.ACCENT} />
                      <Text style={styles.ratingText}>
                        {formatters.formatRating(movieDetails.vote_average)}
                      </Text>
                    </View>
                  </Fragment>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={[styles.actionButton, styles.primaryButton]}
        onPress={handleWatchTrailer}
      >
        <Ionicons name="play" size={20} color="#FFFFFF" />
        <Text style={styles.primaryButtonText}>Bande-annonce</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.secondaryButton, inWatchlist && styles.activeSecondaryButton]}
        onPress={handleAddToWatchlist}
      >
        <Ionicons
          name={inWatchlist ? "bookmark" : "bookmark-outline"}
          size={20}
          color={inWatchlist ? Colors.PRIMARY : Colors.TEXT_SECONDARY}
        />
        <Text style={[styles.secondaryButtonText, inWatchlist && styles.activeSecondaryButtonText]}>
          {inWatchlist ? "Dans ma liste" : "Ma liste"}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.secondaryButton, isFavorite && styles.favoriteSecondaryButton]}
        onPress={handleToggleFavorite}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={20}
          color={isFavorite ? "#E53E3E" : Colors.TEXT_SECONDARY}
        />
        <Text style={[styles.secondaryButtonText, isFavorite && styles.favoriteSecondaryButtonText]}>
          {isFavorite ? "Favori" : "Aimer"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverview = () => {
    if (!movieDetails.overview) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Synopsis</Text>
        <Text style={styles.overview}>{movieDetails.overview}</Text>
      </View>
    );
  };

  const renderGenres = () => {
    if (!movieDetails.genres || movieDetails.genres.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Genres</Text>
        <View style={styles.genresContainer}>
          {movieDetails.genres.map((genre) => (
            <View key={genre.id} style={styles.genreChip}>
              <Text style={styles.genreText}>{genre.name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderCast = () => {
    if (!movieDetails || !movieDetails.credits) return null;
    
    const cast = movieDetails.credits?.cast?.slice(0, 10) || [];
    if (cast.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribution</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.castContainer}>
            {cast.map((actor, index) => (
              <View key={actor.id || index} style={styles.castItem}>
                <Image
                  source={{ 
                    uri: actor.profile_path 
                      ? TMDBService.getProfileImageUrl(actor.profile_path)
                      : 'https://via.placeholder.com/100x150/333/fff?text=?'
                  }}
                  style={styles.castImage}
                  resizeMode="cover"
                />
                <Text style={styles.castName} numberOfLines={2}>
                  {actor.name || 'Acteur inconnu'}
                </Text>
                <Text style={styles.castCharacter} numberOfLines={2}>
                  {actor.character || 'Rôle inconnu'}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderSimilarMovies = () => {
    if (!movieDetails || !movieDetails.similar) return null;
    
    const similar = movieDetails.similar?.results?.slice(0, 10) || [];
    if (similar.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {movieDetails.title ? 'Films similaires' : 'Séries similaires'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.similarContainer}>
            {similar.map((similarMovie, index) => (
              <TouchableOpacity
                key={similarMovie.id || index}
                style={styles.similarItem}
                onPress={() => navigation.push('MovieDetail', { movie: similarMovie })}
              >
                <Image
                  source={{ 
                    uri: similarMovie.poster_path 
                      ? TMDBService.getImageUrl(similarMovie.poster_path)
                      : 'https://via.placeholder.com/200x300/333/fff?text=No+Image'
                  }}
                  style={styles.similarPoster}
                  resizeMode="cover"
                />
                <Text style={styles.similarTitle} numberOfLines={2}>
                  {similarMovie.title || similarMovie.name || 'Titre inconnu'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!movieDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.TEXT_SECONDARY} />
          <Text style={styles.errorText}>Impossible de charger les détails du film</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderActions()}
        {renderOverview()}
        {renderGenres()}
        {renderCast()}
        {renderSimilarMovies()}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  scrollView: {
    flex: 1,
  },
  
  // Header
  header: {
    position: 'relative',
  },
  backdropContainer: {
    height: 250,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  backdropGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  headerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  posterSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    marginRight: 16,
  },
  movieInfo: {
    flex: 1,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    fontStyle: 'italic',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  year: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  runtime: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  separator: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginHorizontal: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: Colors.TEXT_PRIMARY,
    marginLeft: 4,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  
  // Actions
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.CARD_BG,
    marginRight: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.CARD_BG,
    borderWidth: 1,
    borderColor: Colors.CARD_BG,
    marginRight: 12,
  },
  activeSecondaryButton: {
    borderColor: Colors.PRIMARY,
    backgroundColor: `${Colors.PRIMARY}20`,
  },
  favoriteSecondaryButton: {
    borderColor: "#E53E3E",
    backgroundColor: "#E53E3E20",
  },
  secondaryButtonText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  activeSecondaryButtonText: {
    color: Colors.PRIMARY,
  },
  favoriteSecondaryButtonText: {
    color: "#E53E3E",
  },
  
  // Sections
  section: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 16,
  },
  overview: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 24,
  },
  
  // Genres
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreChip: {
    backgroundColor: Colors.CARD_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    fontSize: 14,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '500',
  },
  
  // Cast
  castContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  castItem: {
    width: 80,
    marginRight: 12,
    alignItems: 'center',
  },
  castImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  castName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 2,
  },
  castCharacter: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
  
  // Similar movies
  similarContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  similarItem: {
    width: 100,
    marginRight: 12,
  },
  similarPoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  similarTitle: {
    fontSize: 12,
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Loading et Error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MovieDetailScreen; 