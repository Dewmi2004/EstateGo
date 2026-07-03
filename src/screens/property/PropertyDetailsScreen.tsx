// src/screens/property/PropertyDetailsScreen.tsx
// Read (single) + entry points for Update/Delete when the logged-in user
// owns the listing.

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, Linking } from 'react-native';
import { Text, Icon, ActivityIndicator } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PropertyStackParamList } from '@/navigation/PropertyNavigator';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchPropertyById, deleteProperty, clearSelected } from '@/redux/property/propertySlice';
import { toggleFavorite } from '@/redux/favorite/favoriteSlice';
import Button from '@/components/Button/Button';
import { colors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';

type Props = NativeStackScreenProps<PropertyStackParamList, 'PropertyDetails'>;

function formatPrice(price: number): string {
  return `৳ ${price.toLocaleString()}/mo`;
}

export default function PropertyDetailsScreen({ route, navigation }: Props) {
  const { propertyId } = route.params;
  const dispatch = useAppDispatch();
  const { selected: property, isLoading, isDeleting } = useAppSelector((state) => state.property);
  const { ids: favoriteIds } = useAppSelector((state) => state.favorite);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchPropertyById(propertyId));
    return () => {
      dispatch(clearSelected());
    };
  }, [dispatch, propertyId]);

  if (isLoading || !property) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const isOwner = user?.id === property.ownerId;
  const isFavorite = favoriteIds.includes(property.id);

  const handleDelete = () => {
    Alert.alert('Delete listing', `Remove "${property.title}" permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await dispatch(deleteProperty(property.id));
          navigation.goBack();
        },
      },
    ]);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${property.contactNumber}`).catch(() => {
      Alert.alert('Unable to open dialer');
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: property.image }} style={styles.image} resizeMode="cover" />

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={10}>
            <Icon source="arrow-left" size={20} color={colors.textInverse} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => dispatch(toggleFavorite(property.id))}
            hitSlop={10}
          >
            <Icon
              source={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.error : colors.textInverse}
            />
          </TouchableOpacity>

          {property.verified && (
            <View style={styles.verifiedBadge}>
              <Icon source="check-decagram" size={13} color={colors.textInverse} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{property.title}</Text>
            <Text style={styles.statusPill}>{property.status}</Text>
          </View>

          <View style={styles.locationRow}>
            <Icon source="map-marker-outline" size={15} color={colors.textMuted} />
            <Text style={styles.location}>
              {property.location}, {property.city}
            </Text>
          </View>

          <Text style={styles.price}>{formatPrice(property.price)}</Text>

          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Icon source="bed-outline" size={18} color={colors.primary} />
              <Text style={styles.specText}>{property.bedrooms} Bed</Text>
            </View>
            <View style={styles.specItem}>
              <Icon source="shower" size={18} color={colors.primary} />
              <Text style={styles.specText}>{property.bathrooms} Bath</Text>
            </View>
            <View style={styles.specItem}>
              <Icon source="ruler-square" size={18} color={colors.primary} />
              <Text style={styles.specText}>{property.area} sqft</Text>
            </View>
            <View style={styles.specItem}>
              <Icon source="home-city-outline" size={18} color={colors.primary} />
              <Text style={styles.specText}>{property.propertyType}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{property.description}</Text>

          <Text style={styles.sectionTitle}>Owner</Text>
          <View style={styles.ownerRow}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerAvatarText}>{property.ownerName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ownerName}>{property.ownerName}</Text>
              <Text style={styles.ownerContact}>{property.contactNumber}</Text>
            </View>
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Icon source="phone" size={18} color={colors.textInverse} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isOwner ? (
          <>
            <Button
              label="Edit"
              mode="outlined"
              onPress={() => navigation.navigate('EditProperty', { propertyId: property.id })}
              style={styles.footerButton}
            />
            <Button
              label="Delete"
              mode="contained"
              color={colors.error}
              loading={isDeleting}
              onPress={handleDelete}
              style={styles.footerButton}
            />
          </>
        ) : (
          <Button label="Contact Owner" mode="contained" onPress={handleCall} style={styles.footerButton} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: moderateScale(280),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: moderateScale(48),
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(11, 31, 58, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: moderateScale(48),
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(11, 31, 58, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  verifiedText: {
    color: colors.textInverse,
    fontFamily: fonts.bodySemiBold,
    fontSize: moderateScale(type.micro),
  },
  body: {
    padding: moderateScale(20),
    paddingBottom: moderateScale(120),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: fonts.displayBold,
    fontSize: moderateScale(type.h1),
    color: colors.text,
  },
  statusPill: {
    fontFamily: fonts.bodySemiBold,
    fontSize: moderateScale(type.micro),
    color: colors.textMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  location: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.caption),
    color: colors.textMuted,
  },
  price: {
    fontFamily: fonts.displayBold,
    fontSize: moderateScale(type.h1),
    color: colors.primary,
    marginTop: 14,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    marginTop: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    fontFamily: fonts.bodyMedium,
    fontSize: moderateScale(type.caption),
    color: colors.text,
  },
  sectionTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: moderateScale(type.h3),
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.body),
    color: colors.textMuted,
    lineHeight: moderateScale(21),
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  ownerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerAvatarText: {
    color: colors.textInverse,
    fontFamily: fonts.displaySemiBold,
    fontSize: moderateScale(type.h3),
  },
  ownerName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: moderateScale(type.caption),
    color: colors.text,
  },
  ownerContact: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.micro),
    color: colors.textMuted,
    marginTop: 2,
  },
  callButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: moderateScale(16),
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    flex: 1,
  },
});
