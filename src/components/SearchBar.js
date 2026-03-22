import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  Colors,
  onClear,
  onToggleFilters,
  filterActive,
  rightSlot,
}) => {
  const styles = createStyles(Colors);
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={Colors.TEXT_SECONDARY} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.TEXT_SECONDARY}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear}>
            <Ionicons name="close-circle" size={20} color={Colors.TEXT_SECONDARY} />
          </TouchableOpacity>
        )}
      </View>

      {onToggleFilters && (
        <TouchableOpacity style={styles.filterButton} onPress={onToggleFilters}>
          <Ionicons
            name="options-outline"
            size={20}
            color={filterActive ? Colors.PRIMARY : Colors.TEXT_SECONDARY}
          />
        </TouchableOpacity>
      )}

      {rightSlot}
    </View>
  );
};

const createStyles = (Colors) =>
  StyleSheet.create({
    searchContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 16,
      alignItems: 'center',
    },
    searchInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.CARD_BG,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      color: Colors.TEXT_PRIMARY,
      fontSize: 16,
      marginLeft: 12,
    },
    filterButton: {
      padding: 12,
      backgroundColor: Colors.CARD_BG,
      borderRadius: 12,
      marginRight: 8,
    },
  });

export default SearchBar;
