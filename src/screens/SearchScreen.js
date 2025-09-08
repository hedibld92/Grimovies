import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useColors } from '../hooks/useTheme';
import { MovieGenres, SortBy, Sizes } from '../types';
import { useAuth } from '../hooks/useAuth';
import TMDBService from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import LogoutButton from '../components/LogoutButton';

const SearchScreen = ({ navigation }) => {
  const { isAuthenticated, signOut } = useAuth();
  const Colors = useColors();
  const styles = createStyles(Colors);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [sortBy, setSortBy] = useState(SortBy.POPULARITY_DESC);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'movies', 'tv'

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      // Charger les genres films et séries
      const [movieGenres, tvGenres] = await Promise.all([
        TMDBService.getMovieGenres(),
        TMDBService.getTVGenres()
      ]);
      
      // Combiner et dédupliquer les genres
      const allGenres = [...(movieGenres.genres || []), ...(tvGenres.genres || [])];
      const uniqueGenres = allGenres.reduce((acc, genre) => {
        if (!acc.find(g => g.id === genre.id)) {
          acc.push(genre);
        }
        return acc;
      }, []);
      
      setGenres(uniqueGenres);
    } catch (error) {
      console.error('Erreur lors du chargement des genres:', error);
    }
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim() && !selectedGenre) return;

    try {
      setLoading(true);
      let results;

      if (query.trim()) {
        // Recherche par texte selon l'onglet actif
        if (activeTab === 'all') {
          const response = await TMDBService.searchMulti(query.trim());
          results = response.results || [];
        } else if (activeTab === 'movies') {
          const response = await TMDBService.searchMovies(query.trim());
          results = response.results || [];
        } else if (activeTab === 'tv') {
          const response = await TMDBService.searchTVShows(query.trim());
          results = response.results || [];
        }
      } else if (selectedGenre) {
        // Recherche par genre selon l'onglet actif
        if (activeTab === 'all' || activeTab === 'movies') {
          const moviesResponse = await TMDBService.discoverMovies({
            genre: selectedGenre,
            sortBy: sortBy,
            page: 1
          });
          
          if (activeTab === 'tv') {
            const tvResponse = await TMDBService.discoverTVShows({
              genre: selectedGenre,
              sortBy: sortBy,
              page: 1
            });
            results = tvResponse.results || [];
          } else if (activeTab === 'all') {
            const tvResponse = await TMDBService.discoverTVShows({
              genre: selectedGenre,
              sortBy: sortBy,
              page: 1
            });
            results = [...(moviesResponse.results || []), ...(tvResponse.results || [])];
          } else {
            results = moviesResponse.results || [];
          }
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      Alert.alert('Erreur', 'Impossible d\'effectuer la recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleMoviePress = (movie) => {
    navigation.navigate('MovieDetail', { movie });
  };

  const handleAddToWatchlist = (movie) => {
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
    
    Alert.alert('Succès', `${movie.title || movie.name} ajouté à votre liste !`);
  };

  const handleToggleFavorite = (movie) => {
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
    
    Alert.alert('Succès', `${movie.title || movie.name} ajouté aux favoris !`);
  };

  const renderGenreFilter = () => (
    <View style={styles.genreContainer}>
      <FlatList
        data={genres}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.genreList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.genreChip,
              selectedGenre === item.id && styles.selectedGenreChip
            ]}
            onPress={() => {
              const newGenre = selectedGenre === item.id ? null : item.id;
              setSelectedGenre(newGenre);
              if (newGenre) {
                handleSearch('');
              }
            }}
          >
            <Text
              style={[
                styles.genreText,
                selectedGenre === item.id && styles.selectedGenreText
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderMovieItem = ({ item, index }) => (
    <View style={[styles.movieItem, index % 2 === 1 && styles.movieItemRight]}>
              <MovieCard
          movie={item}
          onPress={handleMoviePress}
        />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={64} color={Colors.TEXT_SECONDARY} />
      <Text style={styles.emptyStateTitle}>
        {searchQuery || selectedGenre ? 'Aucun résultat' : 'Recherchez du contenu'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery || selectedGenre 
          ? 'Essayez avec d\'autres mots-clés ou filtres'
          : 'Tapez le nom d\'un film, d\'une série ou sélectionnez un genre'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.TEXT_SECONDARY} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === 'movies' ? 'Rechercher un film...' :
              activeTab === 'tv' ? 'Rechercher une série...' :
              'Rechercher films et séries...'
            }
            placeholderTextColor={Colors.TEXT_SECONDARY}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              <Ionicons name="close-circle" size={20} color={Colors.TEXT_SECONDARY} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name="options-outline" 
            size={20} 
            color={showFilters ? Colors.PRIMARY : Colors.TEXT_SECONDARY} 
          />
        </TouchableOpacity>
        
        {isAuthenticated && <LogoutButton size={20} />}
      </View>

      {/* Onglets de type de contenu */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => {
            setActiveTab('all');
            if (searchQuery || selectedGenre) handleSearch();
          }}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tout
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'movies' && styles.activeTab]}
          onPress={() => {
            setActiveTab('movies');
            if (searchQuery || selectedGenre) handleSearch();
          }}
        >
          <Text style={[styles.tabText, activeTab === 'movies' && styles.activeTabText]}>
            Films
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tv' && styles.activeTab]}
          onPress={() => {
            setActiveTab('tv');
            if (searchQuery || selectedGenre) handleSearch();
          }}
        >
          <Text style={[styles.tabText, activeTab === 'tv' && styles.activeTabText]}>
            Séries
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Genres</Text>
          {renderGenreFilter()}
          
          {selectedGenre && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSelectedGenre(null);
                setSearchResults([]);
              }}
            >
              <Text style={styles.clearFiltersText}>Effacer les filtres</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Résultats */}
      <View style={styles.resultsContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
            <Text style={styles.loadingText}>Recherche en cours...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.resultsList}
            renderItem={renderMovieItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    paddingTop: Sizes.STATUS_BAR_PADDING,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: Colors.TEXT_PRIMARY,
    fontSize: 16,
    marginLeft: 12,
  },
  filterButton: {
    padding: 12,
    backgroundColor: Colors.CARD_BG,
    borderRadius: 12,
    marginRight: 8,
  },

  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.CARD_BG,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  tabText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.TEXT_PRIMARY,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.CARD_BG,
  },
  filterTitle: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  genreContainer: {
    marginBottom: 12,
  },
  genreList: {
    paddingRight: 20,
  },
  genreChip: {
    backgroundColor: Colors.CARD_BG,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedGenreChip: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  genreText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedGenreText: {
    color: Colors.TEXT_PRIMARY,
  },
  clearFiltersButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  clearFiltersText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
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
  resultsList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  movieItem: {
    flex: 1,
    marginRight: 8,
  },
  movieItemRight: {
    marginRight: 0,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SearchScreen; 