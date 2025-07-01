// Service pour l'API TMDB (The Movie Database)
const TMDB_API_KEY = '292b1b9039eaad32292ed45b4af87295';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

class TMDBService {
  async fetchFromTMDB(endpoint) {
    try {
      // Gérer les paramètres d'URL correctement
      const separator = endpoint.includes('?') ? '&' : '?';
      const url = `${BASE_URL}${endpoint}${separator}api_key=${TMDB_API_KEY}&language=fr-FR`;
      console.log('🌐 Requête TMDB:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Réponse TMDB reçue:', {
        endpoint,
        resultsCount: data.results?.length || 0,
        totalResults: data.total_results || 0
      });
      
      return data;
    } catch (error) {
      console.error('❌ Erreur TMDB:', error);
      throw error;
    }
  }

  // Récupérer les films populaires
  async getPopularMovies(page = 1) {
    return this.fetchFromTMDB(`/movie/popular?page=${page}`);
  }

  // Récupérer les films les mieux notés
  async getTopRatedMovies(page = 1) {
    return this.fetchFromTMDB(`/movie/top_rated?page=${page}`);
  }

  // Récupérer les films à venir
  async getUpcomingMovies(page = 1) {
    return this.fetchFromTMDB(`/movie/upcoming?page=${page}`);
  }

  // Récupérer les films tendance
  async getTrendingMovies(timeWindow = 'week') {
    return this.fetchFromTMDB(`/trending/movie/${timeWindow}`);
  }

  // Récupérer les séries populaires
  async getPopularTVShows(page = 1) {
    return this.fetchFromTMDB(`/tv/popular?page=${page}`);
  }

  // Récupérer les séries les mieux notées
  async getTopRatedTVShows(page = 1) {
    return this.fetchFromTMDB(`/tv/top_rated?page=${page}`);
  }

  // Récupérer les séries tendance
  async getTrendingTVShows(timeWindow = 'week') {
    return this.fetchFromTMDB(`/trending/tv/${timeWindow}`);
  }

  // Récupérer les séries qui diffusent aujourd'hui
  async getTVShowsAiringToday(page = 1) {
    return this.fetchFromTMDB(`/tv/airing_today?page=${page}`);
  }

  // Récupérer les séries qui diffusent cette semaine
  async getTVShowsOnTheAir(page = 1) {
    return this.fetchFromTMDB(`/tv/on_the_air?page=${page}`);
  }

  // Récupérer le contenu mixte tendance (films + séries)
  async getTrendingAll(timeWindow = 'week') {
    return this.fetchFromTMDB(`/trending/all/${timeWindow}`);
  }

  // Récupérer les détails d'un film
  async getMovieDetails(movieId) {
    return this.fetchFromTMDB(`/movie/${movieId}?append_to_response=credits,videos,similar`);
  }

  // Récupérer les détails d'une série
  async getTVShowDetails(tvId) {
    return this.fetchFromTMDB(`/tv/${tvId}?append_to_response=credits,videos,similar`);
  }

  // Rechercher des films/séries
  async searchMulti(query, page = 1) {
    return this.fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
  }

  // Rechercher des films
  async searchMovies(query, page = 1) {
    return this.fetchFromTMDB(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
  }

  // Rechercher des séries
  async searchTVShows(query, page = 1) {
    return this.fetchFromTMDB(`/search/tv?query=${encodeURIComponent(query)}&page=${page}`);
  }

  // Récupérer les genres de films
  async getMovieGenres() {
    return this.fetchFromTMDB('/genre/movie/list');
  }

  // Récupérer les genres de séries
  async getTVGenres() {
    return this.fetchFromTMDB('/genre/tv/list');
  }

  // Découvrir des films avec filtres
  async discoverMovies(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.genre) params.append('with_genres', filters.genre);
    if (filters.year) params.append('year', filters.year);
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.page) params.append('page', filters.page);
    
    return this.fetchFromTMDB(`/discover/movie?${params.toString()}`);
  }

  // Découvrir des séries avec filtres
  async discoverTVShows(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.genre) params.append('with_genres', filters.genre);
    if (filters.year) params.append('first_air_date_year', filters.year);
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.page) params.append('page', filters.page);
    
    return this.fetchFromTMDB(`/discover/tv?${params.toString()}`);
  }

  // Construire l'URL d'une image
  getImageUrl(path, size = 'w500') {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }

  // Construire l'URL d'une image de profil
  getProfileImageUrl(path, size = 'w185') {
    return this.getImageUrl(path, size);
  }

  // Construire l'URL d'une image de fond
  getBackdropUrl(path, size = 'w1280') {
    return this.getImageUrl(path, size);
  }
}

export default new TMDBService(); 