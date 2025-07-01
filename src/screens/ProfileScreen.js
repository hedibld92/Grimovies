import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useColors } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import userListsService from '../services/userLists';
import ThemeToggle from '../components/ThemeToggle';

const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const Colors = useColors();
  const styles = createStyles(Colors);
  const [userStats, setUserStats] = useState({
    watchlistCount: 0,
    favoritesCount: 0,
    watchedCount: 0,
    reviewsCount: 0
  });
  const [userLists, setUserLists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  // Rafraîchir les données quand l'écran devient actif
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && user) {
        console.log('🔄 ProfileScreen actif - Rafraîchissement des données...');
        loadUserData();
      }
    }, [isAuthenticated, user])
  );

  const loadUserData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('📊 Chargement des données utilisateur...');

      // Charger les listes
      let lists = await userListsService.getUserLists(user.id);
      console.log('📋 Listes trouvées:', lists.length);

      // Créer les listes par défaut si elles n'existent pas
      if (lists.length === 0) {
        console.log('🔨 Création des listes par défaut...');
        try {
          await Promise.all([
            userListsService.createList(user.id, 'À voir', 'Films que je veux regarder', 'watchlist'),
            userListsService.createList(user.id, 'Mes favoris', 'Mes films préférés', 'favorites'),
            userListsService.createList(user.id, 'Films vus', 'Films que j\'ai déjà regardés', 'watched')
          ]);
          // Recharger les listes
          lists = await userListsService.getUserLists(user.id);
          console.log('✅ Listes par défaut créées:', lists.length);
        } catch (createError) {
          console.error('❌ Erreur création listes:', createError);
        }
      }

      setUserLists(lists);

      // Charger les statistiques
      const [favorites, watched, reviews] = await Promise.all([
        userListsService.getUserFavorites(user.id),
        userListsService.getUserWatched(user.id),
        userListsService.getUserReviews(user.id)
      ]);

      // Trouver la liste "À voir"
      const watchlist = lists.find(list => list.name === 'À voir');
      let watchlistMovies = [];
      if (watchlist) {
        const watchlistData = await userListsService.getListWithMovies(watchlist.id);
        watchlistMovies = watchlistData.movies || [];
      }

      setUserStats({
        watchlistCount: watchlistMovies.length,
        favoritesCount: favorites.length,
        watchedCount: watched.length,
        reviewsCount: reviews.length
      });

      console.log('✅ Données utilisateur chargées:', {
        lists: lists.length,
        favorites: favorites.length,
        watched: watched.length,
        reviews: reviews.length
      });

    } catch (error) {
      console.error('❌ Erreur lors du chargement des données utilisateur:', error);
      Alert.alert('Erreur', 'Impossible de charger vos données');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            const result = await signOut();
            if (result.success) {
              Alert.alert('Succès', 'Vous avez été déconnecté');
            }
          }
        }
      ]
    );
  };

  const handleNavigateToList = (listType) => {
    if (!user?.id) return;

    // Trouver la liste correspondante
    let listData = null;
    let listTitle = '';

    switch (listType) {
      case 'watchlist':
        listData = userLists.find(list => list.name === 'À voir');
        listTitle = 'Ma liste de visionnage';
        break;
      case 'favorites':
        listTitle = 'Mes favoris';
        // Pour les favoris, on passe un type spécial
        navigation.navigate('MovieList', {
          listType: 'favorites',
          listTitle,
          userId: user.id
        });
        return;
      case 'watched':
        listTitle = 'Films vus';
        navigation.navigate('MovieList', {
          listType: 'watched',
          listTitle,
          userId: user.id
        });
        return;
      case 'reviews':
        listTitle = 'Mes critiques';
        navigation.navigate('MovieList', {
          listType: 'reviews',
          listTitle,
          userId: user.id
        });
        return;
    }

    if (listData) {
      navigation.navigate('MovieList', {
        listId: listData.id,
        listTitle: listData.name,
                  listType: 'watchlist'
      });
    }
  };

  const renderGuestView = () => (
    <View style={styles.guestContainer}>
      <View style={styles.guestContent}>
        <Ionicons name="person-outline" size={80} color={Colors.TEXT_SECONDARY} />
        <Text style={styles.guestTitle}>Connectez-vous</Text>
        <Text style={styles.guestSubtitle}>
          Créez un compte pour sauvegarder vos films favoris, créer des listes personnalisées et suivre votre historique de visionnage.
        </Text>
        
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate('Auth')}
        >
          <LinearGradient
            colors={[Colors.PRIMARY, '#B71C1C']}
            style={styles.buttonGradient}
          >
            <Text style={styles.signInButtonText}>Se connecter</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.guestFeatures}>
        <Text style={styles.featuresTitle}>Fonctionnalités disponibles :</Text>
        {[
          'Listes de films personnalisées',
          'Historique de visionnage',
          'Recommandations personnalisées',
          'Synchronisation entre appareils'
        ].map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.SUCCESS} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderUserView = () => (
    <ScrollView style={styles.userContainer}>
      {/* Profil utilisateur */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={40} color={Colors.TEXT_PRIMARY} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.email || 'Utilisateur'}</Text>
          <Text style={styles.userEmail}>Membre depuis {new Date().getFullYear()}</Text>
        </View>
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Mes statistiques</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="bookmark-outline" size={24} color={Colors.PRIMARY} />
            <Text style={styles.statNumber}>{userStats.watchlistCount}</Text>
            <Text style={styles.statLabel}>À voir</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="heart-outline" size={24} color={Colors.ERROR} />
            <Text style={styles.statNumber}>{userStats.favoritesCount}</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color={Colors.SUCCESS} />
            <Text style={styles.statNumber}>{userStats.watchedCount}</Text>
            <Text style={styles.statLabel}>Vus</Text>
          </View>
        </View>
      </View>

      {/* Mes listes */}
      <View style={styles.listsContainer}>
        <Text style={styles.sectionTitle}>Mes listes</Text>
        
        {[
          { 
            title: 'Ma liste de visionnage', 
            icon: 'bookmark', 
            count: userStats.watchlistCount,
            type: 'watchlist'
          },
          { 
            title: 'Mes favoris', 
            icon: 'heart', 
            count: userStats.favoritesCount,
            type: 'favorites'
          },
          { 
            title: 'Films vus', 
            icon: 'checkmark-circle', 
            count: userStats.watchedCount,
            type: 'watched'
          },
          { 
            title: 'Mes critiques', 
            icon: 'chatbubble-outline', 
            count: userStats.reviewsCount,
            type: 'reviews'
          }
        ].map((list, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.listItem}
            onPress={() => handleNavigateToList(list.type)}
          >
            <View style={styles.listIcon}>
              <Ionicons name={list.icon} size={20} color={Colors.PRIMARY} />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>{list.title}</Text>
              <Text style={styles.listCount}>{list.count} éléments</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.TEXT_SECONDARY} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Paramètres */}
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Paramètres</Text>
        
        {/* Toggle de thème */}
        <ThemeToggle style={styles.themeToggle} />
        
        {[
          { title: 'Notifications', icon: 'notifications-outline' },
          { title: 'Confidentialité', icon: 'shield-outline' },
          { title: 'À propos', icon: 'information-circle-outline' },
          { title: 'Aide', icon: 'help-circle-outline' }
        ].map((setting, index) => (
          <TouchableOpacity key={index} style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name={setting.icon} size={20} color={Colors.TEXT_SECONDARY} />
            </View>
            <Text style={styles.settingTitle}>{setting.title}</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.TEXT_SECONDARY} />
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={Colors.ERROR} />
          <Text style={styles.signOutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isAuthenticated ? renderUserView() : renderGuestView()}
    </SafeAreaView>
  );
};

const createStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  
  // Styles pour l'affichage invité
  guestContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  guestContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  guestTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginTop: 24,
    marginBottom: 16,
  },
  guestSubtitle: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  signInButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  signInButtonText: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '600',
  },
  guestFeatures: {
    paddingBottom: 40,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    marginLeft: 12,
  },
  
  // Styles pour l'affichage utilisateur connecté
  userContainer: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.CARD_BG,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  
  // Statistiques
  statsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.CARD_BG,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
  
  // Listes
  listsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  listCount: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  
  // Paramètres
  settingsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  themeToggle: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.CARD_BG,
  },
  settingIcon: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 16,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    color: Colors.TEXT_PRIMARY,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
  },
  signOutText: {
    fontSize: 16,
    color: Colors.ERROR,
    marginLeft: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen; 