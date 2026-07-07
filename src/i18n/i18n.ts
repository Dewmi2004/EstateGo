// src/i18n/i18n.ts
// Lightweight in-house i18n (no external library needed): a dictionary per
// language plus a dotted-path lookup, wired to the redux `settings.language`
// value via useTranslation().

import { useAppSelector } from '@/hooks/redux';
import { en, TranslationDict } from './translations/en';
import { si } from './translations/si';
import { ta } from './translations/ta';

export type LanguageCode = 'en' | 'si' | 'ta';

export const languages: { code: LanguageCode; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
];

const dictionaries: Record<LanguageCode, TranslationDict> = { en, si, ta };

function resolve(dict: TranslationDict, path: string): string {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
  return typeof value === 'string' ? value : path;
}

// Translate a dotted key (e.g. "settings.title") using an explicit language,
// for use outside components (services, thunks).
export function translate(language: LanguageCode, path: string): string {
  return resolve(dictionaries[language] ?? en, path);
}

// Translate using whatever language is currently selected in settings.
export function useTranslation() {
  const language = useAppSelector((state) => state.settings.language);
  const t = (path: string) => translate(language, path);
  return { t, language };
}
