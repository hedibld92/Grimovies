import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LIST_ROWS = [
  { title: 'Ma liste de visionnage', icon: 'bookmark', key: 'watchlist' },
  { title: 'Mes favoris', icon: 'heart', key: 'favorites' },
  { title: 'Films vus', icon: 'checkmark-circle', key: 'watched' },
  { title: 'Mes critiques', icon: 'chatbubble-outline', key: 'reviews' },
];

const ListManager = ({ Colors, userStats, onNavigateToList }) => {
  const styles = createStyles(Colors);
  const counts = {
    watchlist: userStats.watchlistCount,
    favorites: userStats.favoritesCount,
    watched: userStats.watchedCount,
    reviews: userStats.reviewsCount,
  };

  return (
    <>
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

      <View style={styles.listsContainer}>
        <Text style={styles.sectionTitle}>Mes listes</Text>
        {LIST_ROWS.map((row) => (
          <TouchableOpacity
            key={row.key}
            style={styles.listItem}
            onPress={() => onNavigateToList(row.key)}
          >
            <View style={styles.listIcon}>
              <Ionicons name={row.icon} size={20} color={Colors.PRIMARY} />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>{row.title}</Text>
              <Text style={styles.listCount}>{counts[row.key]} éléments</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.TEXT_SECONDARY} />
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

const createStyles = (Colors) =>
  StyleSheet.create({
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
  });

export default ListManager;
