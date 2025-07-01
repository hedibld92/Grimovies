import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@grimovies_users';
const CURRENT_USER_KEY = '@grimovies_current_user';

// Service d'authentification local (fallback)
export const localAuthService = {
  // Obtenir tous les utilisateurs stockés
  async getStoredUsers() {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Erreur lors de la lecture des utilisateurs:', error);
      return [];
    }
  },

  // Sauvegarder les utilisateurs
  async saveUsers(users) {
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
    }
  },

  // Inscription locale
  async signUp(email, password) {
    try {
      console.log('🏠 Inscription locale pour:', email);
      
      const users = await this.getStoredUsers();
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return {
          data: null,
          error: { message: 'Un compte avec cet email existe déjà' }
        };
      }

      // Créer un nouvel utilisateur
      const newUser = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        password, // En production, il faudrait hasher le mot de passe
        created_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString() // Confirmation automatique
      };

      users.push(newUser);
      await this.saveUsers(users);

      // Créer une session
      const session = {
        access_token: `local_token_${newUser.id}`,
        user: {
          id: newUser.id,
          email: newUser.email,
          created_at: newUser.created_at,
          email_confirmed_at: newUser.email_confirmed_at
        }
      };

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session));

      console.log('✅ Inscription locale réussie');
      return {
        data: {
          user: session.user,
          session
        },
        error: null
      };
    } catch (error) {
      console.error('❌ Erreur inscription locale:', error);
      return {
        data: null,
        error: { message: error.message }
      };
    }
  },

  // Connexion locale
  async signIn(email, password) {
    try {
      console.log('🏠 Connexion locale pour:', email);
      
      const users = await this.getStoredUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return {
          data: null,
          error: { message: 'Email ou mot de passe incorrect' }
        };
      }

      // Créer une session
      const session = {
        access_token: `local_token_${user.id}`,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at
        }
      };

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(session));

      console.log('✅ Connexion locale réussie');
      return {
        data: {
          user: session.user,
          session
        },
        error: null
      };
    } catch (error) {
      console.error('❌ Erreur connexion locale:', error);
      return {
        data: null,
        error: { message: error.message }
      };
    }
  },

  // Déconnexion locale
  async signOut() {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      return { error: null };
    } catch (error) {
      return { error: { message: error.message } };
    }
  },

  // Obtenir l'utilisateur actuel
  async getCurrentUser() {
    try {
      const sessionJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (sessionJson) {
        const session = JSON.parse(sessionJson);
        return session.user;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  },

  // Simuler onAuthStateChange
  onAuthStateChange(callback) {
    // Pour le moment, on appelle juste une fois au démarrage
    this.getCurrentUser().then(user => {
      if (user) {
        callback('SIGNED_IN', { user });
      } else {
        callback('SIGNED_OUT', null);
      }
    });

    // Retourner un objet avec unsubscribe
    return {
      data: {
        subscription: {
          unsubscribe: () => console.log('Local auth unsubscribed')
        }
      }
    };
  }
}; 