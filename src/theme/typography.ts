// src/theme/typography.ts
// Poppins carries headlines (confident, geometric — used with restraint, never
// for body copy). Inter carries everything a person has to actually read:
// labels, prices, descriptions. Loaded via useAppFonts() in App.tsx.

export const fonts = {
  displayBold: 'Poppins_700Bold',
  displaySemiBold: 'Poppins_600SemiBold',
  displayMedium: 'Poppins_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
};

// Base type scale (pass through moderateScale() at the call site for
// tablet-aware sizing — kept as raw numbers here so it's one source of truth).
export const type = {
  display: 26,   // hero headline
  h1: 20,        // screen title
  h2: 17,        // section title
  h3: 14,        // card title
  body: 13,       // default copy
  caption: 11,    // meta text, labels
  micro: 10,       // badges, tags
};
