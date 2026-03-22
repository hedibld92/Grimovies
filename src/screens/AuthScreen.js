import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks/useColors';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import AuthForm from '../components/AuthForm';

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
            <Logo size={120} />
            <Text style={styles.title}>Grimovies</Text>
            <Text style={styles.subtitle}>
              {isSignUp 
                ? 'Créez votre compte pour découvrir de nouveaux films'
                : 'Connectez-vous pour accéder à vos listes personnalisées'
              }
            </Text>
          </View>

          <AuthForm
            Colors={Colors}
            isSignUp={isSignUp}
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            showPassword={showPassword}
            loading={loading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onToggleShowPassword={() => setShowPassword(!showPassword)}
            onSubmit={handleAuth}
            onToggleMode={toggleAuthMode}
            onGuest={() => navigation.goBack()}
          />
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
});

export default AuthScreen; 