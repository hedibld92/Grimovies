// COUCHE MÉTIER — Gestion de l'authentification et des sessions
import { supabase } from './supabase';

const isNetworkAuthError = (error) =>
  error &&
  (error.message?.includes('Network request failed') ||
    error.name?.includes?.('AuthRetryableFetchError'));

export const AuthService = {
  async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (isNetworkAuthError(error)) {
        const { localAuthService } = await import('./localAuth');
        return localAuthService.signUp(email, password);
      }
      return { data, error };
    } catch (networkError) {
      const { localAuthService } = await import('./localAuth');
      return localAuthService.signUp(email, password);
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (isNetworkAuthError(error)) {
        const { localAuthService } = await import('./localAuth');
        return localAuthService.signIn(email, password);
      }
      return { data, error };
    } catch (networkError) {
      const { localAuthService } = await import('./localAuth');
      return localAuthService.signIn(email, password);
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (networkError) {
      const { localAuthService } = await import('./localAuth');
      return localAuthService.getCurrentUser();
    }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
