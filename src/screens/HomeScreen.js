import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useColors } from '../hooks/useColors';
import { Sizes } from '../types';
import { useAuth } from '../hooks/useAuth';
import TMDBService from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import LogoutButton from '../components/LogoutButton';
import Logo from '../components/Logo';

const HomeScreen = ({ navigation }) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const Colors = useColors();
  const styles = createStyles(Colors);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // États pour les différentes sections
  const [trendingContent, setTrendingContent] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [popularTVShows, setPopularTVShows] = useState([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState([]);
  const [randomPick, setRandomPick] = useState(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      console.log('🎬 Chargement des données TMDB...');
      
      // Charger les données en parallèle (films + séries)
      const [trendingAll, popularMovies, topRatedMovies, popularTV, topRatedTV] = await Promise.all([
        TMDBService.getTrendingAll(),
        TMDBService.getPopularMovies(),
        TMDBService.getTopRatedMovies(),
        TMDBService.getPopularTVShows(),
        TMDBService.getTopRatedTVShows()
      ]);

      console.log('📊 Données reçues:', {
        trendingAll: trendingAll.results?.length || 0,
        popularMovies: popularMovies.results?.length || 0,
        topRatedMovies: topRatedMovies.results?.length || 0,
        popularTV: popularTV.results?.length || 0,
        topRatedTV: topRatedTV.results?.length || 0
      });

      setTrendingContent(trendingAll.results?.slice(0, 15) || []);
      setPopularMovies(popularMovies.results?.slice(0, 10) || []);
      setTopRatedMovies(topRatedMovies.results?.slice(0, 10) || []);
      setPopularTVShows(popularTV.results?.slice(0, 10) || []);
      setTopRatedTVShows(topRatedTV.results?.slice(0, 10) || []);
      
      // Sélectionner un contenu aléatoire pour la suggestion du jour
      const allContent = [...(trendingAll.results || []), ...(popularMovies.results || []), ...(popularTV.results || [])];
      if (allContent.length > 0) {
        const randomIndex = Math.floor(Math.random() * allContent.length);
        setRandomPick(allContent[randomIndex]);
        console.log('🎲 Contenu aléatoire sélectionné:', allContent[randomIndex].title || allContent[randomIndex].name);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les films. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
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
    
    // TODO: Implémenter l'ajout à la watchlist
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
    
    // TODO: Implémenter l'ajout/suppression des favoris
    Alert.alert('Succès', `${movie.title || movie.name} ajouté aux favoris !`);
  };

  const renderMovieSection = (title, data, onSeeAll) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.horizontalList}
        renderItem={({ item }) => (
          <View style={styles.horizontalCard}>
            <MovieCard
              movie={item}
              onPress={handleMoviePress}
            />
          </View>
        )}
      />
    </View>
  );

  const renderRandomPick = () => {
    if (!randomPick) return null;

    return (
      <View style={styles.randomPickSection}>
        <LinearGradient
          colors={[Colors.PRIMARY, Colors.SECONDARY]}
          style={styles.randomPickGradient}
        >
          <View style={styles.randomPickContent}>
            <Ionicons name="shuffle" size={24} color={Colors.TEXT_PRIMARY} />
            <Text style={styles.randomPickTitle}>Suggestion du jour</Text>
            <Text style={styles.randomPickMovieTitle}>
              {randomPick.title || randomPick.name}
            </Text>
            <TouchableOpacity
              style={styles.randomPickButton}
              onPress={() => handleMoviePress(randomPick)}
            >
              <Text style={styles.randomPickButtonText}>Découvrir</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.PRIMARY}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Logo size={60} />
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Ionicons name="search" size={24} color={Colors.TEXT_PRIMARY} />
            </TouchableOpacity>
            
            {isAuthenticated && <LogoutButton />}
          </View>
        </View>

        {/* Suggestion aléatoire */}
        {renderRandomPick()}

        {/* Contenu tendance (films + séries) */}
        {trendingContent.length > 0 && renderMovieSection(
          'Tendances',
          trendingContent,
          () => navigation.navigate('MovieList', { 
            title: 'Contenu tendance', 
            type: 'trending' 
          })
        )}

        {/* Films populaires */}
        {popularMovies.length > 0 && renderMovieSection(
          'Films populaires',
          popularMovies,
          () => navigation.navigate('MovieList', { 
            title: 'Films populaires', 
            type: 'popular' 
          })
        )}

        {/* Séries populaires */}
        {popularTVShows.length > 0 && renderMovieSection(
          'Séries populaires',
          popularTVShows,
          () => navigation.navigate('MovieList', { 
            title: 'Séries populaires', 
            type: 'popular_tv' 
          })
        )}

        {/* Films les mieux notés */}
        {topRatedMovies.length > 0 && renderMovieSection(
          'Films les mieux notés',
          topRatedMovies,
          () => navigation.navigate('MovieList', { 
            title: 'Films les mieux notés', 
            type: 'top_rated' 
          })
        )}

        {/* Séries les mieux notées */}
        {topRatedTVShows.length > 0 && renderMovieSection(
          'Séries les mieux notées',
          topRatedTVShows,
          () => navigation.navigate('MovieList', { 
            title: 'Séries les mieux notées', 
            type: 'top_rated_tv' 
          })
        )}


      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    paddingTop: Sizes.STATUS_BAR_PADDING,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  randomPickSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  randomPickGradient: {
    padding: 20,
  },
  randomPickContent: {
    alignItems: 'center',
  },
  randomPickTitle: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  randomPickMovieTitle: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  randomPickButton: {
    backgroundColor: Colors.TEXT_PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  randomPickButtonText: {
    color: Colors.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: 20,
  },
  horizontalCard: {
    marginRight: 16,
    width: 140,
  },
});

export default HomeScreen; 