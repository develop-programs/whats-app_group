// Language configuration and translations management
import { getUserLanguagePreference, updateUserLanguagePreference } from './language-storage.js';
import { Language } from './language-types.js';
import { translations } from './translations.js';

// User language preferences storage
const userLanguagePreferences: Map<string, Language> = new Map();

/**
 * Get translated message for a given key.
 */
export function t(key: string, userPhone?: string, defaultLang: Language = 'en'): string {
    let lang = defaultLang;

    if (userPhone) {
        // Try to get from in-memory cache first
        const cached = userLanguagePreferences.get(userPhone);
        if (cached) {
            lang = cached;
        } else {
            // Try to get from persistent storage
            const stored = getUserLanguagePreference(userPhone);
            if (stored) {
                lang = stored;
                userLanguagePreferences.set(userPhone, lang);
            }
        }
    }

    return translations[lang]?.[key] || translations.en[key] || key;
}

/**
 * Set user language preference.
 */
export function setUserLanguage(userPhone: string, language: Language): void {
    userLanguagePreferences.set(userPhone, language);
    updateUserLanguagePreference(userPhone, language);
}

/**
 * Get user language preference.
 */
export function getUserLanguage(userPhone: string): Language {
    const cached = userLanguagePreferences.get(userPhone);
    if (cached) return cached;

    const stored = getUserLanguagePreference(userPhone);
    if (stored) {
        userLanguagePreferences.set(userPhone, stored);
        return stored;
    }

    return 'en';
}

/**
 * Get all user language preferences.
 */
export function getAllUserLanguages(): Map<string, Language> {
    return new Map(userLanguagePreferences);
}
