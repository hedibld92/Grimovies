# Grimovies

Application mobile de découverte et de gestion de films, construite avec **React Native** et **Expo**.

## Architecture en 3 couches

Les dossiers sous `src/` reflètent une séparation **présentation / métier / données** :

```
                    +---------------------------+
                    |      Écrans + UI          |
                    |  screens/, components/,   |
                    |  hooks/ (useAuth, thème)  |
                    +-------------+-------------+
                                  |
                    +-------------v-------------+
                    |      Couche métier        |
                    |  services/auth.js         |
                    |  services/userLists.js    |
                    +-------------+-------------+
                                  |
                    +-------------v-------------+
                    |      Couche données       |
                    |  services/supabase.js   |
                    |  services/tmdb.js        |
                    |  utils/env.js             |
                    +---------------------------+
```

Structure des dossiers :

```
src/
├── components/     # Présentation — UI réutilisable (MovieCard, SearchBar, ListManager, AuthForm, …)
├── hooks/          # Présentation — useAuth.js, useColors.js (+ useTheme.js réexporte useColors)
├── screens/        # Présentation — écrans
├── services/       # Métier (auth, listes) et données (clients Supabase / TMDB)
├── navigation/
├── types/
└── utils/          # env.js (lecture des variables d’environnement côté app)
```

## Installation et configuration

### Prérequis

- Node.js 18+
- Compte [Supabase](https://supabase.com/)
- Clé API [TMDB](https://www.themoviedb.org/settings/api)

### Étapes

1. Cloner le dépôt et installer les dépendances :

```bash
npm install
```

2. Copier le fichier d’exemple et renseigner les clés (sans les commiter) :

```bash
cp env.example .env
```

Contenu minimal de `.env` :

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
TMDB_API_KEY=
```

3. Au démarrage, `app.config.js` charge le `.env` avec **dotenv** et expose ces valeurs dans `expo.extra`. L’app les lit via `src/utils/env.js` (compatible avec `process.env` en contexte Node / outils).

4. Créer les tables dans Supabase (voir section SQL ci-dessous), activer le RLS et les politiques.

5. Lancer le projet :

```bash
npm start
```

Script optionnel interactif : `npm run setup` (génère un `.env`).

## Schéma SQL Supabase

À exécuter dans l’éditeur SQL Supabase (aligné sur `src/services/supabase.js`) :

```sql
-- Table des favoris
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  title VARCHAR NOT NULL,
  poster_path VARCHAR,
  overview TEXT,
  release_date VARCHAR,
  vote_average REAL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Table watchlist
CREATE TABLE user_watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  title VARCHAR NOT NULL,
  poster_path VARCHAR,
  overview TEXT,
  release_date VARCHAR,
  vote_average REAL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Table films vus
CREATE TABLE user_watched (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  title VARCHAR NOT NULL,
  poster_path VARCHAR,
  overview TEXT,
  release_date VARCHAR,
  vote_average REAL,
  rating INTEGER,
  watched_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Table critiques
CREATE TABLE user_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  title VARCHAR NOT NULL,
  rating INTEGER NOT NULL,
  review_text TEXT,
  poster_path VARCHAR,
  overview TEXT,
  release_date VARCHAR,
  vote_average REAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table listes personnalisées
CREATE TABLE user_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  list_type VARCHAR,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table films dans les listes
CREATE TABLE list_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES user_lists(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  title VARCHAR NOT NULL,
  poster_path VARCHAR,
  overview TEXT,
  release_date VARCHAR,
  vote_average REAL,
  added_at TIMESTAMP DEFAULT NOW()
);

-- RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watched ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_movies ENABLE ROW LEVEL SECURITY;

-- Politiques (exemples — à adapter si besoin)
CREATE POLICY "Users can view their own favorites" ON user_favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own watchlist" ON user_watchlist FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own watched" ON user_watched FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own reviews" ON user_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own lists" ON user_lists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view movies in their lists" ON list_movies FOR ALL USING (auth.uid() = (SELECT user_id FROM user_lists WHERE id = list_id));
```

## Checklist sécurité avant déploiement

- [ ] `.env` est listé dans `.gitignore` et n’est jamais poussé sur le dépôt distant.
- [ ] Aucune clé TMDB ni clé anonyme Supabase en dur dans le code source ; uniquement `env.example` sans secrets réels.
- [ ] Variables sensibles configurées pour EAS Build / CI via les secrets du tableau de bord, pas dans le dépôt.
- [ ] RLS activé sur toutes les tables utilisateur ; politiques testées (accès refusé pour un autre `user_id`).
- [ ] Compte de service / clé `service_role` réservée au backend uniquement, jamais dans l’app mobile.
- [ ] Dépendances à jour (`npm audit`) et builds signés pour les stores.

## Scripts npm

| Commande        | Rôle                    |
|----------------|-------------------------|
| `npm start`    | Démarrage Expo / Metro  |
| `npm run ios` / `android` / `web` | Cibles plateforme |
| `npm run setup`| Assistant `.env`        |

## Licence

MIT (voir le fichier `LICENSE` s’il est présent).
