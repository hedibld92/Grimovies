// Service pour gérer les listes utilisateur avec Supabase
import { supabase } from './supabase';

class UserListsService {
  // Récupérer toutes les listes d'un utilisateur
  async getUserLists(userId) {
    try {
      const { data, error } = await supabase
        .from('user_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getUserLists:', error);
      throw error;
    }
  }

  // Récupérer une liste spécifique avec ses films
  async getListWithMovies(listId) {
    try {
      // Récupérer les infos de la liste
      const { data: listData, error: listError } = await supabase
        .from('user_lists')
        .select('*')
        .eq('id', listId)
        .single();

      if (listError) throw listError;

      // Récupérer les films de la liste
      const { data: moviesData, error: moviesError } = await supabase
        .from('list_movies')
        .select('*')
        .eq('list_id', listId)
        .order('added_at', { ascending: false });

      if (moviesError) throw moviesError;

      return {
        ...listData,
        movies: moviesData || []
      };
    } catch (error) {
      console.error('❌ Erreur getListWithMovies:', error);
      throw error;
    }
  }

  // Créer une nouvelle liste
  async createList(userId, name, description, listType = 'custom') {
    try {
      const { data, error } = await supabase
        .from('user_lists')
        .insert([{
          user_id: userId,
          name,
          description
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur createList:', error);
      throw error;
    }
  }

  // Ajouter un film à une liste
  async addMovieToList(listId, movieData) {
    try {
      const { data, error } = await supabase
        .from('list_movies')
        .insert([{
          list_id: listId,
          movie_id: movieData.id,
          title: movieData.title,
          poster_path: movieData.poster_path,
          overview: movieData.overview,
          release_date: movieData.release_date,
          vote_average: movieData.vote_average
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur addMovieToList:', error);
      throw error;
    }
  }

  // Supprimer un film d'une liste
  async removeMovieFromList(listId, movieId) {
    try {
      const { error } = await supabase
        .from('list_movies')
        .delete()
        .eq('list_id', listId)
        .eq('movie_id', movieId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur removeMovieFromList:', error);
      throw error;
    }
  }

  // Vérifier si un film est dans une liste
  async isMovieInList(listId, movieId) {
    try {
      const { data, error } = await supabase
        .from('list_movies')
        .select('id')
        .eq('list_id', listId)
        .eq('movie_id', movieId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('❌ Erreur isMovieInList:', error);
      return false;
    }
  }

  // Récupérer les favoris d'un utilisateur
  async getUserFavorites(userId) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getUserFavorites:', error);
      throw error;
    }
  }

  // Ajouter un film aux favoris
  async addToFavorites(userId, movieData) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .insert([{
          user_id: userId,
          movie_id: movieData.id,
          title: movieData.title,
          poster_path: movieData.poster_path,
          overview: movieData.overview,
          release_date: movieData.release_date,
          vote_average: movieData.vote_average
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur addToFavorites:', error);
      throw error;
    }
  }

  // Supprimer un film des favoris
  async removeFromFavorites(userId, movieId) {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('movie_id', movieId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Erreur removeFromFavorites:', error);
      throw error;
    }
  }

  // Vérifier si un film est dans les favoris
  async isMovieInFavorites(userId, movieId) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('movie_id', movieId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('❌ Erreur isMovieInFavorites:', error);
      return false;
    }
  }

  // Récupérer les films vus d'un utilisateur
  async getUserWatched(userId) {
    try {
      const { data, error } = await supabase
        .from('user_watched')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getUserWatched:', error);
      throw error;
    }
  }

  // Marquer un film comme vu
  async markAsWatched(userId, movieData, rating = null) {
    try {
      const { data, error } = await supabase
        .from('user_watched')
        .insert([{
          user_id: userId,
          movie_id: movieData.id,
          title: movieData.title,
          poster_path: movieData.poster_path,
          overview: movieData.overview,
          release_date: movieData.release_date,
          vote_average: movieData.vote_average
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur markAsWatched:', error);
      throw error;
    }
  }

  // Récupérer les critiques d'un utilisateur
  async getUserReviews(userId) {
    try {
      const { data, error } = await supabase
        .from('user_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur getUserReviews:', error);
      throw error;
    }
  }

  // Ajouter/Modifier une critique
  async addOrUpdateReview(userId, movieData, rating, reviewText) {
    try {
      const { data, error } = await supabase
        .from('user_reviews')
        .upsert([{
          user_id: userId,
          movie_id: movieData.id,
          title: movieData.title,
          poster_path: movieData.poster_path,
          rating,
          review_text: reviewText,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur addOrUpdateReview:', error);
      throw error;
    }
  }

  // Supprimer un film des films vus
  async removeFromWatched(userId, movieId) {
    try {
      const { data, error } = await supabase
        .from('user_watched')
        .delete()
        .eq('user_id', userId)
        .eq('movie_id', movieId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur removeFromWatched:', error);
      throw error;
    }
  }
}

export default new UserListsService(); 