import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AuthForm = ({
  Colors,
  isSignUp,
  email,
  password,
  confirmPassword,
  showPassword,
  loading,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onToggleShowPassword,
  onSubmit,
  onToggleMode,
  onGuest,
}) => {
  const styles = createStyles(Colors);
  return (
    <View style={styles.form}>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color={Colors.TEXT_SECONDARY} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.TEXT_SECONDARY}
          value={email}
          onChangeText={onEmailChange}
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
          onChangeText={onPasswordChange}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggleShowPassword} style={styles.eyeButton}>
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
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
            onChangeText={onConfirmPasswordChange}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.authButton, loading && styles.disabledButton]}
        onPress={onSubmit}
        disabled={loading}
      >
        <LinearGradient colors={[Colors.PRIMARY, '#B71C1C']} style={styles.buttonGradient}>
          <Text style={styles.authButtonText}>
            {loading ? 'Chargement...' : isSignUp ? 'Créer un compte' : 'Se connecter'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>
          {isSignUp ? 'Vous avez déjà un compte ?' : "Vous n'avez pas de compte ?"}
        </Text>
        <TouchableOpacity onPress={onToggleMode}>
          <Text style={styles.switchButtonText}>{isSignUp ? 'Se connecter' : "S'inscrire"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.guestButton} onPress={onGuest}>
        <Text style={styles.guestButtonText}>Continuer sans compte</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (Colors) =>
  StyleSheet.create({
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

export default AuthForm;
