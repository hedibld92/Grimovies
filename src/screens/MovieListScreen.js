import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useColors } from '../hooks/useTheme';
import { Sizes } from '../types';
import { useAuth } from '../hooks/useAuth';
import TMDBService from '../services/tmdb';
import userListsService from '../services/userLists';
import MovieCard from '../components/MovieCard';

const MovieListScreen = ({ route, navigation }) => {
  const { listId, listTitle, listType, userId } = route.params;
  const { user, isAuthenticated } = useAuth();
  const Colors = useColors();
  const styles = createStyles(Colors);
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listData, setListData] = useState(null);

  useEffect(() => {
    loadListData();
  }, []);

  // Rafraîchir les données quand l'écran devient actif
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 MovieListScreen actif - Rafraîchissement...');
      loadListData();
    }, [listId, listType, userId])
  );

  const loadListData = async () => {
    setLoading(true);
    try {
      console.log('📋 Chargement de la liste:', { listId, listType, userId, type: route.params?.type });

      let moviesData = [];

      // Gérer les listes TMDB (films populaires, tendances, etc.)
      if (route.params?.type) {
        const apiType = route.params.type;
        console.log('🎬 Chargement depuis TMDB, type:', apiType);
        
        let apiResponse;
        switch (apiType) {
          case 'trending':
            apiResponse = await TMDBService.getTrendingAll();
            break;
          case 'popular':
            apiResponse = await TMDBService.getPopularMovies();
            break;
          case 'top_rated':
            apiResponse = await TMDBService.getTopRatedMovies();
            break;
          case 'popular_tv':
            apiResponse = await TMDBService.getPopularTVShows();
            break;
          case 'top_rated_tv':
            apiResponse = await TMDBService.getTopRatedTVShows();
            break;
          default:
            console.warn('Type TMDB non reconnu:', apiType);
        }
        
        if (apiResponse?.results) {
          // Convertir les données TMDB au format attendu
          const formattedMovies = apiResponse.results.map(item => ({
            id: item.id,
            title: item.title || item.name,
            poster_path: item.poster_path,
            overview: item.overview,
            release_date: item.release_date || item.first_air_date,
            vote_average: item.vote_average,
            media_type: item.media_type || (item.title ? 'movie' : 'tv')
          }));
          
          setMovies(formattedMovies);
          console.log('✅ Liste TMDB chargée:', formattedMovies.length, 'contenus');
          return;
        }
      }
      
      // Gérer les listes utilisateur personnelles
      if (listType === 'favorites') {
        // Charger les favoris
        moviesData = await userListsService.getUserFavorites(userId);
      } else if (listType === 'watched') {
        // Charger les films vus
        moviesData = await userListsService.getUserWatched(userId);
      } else if (listType === 'reviews') {
        // Charger les critiques
        moviesData = await userListsService.getUserReviews(userId);
      } else if (listId) {
        // Charger une liste spécifique
        const listWithMovies = await userListsService.getListWithMovies(listId);
        setListData(listWithMovies);
        moviesData = listWithMovies.movies || [];
      }

      // Convertir les données pour les afficher
      const formattedMovies = moviesData.map(item => ({
        id: item.movie_id,
        title: item.title,
        poster_path: item.poster_path,
        overview: item.overview,
        release_date: item.release_date,
        vote_average: item.vote_average,
        rating: item.rating,
        review_text: item.review_text,
        added_at: item.added_at || item.created_at
      }));

      setMovies(formattedMovies);
      console.log('✅ Liste chargée:', formattedMovies.length, 'films');

    } catch (error) {
      console.error('❌ Erreur lors du chargement de la liste:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste');
    } finally {
      setLoading(false);
    }
  };

  const handleMoviePress = (movie) => {
    navigation.navigate('MovieDetail', { movie });
  };

  const handleRemoveFromList = async (movie) => {
    Alert.alert(
      'Supprimer le film',
      `Voulez-vous supprimer "${movie.title}" de cette liste ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              if (listType === 'favorites') {
                await userListsService.removeFromFavorites(userId, movie.id);
              } else if (listId) {
                await userListsService.removeMovieFromList(listId, movie.id);
              }
              
              // Recharger la liste
              loadListData();
              Alert.alert('Succès', 'Film supprimé de la liste');
            } catch (error) {
              console.error('Erreur suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le film');
            }
          }
        }
      ]
    );
  };

  const renderMovieItem = ({ item, index }) => (
    <View style={[styles.movieItem, index % 2 === 1 && styles.movieItemRight]}>
      <MovieCard
        movie={item}
        onPress={handleMoviePress}
        showRemoveButton={!route.params?.type} // Pas de bouton supprimer pour les listes TMDB
        onRemove={() => handleRemoveFromList(item)}
      />
      {listType === 'reviews' && item.review_text && (
        <View style={styles.reviewContainer}>
          <Text style={styles.reviewText} numberOfLines={2}>
            "{item.review_text}"
          </Text>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={Colors.WARNING} />
              <Text style={styles.ratingText}>{item.rating}/10</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={listType === 'favorites' ? 'heart-outline' : 'film-outline'} 
        size={60} 
        color={Colors.TEXT_SECONDARY} 
      />
      <Text style={styles.emptyTitle}>Liste vide</Text>
      <Text style={styles.emptyText}>
        {listType === 'favorites' 
          ? 'Vous n\'avez pas encore ajouté de films à vos favoris'
          : 'Cette liste ne contient aucun film pour le moment'
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{listTitle}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.movieCount}>{movies.length} films</Text>
        </View>
      </View>

      <FlatList
        data={movies}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={renderMovieItem}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const createStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    paddingTop: Sizes.STATUS_BAR_PADDING,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  movieCount: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  movieItem: {
    flex: 1,
    marginRight: 8,
    marginBottom: 16,
  },
  movieItemRight: {
    marginRight: 0,
    marginLeft: 8,
  },
  reviewContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: Colors.SURFACE,
    borderRadius: 8,
  },
  reviewText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: Colors.WARNING,
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});

export default MovieListScreen; 