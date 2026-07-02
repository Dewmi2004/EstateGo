// src/utils/responsive.ts
// Simple responsive scaling helpers based on a 375x812 design baseline (iPhone X).
//
// IMPORTANT: on web, Dimensions.get('window') returns the full browser
// window width (could be 1920px+), which would massively inflate every
// moderateScale() result — fonts, padding, icons all render far too large.
// EFFECTIVE_WIDTH/HEIGHT cap what's used for the scale math on web so the
// UI renders at native-app proportions instead of desktop-website scale.

import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: RAW_WIDTH, height: RAW_HEIGHT } = Dimensions.get('window');

const WEB_WIDTH_CAP = 480;
const WEB_HEIGHT_CAP = 900;

const EFFECTIVE_WIDTH = Platform.OS === 'web' ? Math.min(RAW_WIDTH, WEB_WIDTH_CAP) : RAW_WIDTH;
const EFFECTIVE_HEIGHT = Platform.OS === 'web' ? Math.min(RAW_HEIGHT, WEB_HEIGHT_CAP) : RAW_HEIGHT;

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/** Scale a size horizontally based on effective screen width. */
export const wp = (size: number): number => (EFFECTIVE_WIDTH / BASE_WIDTH) * size;

/** Scale a size vertically based on effective screen height. */
export const hp = (size: number): number => (EFFECTIVE_HEIGHT / BASE_HEIGHT) * size;

/**
 * Moderate scale: scales a value but dampens the effect by `factor`
 * so text/spacing doesn't grow too aggressively on large tablets or web.
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  const scale = EFFECTIVE_WIDTH / BASE_WIDTH;
  return size + (scale - 1) * size * factor;
};

/** Returns true when the current window is wide enough to be treated as a tablet. */
export const isTablet = (): boolean => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;
  return Math.min(width, height) >= 600 && aspectRatio < 1.6;
};

/** Clamp content width on large screens so forms don't stretch edge to edge. */
export const maxContentWidth = (): number => {
  const { width } = Dimensions.get('window');
  return width > 600 ? 480 : width;
};

export const pixelRatio = PixelRatio.get();

export const screen = {
  width: RAW_WIDTH,
  height: RAW_HEIGHT,
};