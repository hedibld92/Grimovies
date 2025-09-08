import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useColors } from '../hooks/useTheme';
import { Sizes } from '../types';
import { useAuth } from '../hooks/useAuth';

// Import des écrans
import HomeScreen from '../screens/HomeScreen';
import AuthScreen from '../screens/AuthScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MovieDetailScreen from '../screens/MovieDetailScreen';
import MovieListScreen from '../screens/MovieListScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navigation par onglets pour les écrans principaux
const TabNavigator = () => {
  const { isAuthenticated } = useAuth();
  const Colors = useColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarInactiveTintColor: Colors.TEXT_SECONDARY,
        tabBarStyle: {
          backgroundColor: Colors.SECONDARY,
          borderTopColor: Colors.CARD_BG,
          borderTopWidth: 1,
          height: Sizes.TAB_BAR_HEIGHT,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Accueil',
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarLabel: 'Recherche',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: isAuthenticated ? 'Profil' : 'Connexion',
        }}
      />
    </Tab.Navigator>
  );
};

// Navigation principale avec Stack Navigator
const AppNavigator = () => {
  const Colors = useColors();
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.SECONDARY,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: Colors.CARD_BG,
          },
          headerTintColor: Colors.TEXT_PRIMARY,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
          cardStyle: {
            backgroundColor: Colors.BACKGROUND,
          },
        }}
      >
        {/* Écrans principaux avec navigation par onglets */}
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false, title: '' }}
        />
        
        {/* Écrans modaux et de détail */}
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ 
            headerShown: false,
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="MovieDetail"
          component={MovieDetailScreen}
          options={({ route }) => ({
            title: route.params?.movie?.title || route.params?.movie?.name || 'Détails',
            headerBackTitleVisible: false,
          })}
        />
        
        <Stack.Screen
          name="MovieList"
          component={MovieListScreen}
          options={({ route }) => ({
            title: route.params?.title || 'Films',
            headerBackTitleVisible: false,
            headerShown: false,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 