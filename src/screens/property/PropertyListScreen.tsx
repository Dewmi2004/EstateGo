// src/screens/property/PropertyListScreen.tsx
// Read (List) + Search/Filter from the CRUD set, plus the entry point into
// Create (FAB -> AddProperty) and Update/Delete (via PropertyDetailsScreen).

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Icon } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PropertyStackParamList } from '@/navigation/PropertyNavigator';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchProperties } from '@/redux/property/propertySlice';
import { fetchFavorites, toggleFavorite } from '@/redux/favorite/favoriteSlice';
import PropertyCard from '@/components/PropertyCard/PropertyCard';
import ChipSelector from '@/components/ChipSelector/ChipSelector';
import Input from '@/components/Input/Input';
import EmptyState from '@/components/EmptyState/EmptyState';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';
import { PropertyType } from '@/types/property.types';

type Props = NativeStackScreenProps<PropertyStackParamList, 'PropertyList'>;

const TYPE_OPTIONS: { label: string; value: PropertyType | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'House', value: 'House' },
  { label: 'Flat', value: 'Flat' },
  { label: 'Room', value: 'Room' },
  { label: 'Office', value: 'Office' },
  { label: 'Shop', value: 'Shop' },
  { label: 'Land', value: 'Land' },
];

export default function PropertyListScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((state) => state.property);
  const { ids: favoriteIds } = useAppSelector((state) => state.favorite);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'All'>('All');
  const [refreshing, setRefreshing] = useState(false);

  const loadProperties = useCallback(() => {
    dispatch(
      fetchProperties({
        search: search.trim() || undefined,
        propertyType: typeFilter === 'All' ? undefined : typeFilter,
      })
    );
  }, [dispatch, search, typeFilter]);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  // Re-fetch whenever search or type filter changes (lightly debounced).
  useEffect(() => {
    const timeout = setTimeout(loadProperties, 300);
    return () => clearTimeout(timeout);
  }, [loadProperties]);

  const onRefresh = async () => {
    setRefreshing(true);
    loadProperties();
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Properties</Text>
        <Input
          label="Search location or title"
          value={search}
          onChangeText={setSearch}
          icon="magnify"
          testID="property-search-input"
        />
        <ChipSelector
          options={TYPE_OPTIONS}
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as PropertyType | 'All')}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="home-search-outline"
              title="No properties found"
              description="Try a different search term or category."
            />
          ) : null
        }
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            width="100%"
            isFavorite={favoriteIds.includes(item.id)}
            onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
            onToggleFavorite={() => dispatch(toggleFavorite(item.id))}
          />
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AddProperty')}
        testID="add-property-fab"
      >
        <Icon source="plus" size={24} color={colors.textInverse} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(16),
    paddingBottom: 4,
    gap: 8,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: moderateScale(type.h1),
    color: colors.text,
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: 100,
    gap: 14,
  },
  fab: {
    position: 'absolute',
    right: moderateScale(20),
    bottom: moderateScale(24),
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
