import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useColors } from '../hooks/useColors';
import { Sizes } from '../types';
import { useAuth } from '../hooks/useAuth';
import userListsService from '../services/userLists';
import ThemeToggle from '../components/ThemeToggle';
import LogoutButton from '../components/LogoutButton';
import Logo from '../components/Logo';
import ListManager from '../components/ListManager';

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
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

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
      {/* Header avec bouton déconnexion */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <LogoutButton />
      </View>
      
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

      <ListManager
        Colors={Colors}
        userStats={userStats}
        onNavigateToList={handleNavigateToList}
      />

      {/* Paramètres */}
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Paramètres</Text>
        
        {/* Toggle de thème */}
        <ThemeToggle style={styles.themeToggle} />
        
        <TouchableOpacity style={styles.settingItem} onPress={() => setShowPrivacyModal(true)}>
          <View style={styles.settingIcon}>
            <Ionicons name="shield-outline" size={20} color={Colors.TEXT_SECONDARY} />
          </View>
          <Text style={styles.settingTitle}>Confidentialité</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.TEXT_SECONDARY} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => setShowAboutModal(true)}>
          <View style={styles.settingIcon}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.TEXT_SECONDARY} />
          </View>
          <Text style={styles.settingTitle}>À propos</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.TEXT_SECONDARY} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => setShowHelpModal(true)}>
          <View style={styles.settingIcon}>
            <Ionicons name="help-circle-outline" size={20} color={Colors.TEXT_SECONDARY} />
          </View>
          <Text style={styles.settingTitle}>Aide</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.TEXT_SECONDARY} />
        </TouchableOpacity>
        

      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {isAuthenticated ? renderUserView() : renderGuestView()}
      
      {/* Modal Confidentialité */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confidentialité</Text>
            <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
              <Ionicons name="close" size={24} color={Colors.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Logo size={80} style={styles.modalLogo} />
            
            <Text style={styles.modalSectionTitle}>🔒 Protection de vos données</Text>
            <Text style={styles.modalText}>
              Grimovies respecte votre vie privée. Vos données personnelles sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers.
            </Text>
            
            <Text style={styles.modalSectionTitle}>📊 Données collectées</Text>
            <Text style={styles.modalText}>
              • Email (pour l'authentification){'\n'}
              • Listes de films (favoris, à voir, vus){'\n'}
              • Critiques et notes{'\n'}
              • Préférences d'affichage
            </Text>
            
            <Text style={styles.modalSectionTitle}>🛡️ Sécurité</Text>
            <Text style={styles.modalText}>
              Toutes vos données sont chiffrées et protégées par Supabase. Vous pouvez supprimer votre compte à tout moment.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
      
      {/* Modal À propos */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>À propos</Text>
            <TouchableOpacity onPress={() => setShowAboutModal(false)}>
              <Ionicons name="close" size={24} color={Colors.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Logo size={100} style={styles.modalLogo} />
            
            <Text style={styles.modalAppName}>Grimovies</Text>
            <Text style={styles.modalVersion}>Version 1.0.0</Text>
            
            <Text style={styles.modalSectionTitle}>🎬 Votre compagnon cinéma</Text>
            <Text style={styles.modalText}>
              Grimovies est votre application de référence pour découvrir, organiser et critiquer vos films préférés. Explorez un catalogue infini de films et séries grâce à l'API TMDB.
            </Text>
            
            <Text style={styles.modalSectionTitle}>✨ Fonctionnalités</Text>
            <Text style={styles.modalText}>
              • Découverte de films et séries{'\n'}
              • Gestion de listes personnalisées{'\n'}
              • Système de favoris{'\n'}
              • Critiques et notes{'\n'}
              • Thème sombre/clair{'\n'}
              • Recherche avancée
            </Text>
            
            <Text style={styles.modalSectionTitle}>👨‍💻 Développé avec ❤️</Text>
            <Text style={styles.modalText}>
              Créé avec React Native, Expo et Supabase pour vous offrir la meilleure expérience cinéma possible.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
      
      {/* Modal Aide */}
      <Modal
        visible={showHelpModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Aide</Text>
            <TouchableOpacity onPress={() => setShowHelpModal(false)}>
              <Ionicons name="close" size={24} color={Colors.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Logo size={80} style={styles.modalLogo} />
            
            <Text style={styles.modalSectionTitle}>🎯 Comment utiliser Grimovies</Text>
            
            <Text style={styles.modalSubTitle}>🔍 Recherche</Text>
            <Text style={styles.modalText}>
              Utilisez la barre de recherche pour trouver vos films préférés. Filtrez par genre, année ou note.
            </Text>
            
            <Text style={styles.modalSubTitle}>📋 Listes</Text>
            <Text style={styles.modalText}>
              • ❤️ Favoris : Vos films coup de cœur{'\n'}
              • 📺 À voir : Films que vous voulez regarder{'\n'}
              • ✅ Vus : Films que vous avez regardés
            </Text>
            
            <Text style={styles.modalSubTitle}>⭐ Notes et critiques</Text>
            <Text style={styles.modalText}>
              Notez vos films de 1 à 10 étoiles et rédigez vos critiques personnelles.
            </Text>
            
            <Text style={styles.modalSubTitle}>🎨 Thème</Text>
            <Text style={styles.modalText}>
              Basculez entre le mode sombre et clair selon vos préférences.
            </Text>
            
            <Text style={styles.modalSectionTitle}>❓ Besoin d'aide ?</Text>
            <Text style={styles.modalText}>
              Si vous rencontrez un problème, redémarrez l'application ou reconnectez-vous.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    paddingTop: Sizes.STATUS_BAR_PADDING,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
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
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 16,
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
  
  // Styles des modales
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalLogo: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  modalAppName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalVersion: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginTop: 20,
    marginBottom: 12,
  },
  modalSubTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default ProfileScreen; 