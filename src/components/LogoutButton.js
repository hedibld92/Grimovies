import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

const LogoutButton = ({ style, size = 24, showConfirmation = true }) => {
  const Colors = useColors();
  const { signOut } = useAuth();
  const styles = createStyles(Colors);

  const handleLogout = async () => {
    if (showConfirmation) {
      Alert.alert(
        'Déconnexion',
        'Voulez-vous vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Déconnexion', 
            style: 'destructive',
            onPress: performLogout
          }
        ]
      );
    } else {
      performLogout();
    }
  };

  const performLogout = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        Alert.alert('Succès', 'Vous avez été déconnecté');
      } else {
        Alert.alert('Erreur', 'Impossible de se déconnecter');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleLogout}
      activeOpacity={0.7}
    >
      <Ionicons name="log-out-outline" size={size} color={Colors.ERROR} />
    </TouchableOpacity>
  );
};

const createStyles = (Colors) => StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.ERROR + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default LogoutButton; 