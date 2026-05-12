import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import { parse } from 'csv-parse/sync';
import type {
    Chore,
    FamilyMember,
} from './chores-config.js';
import {
    CHORES_CONFIG,
} from './chores-config.js';

// Initialize CSV files if they don't exist
export function initializeChoresStorage(): void {
    // Initialize chores file
    if (!fs.existsSync(CHORES_CONFIG.CHORES_FILE)) {
        const header = 'id,name,category,assignedTo,priority,status,dueDate,createdDate,completedDate,notes\n';
        fs.writeFileSync(CHORES_CONFIG.CHORES_FILE, header);
    }

    // Initialize family members file
    if (!fs.existsSync(CHORES_CONFIG.FAMILY_MEMBERS_FILE)) {
        const header = 'id,name,phoneNumber,role\n';
        fs.writeFileSync(CHORES_CONFIG.FAMILY_MEMBERS_FILE, header);
    }
}

// Add a new chore to CSV
export function addChore(chore: Chore): void {
    try {
        const csvWriter = createObjectCsvWriter({
            path: CHORES_CONFIG.CHORES_FILE,
            header: [
                { id: 'id', title: 'id' },
                { id: 'name', title: 'name' },
                { id: 'category', title: 'category' },
                { id: 'assignedTo', title: 'assignedTo' },
                { id: 'priority', title: 'priority' },
                { id: 'status', title: 'status' },
                { id: 'dueDate', title: 'dueDate' },
                { id: 'createdDate', title: 'createdDate' },
                { id: 'completedDate', title: 'completedDate' },
                { id: 'notes', title: 'notes' },
            ],
            append: true,
        });

        csvWriter.writeRecords([chore]).catch((err: unknown) => {
            console.error('Error writing chore to CSV:', err);
        });
    } catch (error) {
        console.error('Error adding chore:', error);
    }
}

// Get all chores from CSV
export function getAllChores(): Chore[] {
    try {
        if (!fs.existsSync(CHORES_CONFIG.CHORES_FILE)) {
            return [];
        }

        const fileContent = fs.readFileSync(CHORES_CONFIG.CHORES_FILE, 'utf8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
        });

        return records.slice(1); // Skip header
    } catch (error) {
        console.error('Error reading chores:', error);
        return [];
    }
}

// Get chores by status
export function getChoresByStatus(status: string): Chore[] {
    const allChores = getAllChores();
    return allChores.filter((chore: any) => chore.status === status);
}

// Get chores assigned to a person
export function getChoresForPerson(personName: string): Chore[] {
    const allChores = getAllChores();
    return allChores.filter((chore: any) =>
        chore.assignedTo.toLowerCase() === personName.toLowerCase()
    );
}

// Update chore status
export function updateChoreStatus(choreId: string, newStatus: string): void {
    try {
        const allChores = getAllChores();
        const updatedChores = allChores.map((chore: any) => {
            if (chore.id === choreId) {
                chore.status = newStatus;
                if (newStatus === 'completed') {
                    chore.completedDate = new Date().toISOString().split('T')[0];
                }
            }
            return chore;
        });

        // Rewrite the entire file
        const csvWriter = createObjectCsvWriter({
            path: CHORES_CONFIG.CHORES_FILE,
            header: [
                { id: 'id', title: 'id' },
                { id: 'name', title: 'name' },
                { id: 'category', title: 'category' },
                { id: 'assignedTo', title: 'assignedTo' },
                { id: 'priority', title: 'priority' },
                { id: 'status', title: 'status' },
                { id: 'dueDate', title: 'dueDate' },
                { id: 'createdDate', title: 'createdDate' },
                { id: 'completedDate', title: 'completedDate' },
                { id: 'notes', title: 'notes' },
            ],
        });

        csvWriter.writeRecords(updatedChores).catch((err: unknown) => {
            console.error('Error updating chore status:', err);
        });
    } catch (error) {
        console.error('Error updating chore:', error);
    }
}

// Add family member
export function addFamilyMember(member: FamilyMember): void {
    try {
        const csvWriter = createObjectCsvWriter({
            path: CHORES_CONFIG.FAMILY_MEMBERS_FILE,
            header: [
                { id: 'id', title: 'id' },
                { id: 'name', title: 'name' },
                { id: 'phoneNumber', title: 'phoneNumber' },
                { id: 'role', title: 'role' },
            ],
            append: true,
        });

        csvWriter.writeRecords([member]).catch((err: unknown) => {
            console.error('Error writing family member to CSV:', err);
        });
    } catch (error) {
        console.error('Error adding family member:', error);
    }
}

// Get all family members
export function getAllFamilyMembers(): FamilyMember[] {
    try {
        if (!fs.existsSync(CHORES_CONFIG.FAMILY_MEMBERS_FILE)) {
            return [];
        }

        const fileContent = fs.readFileSync(CHORES_CONFIG.FAMILY_MEMBERS_FILE, 'utf8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
        });

        return records.slice(1); // Skip header
    } catch (error) {
        console.error('Error reading family members:', error);
        return [];
    }
}

// Get family member by name
export function getFamilyMemberByName(name: string): FamilyMember | undefined {
    const members = getAllFamilyMembers();
    return members.find((member: any) =>
        member.name.toLowerCase() === name.toLowerCase()
    );
}
