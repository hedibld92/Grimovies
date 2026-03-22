require('dotenv').config();

const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    plugins: [...(appJson.expo.plugins || []), 'expo-font'],
    extra: {
      ...(appJson.expo.extra || {}),
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      tmdbApiKey: process.env.TMDB_API_KEY || '',
    },
  },
};
