// User registration state tracking for Hindustaan Seva
export type RegistrationStep = 
    | 'name' 
    | 'aadhaar' 
    | 'trade' 
    | 'experience' 
    | 'availability' 
    | 'selfie' 
    | 'review';

// Map to track users in registration process
const usersInRegistration: Map<string, RegistrationStep> = new Map();

// Map to store partial registration data
const registrationData: Map<string, { 
    name?: string; 
    phone?: string; 
    aadhaar?: string;
    trade?: string;
    experience?: string;
    availability?: string;
    selfiePath?: string;
}> = new Map();

// Check if user is in registration flow
export function isUserRegistering(userPhone: string): boolean {
    return usersInRegistration.has(userPhone);
}

// Get current registration step for user
export function getUserRegistrationStep(userPhone: string): RegistrationStep | null {
    return usersInRegistration.get(userPhone) || null;
}

// Start registration for user
export function startUserRegistration(userPhone: string): void {
    usersInRegistration.set(userPhone, 'name');
    registrationData.set(userPhone, {});
}

// Move to next registration step
export function moveToNextStep(userPhone: string): void {
    const steps: RegistrationStep[] = ['name', 'aadhaar', 'trade', 'experience', 'availability', 'selfie', 'review'];
    const currentStep = usersInRegistration.get(userPhone);
    if (!currentStep) return;

    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex >= 0 && currentIndex < steps.length - 1) {
        usersInRegistration.set(userPhone, steps[currentIndex + 1]);
    }
}

// Get registration data
export function getRegistrationData(userPhone: string) {
    return registrationData.get(userPhone) || null;
}

// Store registration data
export function storeRegistrationData(userPhone: string, step: RegistrationStep, value: string): void {
    const data = registrationData.get(userPhone) || {};
    (data as any)[step] = value;
    registrationData.set(userPhone, data);
}

// Complete registration and clean up
export function completeUserRegistration(userPhone: string) {
    const data = registrationData.get(userPhone);
    usersInRegistration.delete(userPhone);
    registrationData.delete(userPhone);
    return data || null;
}

// Clear registration for user
export function clearUserRegistration(userPhone: string): void {
    usersInRegistration.delete(userPhone);
    registrationData.delete(userPhone);
}
