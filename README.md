# 🎬 Grimovies

Une application mobile de découverte et de gestion de films/séries, développée avec React Native et Expo.

## 📱 Fonctionnalités

### 🏠 Page d'accueil
- Sélection du jour avec suggestion aléatoire
- Films tendance, populaires et les mieux notés
- Interface moderne inspirée de Netflix/Letterboxd

### 🔍 Recherche et filtres
- Recherche par titre de film
- Filtres par genre, année, note
- Découverte de films par catégories

### 🎭 Détails des films
- Synopsis complet avec informations détaillées
- Distribution et équipe technique
- Bandes-annonces et vidéos
- Films similaires et recommandations

### 👤 Gestion utilisateur
- Authentification sécurisée via Supabase
- Listes personnalisées (À voir, Favoris, Vus)
- Historique de visionnage
- Statistiques personnelles

### 📱 Interface responsive
- Design adaptatif pour tous les écrans
- Navigation intuitive par onglets
- Thème sombre moderne

## 🛠️ Stack technique

### Frontend
- **React Native** avec Expo
- **React Navigation** pour la navigation
- **Expo Vector Icons** pour les icônes
- **Expo Linear Gradient** pour les dégradés

### Backend
- **Supabase** pour l'authentification et la base de données
- **TMDB API** pour les métadonnées des films
- Architecture serverless

### Design
- Interface minimaliste et moderne
- Palette de couleurs inspirée de Netflix
- Composants réutilisables et modulaires

## 🚀 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn
- Expo CLI
- Compte Supabase
- Clé API TMDB

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone https://github.com/votre-username/grimovies.git
cd grimovies
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
```

3. **Configuration des variables d'environnement**
```bash
cp env.example .env
```

Remplissez le fichier `.env` avec vos clés :
```
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre_cle_anonyme
TMDB_API_KEY=votre_cle_tmdb
```

4. **Configuration Supabase**

Créez les tables suivantes dans votre projet Supabase :

```sql
-- Table des films (optionnelle, pour les données locales)
CREATE TABLE movies (
  id BIGINT PRIMARY KEY,
  title TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  release_date DATE,
  vote_average DECIMAL,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des listes utilisateur
CREATE TABLE user_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table de liaison films-listes
CREATE TABLE list_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES user_lists(id) ON DELETE CASCADE,
  movie_id BIGINT NOT NULL,
  added_at TIMESTAMP DEFAULT NOW()
);

-- Table des favoris
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);
```

5. **Obtenir une clé API TMDB**
- Créez un compte sur [TMDB](https://www.themoviedb.org/)
- Demandez une clé API dans les paramètres
- Ajoutez la clé dans votre fichier `.env`

6. **Lancer l'application**
```bash
npm start
# ou
expo start
```

## 📱 Utilisation

### Démarrage rapide
1. Ouvrez l'application
2. Explorez les films sans compte (mode invité)
3. Créez un compte pour sauvegarder vos préférences
4. Ajoutez des films à vos listes personnalisées

### Navigation
- **Accueil** : Découvrez les films populaires et tendances
- **Recherche** : Trouvez des films par titre ou genre
- **Profil** : Gérez vos listes et paramètres

## 🏗️ Architecture

```
src/
├── components/          # Composants réutilisables
│   └── MovieCard.js    # Carte d'affichage de film
├── hooks/              # Hooks personnalisés
│   └── useAuth.js      # Gestion de l'authentification
├── navigation/         # Configuration de navigation
│   └── AppNavigator.js # Navigation principale
├── screens/           # Écrans de l'application
│   ├── HomeScreen.js
│   ├── SearchScreen.js
│   ├── ProfileScreen.js
│   ├── AuthScreen.js
│   ├── MovieDetailScreen.js
│   └── MovieListScreen.js
├── services/          # Services externes
│   ├── supabase.js   # Configuration Supabase
│   └── tmdb.js       # Service API TMDB
├── types/            # Types et constantes
│   └── index.js      # Définitions communes
└── utils/            # Utilitaires
```

## 🔧 Scripts disponibles

```bash
# Démarrer en mode développement
npm start

# Lancer sur iOS
npm run ios

# Lancer sur Android
npm run android

# Lancer sur le web
npm run web

# Build de production
expo build:android
expo build:ios
```

## 🎨 Personnalisation

### Couleurs
Modifiez les couleurs dans `src/types/index.js` :
```javascript
export const Colors = {
  PRIMARY: '#E50914',      // Rouge principal
  SECONDARY: '#221F1F',    // Noir secondaire
  BACKGROUND: '#141414',   // Fond noir
  // ...
};
```

### Composants
Tous les composants sont modulaires et personnalisables dans le dossier `src/components/`.

## 🚀 Déploiement

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

### Web
```bash
expo build:web
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Commitez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [TMDB](https://www.themoviedb.org/) pour l'API des films
- [Supabase](https://supabase.com/) pour le backend
- [Expo](https://expo.dev/) pour le framework
- La communauté React Native

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez-nous à : support@grimovies.com

---

**Grimovies** - Découvrez votre prochain film préféré ! 🎬✨ 