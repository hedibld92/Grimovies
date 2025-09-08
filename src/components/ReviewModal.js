import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks/useTheme';
import StarRating from './StarRating';

const ReviewModal = ({ 
  visible, 
  onClose, 
  onSubmit, 
  movie, 
  existingReview = null 
}) => {
  const Colors = useColors();
  const styles = createStyles(Colors);
  
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setRating(existingReview?.rating || 0);
      setReviewText(existingReview?.review_text || '');
    }
  }, [visible, existingReview]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Note requise', 'Veuillez donner une note au film.');
      return;
    }

    if (reviewText.trim().length < 10) {
      Alert.alert('Critique trop courte', 'Votre critique doit contenir au moins 10 caractères.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        rating,
        reviewText: reviewText.trim(),
        movieData: {
          id: movie.id,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          overview: movie.overview,
          release_date: movie.release_date || movie.first_air_date,
          vote_average: movie.vote_average
        }
      });
      
      Alert.alert(
        'Succès', 
        existingReview ? 'Votre critique a été mise à jour !' : 'Votre critique a été ajoutée !',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('❌ Erreur soumission critique:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder votre critique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(existingReview?.rating || 0);
    setReviewText(existingReview?.review_text || '');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={Colors.TEXT_PRIMARY} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {existingReview ? 'Modifier la critique' : 'Écrire une critique'}
            </Text>
            <TouchableOpacity 
              style={[styles.submitButton, (!rating || isSubmitting) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!rating || isSubmitting}
            >
              <Text style={[styles.submitButtonText, (!rating || isSubmitting) && styles.submitButtonTextDisabled]}>
                {isSubmitting ? 'Envoi...' : 'Publier'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Film info */}
          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle} numberOfLines={2}>
              {movie?.title || movie?.name}
            </Text>
            <Text style={styles.movieYear}>
              {movie?.release_date ? new Date(movie.release_date).getFullYear() : 
               movie?.first_air_date ? new Date(movie.first_air_date).getFullYear() : ''}
            </Text>
          </View>

          {/* Notation */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Votre note</Text>
            <View style={styles.ratingContainer}>
              <StarRating 
                rating={rating}
                onRatingChange={setRating}
                size={32}
              />
              <Text style={styles.ratingText}>
                {rating > 0 ? `${rating}/10` : 'Pas de note'}
              </Text>
            </View>
          </View>

          {/* Critique */}
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Votre critique</Text>
            <TextInput
              style={styles.reviewInput}
              placeholder="Partagez votre avis sur ce film..."
              placeholderTextColor={Colors.TEXT_SECONDARY}
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={6}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {reviewText.length}/500 caractères
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
    paddingTop: 60, // Pour la safe area
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  submitButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.TEXT_SECONDARY,
    opacity: 0.5,
  },
  submitButtonText: {
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
    fontSize: 14,
  },
  submitButtonTextDisabled: {
    color: Colors.TEXT_SECONDARY,
  },
  movieInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  movieYear: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
  },
  ratingSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.ACCENT,
  },
  reviewSection: {
    padding: 20,
  },
  reviewInput: {
    backgroundColor: Colors.SURFACE,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.TEXT_PRIMARY,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  characterCount: {
    textAlign: 'right',
    marginTop: 8,
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
});

export default ReviewModal; 