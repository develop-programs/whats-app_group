import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Language } from './language-types.js';

const LANGUAGE_PREFS_FILE = join(process.cwd(), 'language_preferences.json');

// Type for stored preferences
interface LanguagePreferences {
    [userPhone: string]: Language;
}

// Load language preferences from file
export function loadLanguagePreferences(): LanguagePreferences {
    try {
        if (existsSync(LANGUAGE_PREFS_FILE)) {
            const data = readFileSync(LANGUAGE_PREFS_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading language preferences:', error);
    }
    return {};
}

// Save language preferences to file
export function saveLanguagePreferences(preferences: LanguagePreferences): void {
    try {
        writeFileSync(LANGUAGE_PREFS_FILE, JSON.stringify(preferences, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving language preferences:', error);
    }
}

// Add or update a user's language preference
export function updateUserLanguagePreference(userPhone: string, language: Language): void {
    const prefs = loadLanguagePreferences();
    prefs[userPhone] = language;
    saveLanguagePreferences(prefs);
}

// Get a user's language preference
export function getUserLanguagePreference(userPhone: string): Language | null {
    const prefs = loadLanguagePreferences();
    return prefs[userPhone] || null;
}

// Get all preferences
export function getAllLanguagePreferences(): LanguagePreferences {
    return loadLanguagePreferences();
}
