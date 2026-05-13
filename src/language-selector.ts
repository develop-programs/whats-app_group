// Language selection state tracking
import { setUserLanguage } from './language.js';
import { Language } from './language-types.js';

// Map to track users waiting for language selection
const usersWaitingForLanguage: Map<string, boolean> = new Map();

// Check if user is awaiting language selection
export function isWaitingForLanguageSelection(userPhone: string): boolean {
    return usersWaitingForLanguage.get(userPhone) || false;
}

// Mark user as waiting for language selection
export function markUserWaitingForLanguage(userPhone: string): void {
    usersWaitingForLanguage.set(userPhone, true);
}

// Remove user from waiting list
export function removeUserFromWaitingList(userPhone: string): void {
    usersWaitingForLanguage.delete(userPhone);
}

// Handle language selection response
export function handleLanguageSelection(userPhone: string, response: string): Language | null {
    const normalized = response.toLowerCase().trim();

    if (normalized === '1' || normalized === 'english' || normalized === 'en') {
        setUserLanguage(userPhone, 'en');
        removeUserFromWaitingList(userPhone);
        return 'en';
    } else if (normalized === '2' || normalized === 'hindi' || normalized === 'hi' || normalized === 'हिंदी') {
        setUserLanguage(userPhone, 'hi');
        removeUserFromWaitingList(userPhone);
        return 'hi';
    }

    return null;
}

// Get all users waiting for language
export function getAllUsersWaitingForLanguage(): string[] {
    return Array.from(usersWaitingForLanguage.keys());
}
