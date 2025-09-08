import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - NOUVEAU PROJET V2
const supabaseUrl = 'https://shwaldiuoykaegaqcdfc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNod2FsZGl1b3lrYWVnYXFjZGZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTY4NTMsImV4cCI6MjA3MjEzMjg1M30.b7g5q09XRCBPl1fG94sTYjoE3Xr2ePHP8OHkb-uDh0Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service d'authentification avec fallback local
export const authService = {
  // Inscription simple avec email de confirmation
  async signUp(email, password) {
    console.log('🔐 Supabase signUp appelé avec:', { email });
    
    try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
      
      // Vérifier si c'est une erreur réseau
      if (error && (error.message?.includes('Network request failed') || error.name?.includes('AuthRetryableFetchError'))) {
        console.warn('⚠️ Erreur réseau Supabase détectée, utilisation du fallback local:', error.message);
        
        // Fallback vers l'authentification locale
        const { localAuthService } = await import('./localAuth');
        return await localAuthService.signUp(email, password);
      }
    
    console.log('📊 Réponse Supabase signUp:', { data, error });
    return { data, error };
    } catch (networkError) {
      console.warn('⚠️ Exception réseau Supabase, utilisation du fallback local:', networkError.message);
      
      // Fallback vers l'authentification locale
      const { localAuthService } = await import('./localAuth');
      return await localAuthService.signUp(email, password);
    }
  },

  // Connexion
  async signIn(email, password) {
    console.log('🔑 Supabase signIn appelé avec:', { email });
    
    try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
      
      // Vérifier si c'est une erreur réseau
      if (error && (error.message?.includes('Network request failed') || error.name?.includes('AuthRetryableFetchError'))) {
        console.warn('⚠️ Erreur réseau Supabase détectée, utilisation du fallback local:', error.message);
        
        // Fallback vers l'authentification locale
        const { localAuthService } = await import('./localAuth');
        return await localAuthService.signIn(email, password);
      }
    
    console.log('📊 Réponse Supabase signIn:', { data, error });
    return { data, error };
    } catch (networkError) {
      console.warn('⚠️ Exception réseau Supabase, utilisation du fallback local:', networkError.message);
      
      // Fallback vers l'authentification locale
      const { localAuthService } = await import('./localAuth');
      return await localAuthService.signIn(email, password);
    }
  },

  // Déconnexion
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Obtenir l'utilisateur actuel
  async getCurrentUser() {
    try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
    } catch (networkError) {
      console.warn('⚠️ Erreur réseau Supabase, utilisation du fallback local:', networkError.message);
      
      // Fallback vers l'authentification locale
      const { localAuthService } = await import('./localAuth');
      return await localAuthService.getCurrentUser();
    }
  },

  // Écouter les changements d'état d'auth
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Service pour les films/séries
export const moviesService = {
  // Récupérer les films populaires
  async getPopularMovies() {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('is_popular', true)
      .limit(20);
    return { data, error };
  },

  // Récupérer les détails d'un film
  async getMovieDetails(id) {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Rechercher des films
  async searchMovies(query) {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .ilike('title', `%${query}%`)
      .limit(10);
    return { data, error };
  }
};

// Service pour les listes utilisateur
export const userListsService = {
  // Créer une liste
  async createList(userId, name, description) {
    const { data, error } = await supabase
      .from('user_lists')
      .insert([
        { user_id: userId, name, description }
      ]);
    return { data, error };
  },

  // Récupérer les listes d'un utilisateur
  async getUserLists(userId) {
    const { data, error } = await supabase
      .from('user_lists')
      .select('*')
      .eq('user_id', userId);
    return { data, error };
  },

  // Ajouter un film à une liste
  async addMovieToList(listId, movieId) {
    const { data, error } = await supabase
      .from('list_movies')
      .insert([
        { list_id: listId, movie_id: movieId }
      ]);
    return { data, error };
  },

  // Supprimer un film d'une liste
  async removeMovieFromList(listId, movieId) {
    const { data, error } = await supabase
      .from('list_movies')
      .delete()
      .eq('list_id', listId)
      .eq('movie_id', movieId);
    return { data, error };
  },

  // Obtenir les films d'une liste
  async getListMovies(listId) {
    const { data, error } = await supabase
      .from('list_movies')
      .select('*')
      .eq('list_id', listId);
    return { data, error };
  },

  // Ajouter aux favoris
  async addToFavorites(userId, movieId, movieData) {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert([
        { 
          user_id: userId, 
          movie_id: movieId,
          title: movieData.title,
          poster_path: movieData.poster_path,
          overview: movieData.overview,
          release_date: movieData.release_date,
          vote_average: movieData.vote_average
        }
      ]);
    return { data, error };
  },

  // Supprimer des favoris
  async removeFromFavorites(userId, movieId) {
    const { data, error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId);
    return { data, error };
  },

  // Obtenir les favoris
  async getFavorites(userId) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Ajouter à la watchlist
  async addToWatchlist(userId, movieId, movieData) {
    const { data, error } = await supabase
      .from('user_watchlist')
      .insert([
        { 
          user_id: userId, 
          movie_id: movieId,
          title: movieData.title,
          poster_path: movieData.poster_path,
          overview: movieData.overview,
          release_date: movieData.release_date,
          vote_average: movieData.vote_average
        }
      ]);
    return { data, error };
  },

  // Supprimer de la watchlist
  async removeFromWatchlist(userId, movieId) {
    const { data, error } = await supabase
      .from('user_watchlist')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId);
    return { data, error };
  },

  // Obtenir la watchlist
  async getWatchlist(userId) {
    const { data, error } = await supabase
      .from('user_watchlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Marquer comme vu
  async addToWatched(userId, movieId, movieData) {
    const { data, error } = await supabase
      .from('user_watched')
      .insert([
        { 
          user_id: userId, 
          movie_id: movieId,
          title: movieData.title,
          poster_path: movieData.poster_path,
          overview: movieData.overview,
          release_date: movieData.release_date,
          vote_average: movieData.vote_average
        }
      ]);
    return { data, error };
  },

  // Supprimer des vus
  async removeFromWatched(userId, movieId) {
    const { data, error } = await supabase
      .from('user_watched')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId);
    return { data, error };
  },

  // Obtenir les films vus
  async getWatched(userId) {
    const { data, error } = await supabase
      .from('user_watched')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Vérifier si un film est dans les favoris
  async isInFavorites(userId, movieId) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .single();
    return { data: !!data, error };
  },

  // Vérifier si un film est dans la watchlist
  async isInWatchlist(userId, movieId) {
    const { data, error } = await supabase
      .from('user_watchlist')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .single();
    return { data: !!data, error };
  },

  // Vérifier si un film est marqué comme vu
  async isWatched(userId, movieId) {
    const { data, error } = await supabase
      .from('user_watched')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .single();
    return { data: !!data, error };
  },

  // Obtenir les statistiques utilisateur
  async getUserStats(userId) {
    const [favorites, watchlist, watched] = await Promise.all([
      this.getFavorites(userId),
      this.getWatchlist(userId),
      this.getWatched(userId)
    ]);

    return {
      favorites: favorites.data?.length || 0,
      watchlist: watchlist.data?.length || 0,
      watched: watched.data?.length || 0
    };
  }
}; 