import fs from 'fs';
import { CONFIG } from './config.js';

// Log activity to file with timestamp
export function logActivity(activity: string): void {
    const timestamp = new Date().toLocaleString();
    const logEntry = `[${timestamp}] ${activity}\n`;

    try {
        fs.appendFileSync(CONFIG.LOG_FILE, logEntry);
    } catch (error) {
        console.error('Error writing to log file:', error);
    }
}

// Read recent logs from file
export function getRecentLogs(limit: number = CONFIG.RECENT_LOGS_LIMIT): string[] {
    try {
        if (!fs.existsSync(CONFIG.LOG_FILE)) {
            return [];
        }

        const logs = fs.readFileSync(CONFIG.LOG_FILE, 'utf8')
            .split('\n')
            .filter(Boolean);

        return logs.slice(-limit);
    } catch (error) {
        console.error('Error reading log file:', error);
        return [];
    }
}

// Check if log file exists
export function logFileExists(): boolean {
    return fs.existsSync(CONFIG.LOG_FILE);
}
