// COUCHE DONNÉES — Communication avec l'API TMDB externe
// Clé API : uniquement process.env.TMDB_API_KEY (via .env / app.config.js → expo.extra, voir src/utils/env.js).
import { getTmdbApiKey } from '../utils/env';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

class TMDBService {
  async fetchFromTMDB(endpoint) {
    const apiKey = getTmdbApiKey();
    if (!apiKey) {
      throw new Error('TMDB_API_KEY manquante : définissez-la dans .env (voir env.example).');
    }
    try {
      const separator = endpoint.includes('?') ? '&' : '?';
      const url = `${BASE_URL}${endpoint}${separator}api_key=${apiKey}&language=fr-FR`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Erreur TMDB:', error);
      throw error;
    }
  }

  async getPopularMovies(page = 1) {
    return this.fetchFromTMDB(`/movie/popular?page=${page}`);
  }

  async getTopRatedMovies(page = 1) {
    return this.fetchFromTMDB(`/movie/top_rated?page=${page}`);
  }

  async getUpcomingMovies(page = 1) {
    return this.fetchFromTMDB(`/movie/upcoming?page=${page}`);
  }

  async getTrendingMovies(timeWindow = 'week') {
    return this.fetchFromTMDB(`/trending/movie/${timeWindow}`);
  }

  async getPopularTVShows(page = 1) {
    return this.fetchFromTMDB(`/tv/popular?page=${page}`);
  }

  async getTopRatedTVShows(page = 1) {
    return this.fetchFromTMDB(`/tv/top_rated?page=${page}`);
  }

  async getTrendingTVShows(timeWindow = 'week') {
    return this.fetchFromTMDB(`/trending/tv/${timeWindow}`);
  }

  async getTVShowsAiringToday(page = 1) {
    return this.fetchFromTMDB(`/tv/airing_today?page=${page}`);
  }

  async getTVShowsOnTheAir(page = 1) {
    return this.fetchFromTMDB(`/tv/on_the_air?page=${page}`);
  }

  async getTrendingAll(timeWindow = 'week') {
    return this.fetchFromTMDB(`/trending/all/${timeWindow}`);
  }

  async getMovieDetails(movieId) {
    return this.fetchFromTMDB(`/movie/${movieId}?append_to_response=credits,videos,similar`);
  }

  async getTVShowDetails(tvId) {
    return this.fetchFromTMDB(`/tv/${tvId}?append_to_response=credits,videos,similar`);
  }

  async searchMulti(query, page = 1) {
    return this.fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
  }

  async searchMovies(query, page = 1) {
    return this.fetchFromTMDB(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
  }

  async searchTVShows(query, page = 1) {
    return this.fetchFromTMDB(`/search/tv?query=${encodeURIComponent(query)}&page=${page}`);
  }

  async getMovieGenres() {
    return this.fetchFromTMDB('/genre/movie/list');
  }

  async getTVGenres() {
    return this.fetchFromTMDB('/genre/tv/list');
  }

  async discoverMovies(filters = {}) {
    const params = new URLSearchParams();
    if (filters.genre) params.append('with_genres', filters.genre);
    if (filters.year) params.append('year', filters.year);
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.page) params.append('page', filters.page);
    return this.fetchFromTMDB(`/discover/movie?${params.toString()}`);
  }

  async discoverTVShows(filters = {}) {
    const params = new URLSearchParams();
    if (filters.genre) params.append('with_genres', filters.genre);
    if (filters.year) params.append('first_air_date_year', filters.year);
    if (filters.sortBy) params.append('sort_by', filters.sortBy);
    if (filters.page) params.append('page', filters.page);
    return this.fetchFromTMDB(`/discover/tv?${params.toString()}`);
  }

  getImageUrl(path, size = 'w500') {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }

  getProfileImageUrl(path, size = 'w185') {
    return this.getImageUrl(path, size);
  }

  getBackdropUrl(path, size = 'w1280') {
    return this.getImageUrl(path, size);
  }
}

const tmdb = new TMDBService();

export default tmdb;

export function getPopularMovies(page) {
  return tmdb.getPopularMovies(page);
}

export function getTrendingMovies(timeWindow) {
  return tmdb.getTrendingMovies(timeWindow);
}

export function searchMovies(query, page) {
  return tmdb.searchMovies(query, page);
}

export function getMovieDetails(id) {
  return tmdb.getMovieDetails(id);
}

export function getImageUrl(path, size) {
  return tmdb.getImageUrl(path, size);
}
