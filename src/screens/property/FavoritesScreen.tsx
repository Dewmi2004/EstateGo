// src/screens/property/FavoritesScreen.tsx
// Favorites list — reads the full Property objects for whichever ids are in
// favoriteSlice, filtering from whatever's already loaded in propertySlice
// (fetching the full list first if it's empty).

import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchProperties } from '@/redux/property/propertySlice';
import { fetchFavorites, toggleFavorite } from '@/redux/favorite/favoriteSlice';
import PropertyCard from '@/components/PropertyCard/PropertyCard';
import EmptyState from '@/components/EmptyState/EmptyState';
import { colors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';

export default function FavoritesScreen() {
  // Loosely typed on purpose: Favorites is a sibling tab to the Properties
  // stack, so navigating into PropertyDetails means reaching across tabs —
  // React Navigation's cross-tab composite types get unwieldy for a screen
  // this simple, so we navigate by name/params directly.
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.property);
  const { ids: favoriteIds, isLoading } = useAppSelector((state) => state.favorite);

  useEffect(() => {
    dispatch(fetchFavorites());
    if (items.length === 0) {
      dispatch(fetchProperties());
    }
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const favoriteProperties = items.filter((p) => favoriteIds.includes(p.id));

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <Text style={styles.title}>Favorites</Text>
      <FlatList
        data={favoriteProperties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="heart-outline"
              title="No favorites yet"
              description="Tap the heart on any listing to save it here."
            />
          ) : null
        }
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            width="100%"
            isFavorite
            onPress={() =>
              navigation.navigate('PropertiesTab', { screen: 'PropertyDetails', params: { propertyId: item.id } })
            }
            onToggleFavorite={() => dispatch(toggleFavorite(item.id))}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: moderateScale(16),
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: moderateScale(type.h1),
    color: colors.text,
    paddingHorizontal: moderateScale(20),
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: 40,
    gap: 14,
  },
});
