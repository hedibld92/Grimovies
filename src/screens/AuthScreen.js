import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useColors } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

const AuthScreen = ({ navigation }) => {
  const { signIn, signUp, loading } = useAuth();
  const Colors = useColors();
  const styles = createStyles(Colors);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email.trim(), password);
      } else {
        result = await signIn(email.trim(), password);
      }

      if (result.success) {
        if (isSignUp) {
          Alert.alert(
            'Inscription réussie',
            'Vérifiez votre email pour confirmer votre compte',
            [{ text: 'OK', onPress: () => setIsSignUp(false) }]
          );
        } else {
          navigation.goBack();
        }
      } else {
        Alert.alert('Erreur', result.error);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Logo et titre */}
          <View style={styles.logoSection}>
            <Text style={styles.logo}>🎬</Text>
            <Text style={styles.title}>Grimovies</Text>
            <Text style={styles.subtitle}>
              {isSignUp 
                ? 'Créez votre compte pour découvrir de nouveaux films'
                : 'Connectez-vous pour accéder à vos listes personnalisées'
              }
            </Text>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.TEXT_SECONDARY} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.TEXT_SECONDARY}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.TEXT_SECONDARY} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor={Colors.TEXT_SECONDARY}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={Colors.TEXT_SECONDARY}
                />
              </TouchableOpacity>
            </View>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.TEXT_SECONDARY} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmer le mot de passe"
                  placeholderTextColor={Colors.TEXT_SECONDARY}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Bouton principal */}
            <TouchableOpacity
              style={[styles.authButton, loading && styles.disabledButton]}
              onPress={handleAuth}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.PRIMARY, '#B71C1C']}
                style={styles.buttonGradient}
              >
                <Text style={styles.authButtonText}>
                  {loading 
                    ? 'Chargement...' 
                    : isSignUp 
                      ? 'Créer un compte' 
                      : 'Se connecter'
                  }
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Bouton de changement de mode */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isSignUp 
                  ? 'Vous avez déjà un compte ?' 
                  : 'Vous n\'avez pas de compte ?'
                }
              </Text>
              <TouchableOpacity onPress={toggleAuthMode}>
                <Text style={styles.switchButtonText}>
                  {isSignUp ? 'Se connecter' : 'S\'inscrire'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Mode invité */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.guestButtonText}>
                Continuer sans compte
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 8,
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 56,
  },
  input: {
    flex: 1,
    color: Colors.TEXT_PRIMARY,
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  eyeButton: {
    padding: 8,
  },
  authButton: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  authButtonText: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 14,
    marginRight: 4,
  },
  switchButtonText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  guestButtonText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default AuthScreen; 