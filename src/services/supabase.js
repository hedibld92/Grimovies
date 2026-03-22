import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseUrl } from '../utils/env';

/*
 * COUCHE DONNÉES — Client Supabase (connexion à la base et à l’auth distante).
 * Connexion via process.env.SUPABASE_URL et process.env.SUPABASE_ANON_KEY :
 * le fichier .env est chargé au démarrage par app.config.js (dotenv) ; côté app, les valeurs
 * sont lues dans src/utils/env.js (process.env ou expo.extra).
 *
 * Schéma SQL à recréer dans Supabase (tables + RLS) :
 *
 * -- Table des favoris
 * CREATE TABLE user_favorites (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   movie_id INTEGER NOT NULL,
 *   title VARCHAR NOT NULL,
 *   poster_path VARCHAR,
 *   overview TEXT,
 *   release_date VARCHAR,
 *   vote_average REAL,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   UNIQUE(user_id, movie_id)
 * );
 *
 * -- Table watchlist
 * CREATE TABLE user_watchlist (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   movie_id INTEGER NOT NULL,
 *   title VARCHAR NOT NULL,
 *   poster_path VARCHAR,
 *   overview TEXT,
 *   release_date VARCHAR,
 *   vote_average REAL,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   UNIQUE(user_id, movie_id)
 * );
 *
 * -- Table films vus
 * CREATE TABLE user_watched (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   movie_id INTEGER NOT NULL,
 *   title VARCHAR NOT NULL,
 *   poster_path VARCHAR,
 *   overview TEXT,
 *   release_date VARCHAR,
 *   vote_average REAL,
 *   rating INTEGER,
 *   watched_at TIMESTAMP DEFAULT NOW(),
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   UNIQUE(user_id, movie_id)
 * );
 *
 * -- Table critiques
 * CREATE TABLE user_reviews (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   movie_id INTEGER NOT NULL,
 *   title VARCHAR NOT NULL,
 *   rating INTEGER NOT NULL,
 *   review_text TEXT,
 *   poster_path VARCHAR,
 *   overview TEXT,
 *   release_date VARCHAR,
 *   vote_average REAL,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 *
 * -- Table listes personnalisées
 * CREATE TABLE user_lists (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   name VARCHAR NOT NULL,
 *   description TEXT,
 *   list_type VARCHAR,
 *   is_public BOOLEAN DEFAULT false,
 *   created_at TIMESTAMP DEFAULT NOW(),
 *   updated_at TIMESTAMP DEFAULT NOW()
 * );
 *
 * -- Table films dans les listes
 * CREATE TABLE list_movies (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   list_id UUID REFERENCES user_lists(id) ON DELETE CASCADE,
 *   movie_id INTEGER NOT NULL,
 *   title VARCHAR NOT NULL,
 *   poster_path VARCHAR,
 *   overview TEXT,
 *   release_date VARCHAR,
 *   vote_average REAL,
 *   added_at TIMESTAMP DEFAULT NOW()
 * );
 *
 * -- RLS à activer sur toutes les tables
 * ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE user_watched ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE list_movies ENABLE ROW LEVEL SECURITY;
 *
 * -- Politiques RLS (à répéter pour chaque table)
 * CREATE POLICY "Users can view their own favorites" ON user_favorites FOR ALL USING (auth.uid() = user_id);
 * CREATE POLICY "Users can view their own watchlist" ON user_watchlist FOR ALL USING (auth.uid() = user_id);
 * CREATE POLICY "Users can view their own watched" ON user_watched FOR ALL USING (auth.uid() = user_id);
 * CREATE POLICY "Users can view their own reviews" ON user_reviews FOR ALL USING (auth.uid() = user_id);
 * CREATE POLICY "Users can view their own lists" ON user_lists FOR ALL USING (auth.uid() = user_id);
 * CREATE POLICY "Users can view movies in their lists" ON list_movies FOR ALL USING (auth.uid() = (SELECT user_id FROM user_lists WHERE id = list_id));
 */

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
