import { v4 as uuidv4 } from 'uuid';
import type {
    Chore,
    FamilyMember,
    ChoreCategory,
    Priority,
} from './chores-config.js';
import {
    SAMPLE_CHORES,
    CHORE_CATEGORIES,
} from './chores-config.js';
import {
    addChore,
    getAllChores,
    getChoresByStatus,
    getChoresForPerson,
    updateChoreStatus,
    addFamilyMember,
    getAllFamilyMembers,
} from './chores-storage.js';

// Create a new chore
export function createChore(
    name: string,
    category: ChoreCategory,
    assignedTo: string,
    priority: Priority,
    dueDate: string,
    notes?: string
): Chore {
    const chore: Chore = {
        id: uuidv4(),
        name,
        category,
        assignedTo,
        priority,
        status: 'pending',
        dueDate,
        createdDate: new Date().toISOString().split('T')[0] || '',
        notes,
    };

    addChore(chore);
    return chore;
}

// Register a family member
export function registerFamilyMember(
    name: string,
    phoneNumber: string,
    role: string
): FamilyMember {
    const member: FamilyMember = {
        id: uuidv4(),
        name,
        phoneNumber,
        role,
    };

    addFamilyMember(member);
    return member;
}

// Get pending chores
export function getPendingChores(): Chore[] {
    return getChoresByStatus('pending');
}

// Get completed chores
export function getCompletedChores(): Chore[] {
    return getChoresByStatus('completed');
}

// Get in-progress chores
export function getInProgressChores(): Chore[] {
    return getChoresByStatus('in-progress');
}

// Get chores due today
export function getChoresToday(): Chore[] {
    const today = new Date().toISOString().split('T')[0];
    const allChores = getAllChores();
    return allChores.filter((chore: any) => chore.dueDate === today);
}

// Get chores due this week
export function getChoresThisWeek(): Chore[] {
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split('T')[0] || '';
    const weekStr = weekFromNow.toISOString().split('T')[0] || '';

    const allChores = getAllChores();
    return allChores.filter((chore: any) =>
        chore.dueDate >= todayStr && chore.dueDate <= weekStr && chore.status !== 'completed'
    );
}

// Get overdue chores
export function getOverdueChores(): Chore[] {
    const today = new Date().toISOString().split('T')[0] || '';
    const allChores = getAllChores();
    return allChores.filter((chore: any) =>
        chore.dueDate < today && chore.status !== 'completed'
    );
}

// Mark chore as in-progress
export function markChoreInProgress(choreId: string): void {
    updateChoreStatus(choreId, 'in-progress');
}

// Mark chore as completed
export function markChoreCompleted(choreId: string): void {
    updateChoreStatus(choreId, 'completed');
}

// Get statistics
export function getChoreStatistics() {
    const allChores = getAllChores();
    const pending = getChoresByStatus('pending').length;
    const completed = getCompletedChores().length;
    const inProgress = getInProgressChores().length;
    const overdue = getOverdueChores().length;

    return {
        total: allChores.length,
        pending,
        completed,
        inProgress,
        overdue,
        completionRate: allChores.length > 0
            ? Math.round((completed / allChores.length) * 100)
            : 0,
    };
}

// Get summary for a person
export function getPersonChoresSummary(personName: string) {
    const chores = getChoresForPerson(personName);
    const pending = chores.filter((c: any) => c.status === 'pending').length;
    const completed = chores.filter((c: any) => c.status === 'completed').length;
    const inProgress = chores.filter((c: any) => c.status === 'in-progress').length;

    return {
        total: chores.length,
        pending,
        completed,
        inProgress,
        chores,
    };
}

// Format chore for display
export function formatChoreForDisplay(chore: any): string {
    const categoryName = CHORE_CATEGORIES[chore.category as ChoreCategory] || chore.category;
    return `Chore: ${chore.name}\n` +
        `Category: ${categoryName}\n` +
        `Assigned to: ${chore.assignedTo}\n` +
        `Priority: ${chore.priority}\n` +
        `Status: ${chore.status}\n` +
        `Due Date: ${chore.dueDate}\n` +
        `Notes: ${chore.notes || 'None'}`;
}

// Generate weekly chore plan
export function generateWeeklyPlan(): string {
    const chores = getChoresThisWeek();

    if (chores.length === 0) {
        return 'No chores scheduled for this week.';
    }

    let plan = 'WEEKLY CHORE PLAN\n' +
        '=================\n\n';

    const choresByDate: Record<string, any[]> = {};
    chores.forEach((chore: any) => {
        if (!choresByDate[chore.dueDate]) {
            choresByDate[chore.dueDate] = [];
        }
        choresByDate[chore.dueDate].push(chore);
    });

    Object.keys(choresByDate).sort().forEach(date => {
        plan += `Date: ${date}\n`;
        const dateChores = choresByDate[date];
        if (dateChores) {
            dateChores.forEach((chore: any) => {
                plan += `  - ${chore.name} [${chore.priority}] assigned to ${chore.assignedTo}\n`;
            });
        }
        plan += '\n';
    });

    return plan;
}

// Get all available chore suggestions for a category
export function getChoresForCategory(category: ChoreCategory): string[] {
    return SAMPLE_CHORES[category] || [];
}

// Get all family member names
export function getFamilyMemberNames(): string[] {
    const members = getAllFamilyMembers();
    return members.map((m: any) => m.name);
}
