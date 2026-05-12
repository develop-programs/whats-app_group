// User registration state tracking
export type RegistrationStep = 'name' | 'phone' | 'profession' | 'subProfession';

// Map to track users in registration process
const usersInRegistration: Map<string, RegistrationStep> = new Map();

// Map to store partial registration data
const registrationData: Map<string, { name?: string; phone?: string; profession?: string; subProfession?: string }> = new Map();

// Check if user is in registration flow
export function isUserRegistering(userPhone: string): boolean {
    return usersInRegistration.has(userPhone);
}

// Get current registration step for user
export function getUserRegistrationStep(userPhone: string): RegistrationStep | null {
    return usersInRegistration.get(userPhone) || null;
}

// Start registration for user
export function startUserRegistration(userPhone: string, startStep: RegistrationStep = 'name'): void {
    usersInRegistration.set(userPhone, startStep);
    registrationData.set(userPhone, {});
}

// Move to next registration step
export function moveToNextStep(userPhone: string): void {
    const currentStep = usersInRegistration.get(userPhone);
    if (currentStep === 'phone') {
        usersInRegistration.set(userPhone, 'name');
    } else if (currentStep === 'name') {
        usersInRegistration.set(userPhone, 'profession');
    } else if (currentStep === 'profession') {
        usersInRegistration.set(userPhone, 'subProfession');
    }
}

// Get registration data
export function getRegistrationData(userPhone: string): { name?: string; phone?: string; profession?: string; subProfession?: string } | null {
    return registrationData.get(userPhone) || null;
}

// Store registration data
export function storeRegistrationData(userPhone: string, step: RegistrationStep, value: string): void {
    const data = registrationData.get(userPhone) || {};
    if (step === 'name') {
        data.name = value;
    } else if (step === 'phone') {
        data.phone = value;
    } else if (step === 'profession') {
        data.profession = value;
    } else if (step === 'subProfession') {
        data.subProfession = value;
    }
    registrationData.set(userPhone, data);
}

// Complete registration and clean up
export function completeUserRegistration(userPhone: string): { name?: string; phone?: string; profession?: string; subProfession?: string } | null {
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
