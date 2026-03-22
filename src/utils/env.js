import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

/**
 * Lit les secrets depuis process.env (build / outils) ou expo.extra (app.config.js + .env au démarrage).
 */
export function getSupabaseUrl() {
  return (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || extra.supabaseUrl || '';
}

export function getSupabaseAnonKey() {
  return (
    (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || extra.supabaseAnonKey || ''
  );
}

export function getTmdbApiKey() {
  return (typeof process !== 'undefined' && process.env?.TMDB_API_KEY) || extra.tmdbApiKey || '';
}
