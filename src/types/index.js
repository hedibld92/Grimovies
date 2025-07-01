// Types pour les films et séries
export const MediaType = {
  MOVIE: 'movie',
  TV: 'tv'
};

// Types pour les listes utilisateur
export const ListType = {
  WATCHLIST: 'watchlist',
  FAVORITES: 'favorites',
  WATCHED: 'watched',
  CUSTOM: 'custom'
};

// Types pour les filtres
export const SortBy = {
  POPULARITY_DESC: 'popularity.desc',
  POPULARITY_ASC: 'popularity.asc',
  RATING_DESC: 'vote_average.desc',
  RATING_ASC: 'vote_average.asc',
  RELEASE_DATE_DESC: 'release_date.desc',
  RELEASE_DATE_ASC: 'release_date.asc',
  TITLE_ASC: 'title.asc',
  TITLE_DESC: 'title.desc'
};

// Genres de films populaires
export const MovieGenres = {
  ACTION: 28,
  ADVENTURE: 12,
  ANIMATION: 16,
  COMEDY: 35,
  CRIME: 80,
  DOCUMENTARY: 99,
  DRAMA: 18,
  FAMILY: 10751,
  FANTASY: 14,
  HISTORY: 36,
  HORROR: 27,
  MUSIC: 10402,
  MYSTERY: 9648,
  ROMANCE: 10749,
  SCIENCE_FICTION: 878,
  THRILLER: 53,
  WAR: 10752,
  WESTERN: 37
};

// Utilitaires pour les données
export const formatters = {
  // Formater la date de sortie
  formatReleaseDate: (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Formater la durée en minutes
  formatRuntime: (minutes) => {
    if (!minutes) return 'Durée inconnue';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  },

  // Formater la note
  formatRating: (rating) => {
    if (!rating) return '0.0';
    return rating.toFixed(1);
  },

  // Formater les genres
  formatGenres: (genres) => {
    if (!genres || genres.length === 0) return 'Genres inconnus';
    return genres.map(genre => genre.name).join(', ');
  },

  // Tronquer le texte
  truncateText: (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
};

// Constantes pour l'interface (DEPRECATED - utiliser useColors() à la place)
export const Colors = {
  PRIMARY: '#E50914',      // Rouge Netflix
  SECONDARY: '#221F1F',    // Noir foncé
  BACKGROUND: '#141414',   // Noir de fond
  CARD_BG: '#2F2F2F',     // Gris foncé pour les cartes
  SURFACE: '#1F1F1F',     // Surface pour les éléments
  TEXT_PRIMARY: '#FFFFFF', // Blanc pour le texte principal
  TEXT_SECONDARY: '#B3B3B3', // Gris pour le texte secondaire
  BORDER: '#333333',       // Bordures
  ACCENT: '#FFD700',       // Or pour les étoiles/notes
  SUCCESS: '#46D369',      // Vert pour les succès
  WARNING: '#FF9500',      // Orange pour les avertissements
  ERROR: '#FF375F',        // Rouge pour les erreurs
  SHADOW: 'rgba(0, 0, 0, 0.3)',
  OVERLAY: 'rgba(0, 0, 0, 0.7)',
};

export const Sizes = {
  HEADER_HEIGHT: 60,
  TAB_BAR_HEIGHT: 80,
  CARD_HEIGHT: 200,
  POSTER_WIDTH: 120,
  POSTER_HEIGHT: 180,
  BACKDROP_HEIGHT: 200
}; 