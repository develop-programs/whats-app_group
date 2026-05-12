// Household chores configuration and types
export type ChoreCategory = 'cleaning' | 'laundry' | 'cooking' | 'gardening' | 'babysitting';

export type Priority = 'high' | 'medium' | 'low';

export type ChoreStatus = 'pending' | 'in-progress' | 'completed';

export interface Chore {
    id: string;
    name: string;
    category: ChoreCategory;
    assignedTo: string;
    priority: Priority;
    status: ChoreStatus;
    dueDate: string;
    createdDate: string;
    completedDate?: string;
    notes?: string;
}

export interface FamilyMember {
    id: string;
    name: string;
    phoneNumber: string;
    role: string;
}

export const CHORE_CATEGORIES: Record<ChoreCategory, string> = {
    cleaning: 'Cleaning (sweeping, mopping, dusting)',
    laundry: 'Laundry (washing, drying, ironing)',
    cooking: 'Cooking (meal prep, cooking, dishes)',
    gardening: 'Gardening (watering, weeding, lawn care)',
    babysitting: 'Babysitting and childcare',
};

export const PRIORITY_LEVELS: Priority[] = ['high', 'medium', 'low'];

export const CHORE_STATUSES: ChoreStatus[] = ['pending', 'in-progress', 'completed'];

// Sample chores for different categories
export const SAMPLE_CHORES: Record<ChoreCategory, string[]> = {
    cleaning: [
        'Sweep the living room',
        'Mop the kitchen floor',
        'Dust the furniture',
        'Clean the bathroom',
        'Vacuum the carpets',
        'Clean the windows',
    ],
    laundry: [
        'Wash bed sheets',
        'Fold the clothes',
        'Iron the shirts',
        'Wash delicates',
        'Dry clean items',
    ],
    cooking: [
        'Prepare breakfast',
        'Cook dinner',
        'Wash dishes',
        'Meal prep for the week',
        'Organize the pantry',
    ],
    gardening: [
        'Water the plants',
        'Weed the garden',
        'Mow the lawn',
        'Prune the bushes',
        'Water the flowers',
    ],
    babysitting: [
        'Help with homework',
        'Prepare children for bed',
        'Play with kids',
        'Pack school bags',
    ],
};

// Configuration
export const CHORES_CONFIG = {
    // CSV file to store chores
    CHORES_FILE: 'chores.csv',

    // CSV file to store family members
    FAMILY_MEMBERS_FILE: 'family_members.csv',

    // Reminder interval in hours
    REMINDER_INTERVAL: 24,

    // How many days in advance to show upcoming chores
    UPCOMING_DAYS: 7,
};
