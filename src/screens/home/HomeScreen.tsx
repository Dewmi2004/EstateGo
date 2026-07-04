// src/screens/home/HomeScreen.tsx
// Home feed: hero + search, trust strip, categories, featured listings
// (now real CRUD data via propertySlice), why-EstateGo grid, list-your-
// property CTA, how-it-works steps.

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { colors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale, maxContentWidth } from '@/utils/responsive';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchProperties } from '@/redux/property/propertySlice';
import { fetchFavorites, toggleFavorite } from '@/redux/favorite/favoriteSlice';
import SearchBar from '@/components/SearchBar/SearchBar';
import StatBadge from '@/components/StatBadge/StatBadge';
import CategoryChip from '@/components/CategoryChip/CategoryChip';
import PropertyCard from '@/components/PropertyCard/PropertyCard';
import SectionHeader from '@/components/SectionHeader/SectionHeader';
import CTABanner from '@/components/CTABanner/CTABanner';
import { categories, trustStats, whyChoose, howItWorks } from '@/data/mockProperties';

export default function HomeScreen() {
  // Loosely typed: Home lives in the tab navigator and needs to reach into
  // the nested Properties stack, which makes the composite navigation type
  // unwieldy for a screen this simple — see FavoritesScreen for the same
  // pattern.
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: properties } = useAppSelector((state) => state.property);
  const { ids: favoriteIds } = useAppSelector((state) => state.favorite);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchFavorites());
  }, [dispatch]);

  const goToProperties = () => navigation.navigate('PropertiesTab', { screen: 'PropertyList' });
  const goToPropertyDetails = (propertyId: string) =>
    navigation.navigate('PropertiesTab', { screen: 'PropertyDetails', params: { propertyId } });
  const goToAddProperty = () => navigation.navigate('PropertiesTab', { screen: 'AddProperty' });

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { maxWidth: maxContentWidth(), alignSelf: 'center', width: '100%' }]}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroGreeting}>Hi {firstName},</Text>
              <Text style={styles.heroHeadline}>Find your next{'\n'}address</Text>
            </View>
            <View style={styles.bellCircle}>
              <Icon source="bell-outline" size={18} color={colors.textInverse} />
            </View>
          </View>
          <View style={styles.heroDivider} />
          <SearchBar onPress={goToProperties} />
        </View>

        {/* Trust strip — overlaps the hero bottom edge */}
        <View style={styles.statStripWrapper}>
          <StatBadge stats={trustStats} />
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <SectionHeader eyebrow="Browse" title="Property categories" />
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => <CategoryChip category={item} onPress={goToProperties} />}
          />
        </View>

        {/* Featured properties */}
        <View style={styles.section}>
          <SectionHeader eyebrow="Hand-picked" title="Featured properties" actionLabel="View all" onActionPress={goToProperties} />
          <FlatList
            data={properties.slice(0, 6)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.propertyList}
            renderItem={({ item }) => (
              <PropertyCard
                property={item}
                isFavorite={favoriteIds.includes(item.id)}
                onPress={() => goToPropertyDetails(item.id)}
                onToggleFavorite={() => dispatch(toggleFavorite(item.id))}
              />
            )}
          />
        </View>

        {/* Why EstateGo */}
        <View style={styles.section}>
          <SectionHeader eyebrow="The difference" title="Why choose EstateGo" />
          <View style={styles.whyGrid}>
            {whyChoose.map((item) => (
              <View key={item.id} style={styles.whyCard}>
                <View style={styles.whyIconCircle}>
                  <Icon source={item.icon} size={20} color={colors.primary} />
                </View>
                <Text style={styles.whyTitle}>{item.title}</Text>
                <Text style={styles.whyDescription}>{item.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.section}>
          <CTABanner
            title="Have a property to list?"
            description="Reach thousands of verified renters and buyers across Sri Lanka for a one-time LKR 10,000 listing fee."
            buttonLabel="Post Your Property"
            onPress={goToAddProperty}
          />
        </View>

        {/* How it works */}
        <View style={[styles.section, styles.lastSection]}>
          <SectionHeader eyebrow="Getting started" title="How it works" />
          {howItWorks.map((step, index) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepColumn}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>{step.step}</Text>
                </View>
                {index < howItWorks.length - 1 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.stepTextCol}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Hero
  hero: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: moderateScale(20),
    paddingBottom: moderateScale(36),
    paddingHorizontal: moderateScale(20),
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  heroGreeting: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.body),
    color: colors.accentLight,
    marginBottom: 4,
  },
  heroHeadline: {
    fontFamily: fonts.displayBold,
    fontSize: moderateScale(type.display),
    lineHeight: moderateScale(type.display + 4),
    color: colors.textInverse,
  },
  bellCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroDivider: {
    width: 44,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginBottom: 18,
  },

  // Trust strip
  statStripWrapper: {
    paddingHorizontal: moderateScale(20),
    marginTop: -moderateScale(22),
    marginBottom: 8,
  },

  // Sections
  section: {
    paddingHorizontal: moderateScale(20),
    marginTop: moderateScale(28),
  },
  lastSection: {
    marginBottom: 8,
  },
  categoryList: {
    gap: 16,
    paddingRight: 8,
  },
  propertyList: {
    gap: 14,
    paddingRight: 8,
  },

  // Why choose grid
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  whyCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: moderateScale(14),
    borderWidth: 1,
    borderColor: colors.border,
  },
  whyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  whyTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: moderateScale(type.h3),
    color: colors.text,
    marginBottom: 4,
  },
  whyDescription: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.micro),
    color: colors.textMuted,
    lineHeight: moderateScale(16),
  },

  // How it works
  stepRow: {
    flexDirection: 'row',
  },
  stepColumn: {
    alignItems: 'center',
    width: 36,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontFamily: fonts.displaySemiBold,
    fontSize: moderateScale(type.caption),
    color: colors.textInverse,
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  stepTextCol: {
    flex: 1,
    paddingLeft: 14,
    paddingBottom: 20,
  },
  stepTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: moderateScale(type.h3),
    color: colors.text,
    marginBottom: 3,
  },
  stepDescription: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.caption),
    color: colors.textMuted,
    lineHeight: moderateScale(18),
  },
});
