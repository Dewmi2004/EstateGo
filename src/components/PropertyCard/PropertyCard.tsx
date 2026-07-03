// src/components/PropertyCard/PropertyCard.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { colors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';
import { Property } from '@/types/property.types';

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  width?: number | '100%';
}

function formatPrice(price: number): string {
  return `৳ ${price.toLocaleString()}/mo`;
}

export default function PropertyCard({
  property,
  onPress,
  onToggleFavorite,
  isFavorite = false,
  width,
}: PropertyCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, width ? { width } : undefined]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: property.image }} style={styles.image} resizeMode="cover" />

        {property.verified && (
          <View style={styles.verifiedBadge}>
            <Icon source="check-decagram" size={12} color={colors.textInverse} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}

        {property.status !== 'Available' && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{property.status}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.favoriteButton} onPress={onToggleFavorite} hitSlop={8}>
          <Icon
            source={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            color={isFavorite ? colors.error : colors.textInverse}
          />
        </TouchableOpacity>

        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{formatPrice(property.price)}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>
        <View style={styles.locationRow}>
          <Icon source="map-marker-outline" size={13} color={colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>
            {property.location}, {property.city}
          </Text>
        </View>

        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Icon source="bed-outline" size={14} color={colors.primary} />
            <Text style={styles.specText}>{property.bedrooms} Bed</Text>
          </View>
          <View style={styles.specItem}>
            <Icon source="shower" size={14} color={colors.primary} />
            <Text style={styles.specText}>{property.bathrooms} Bath</Text>
          </View>
          <View style={styles.specItem}>
            <Icon source="ruler-square" size={14} color={colors.primary} />
            <Text style={styles.specText}>{property.area} sqft</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: moderateScale(240),
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  imageWrapper: {
    width: '100%',
    height: moderateScale(140),
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    color: colors.textInverse,
    fontFamily: fonts.bodySemiBold,
    fontSize: moderateScale(type.micro - 1),
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(11, 31, 58, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 44,
    right: 8,
    backgroundColor: colors.text,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    color: colors.textInverse,
    fontFamily: fonts.bodySemiBold,
    fontSize: moderateScale(type.micro - 1),
  },
  priceTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  priceText: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
    fontSize: moderateScale(type.caption),
  },
  body: {
    padding: moderateScale(12),
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: moderateScale(type.h3),
    color: colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 10,
  },
  location: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.caption),
    color: colors.textMuted,
    flexShrink: 1,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  specText: {
    fontFamily: fonts.bodyMedium,
    fontSize: moderateScale(type.micro),
    color: colors.text,
  },
});
