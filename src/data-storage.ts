import fs from 'fs';
import { CONFIG } from './config.js';

// Function to save actual registration data to a dedicated local CSV file
export function saveLocalData(data: { name: string; phone: string; profession: string; subProfession: string }): void {
    const timestamp = new Date().toLocaleString();
    const headers = 'Date,Name,Phone,Profession,Specialization\n';
    
    // Safely format CSV columns to prevent commas from breaking the format
    const row = [
        `"${timestamp}"`,
        `"${data.name.replace(/"/g, '""')}"`,
        `"${data.phone}"`,
        `"${data.profession}"`,
        `"${data.subProfession}"`
    ].join(',') + '\n';

    try {
        if (!fs.existsSync(CONFIG.DATA_FILE)) {
            // Write headers if file doesn't exist
            fs.writeFileSync(CONFIG.DATA_FILE, headers);
        }
        
        fs.appendFileSync(CONFIG.DATA_FILE, row);
        console.log(`[DATA] Saved actual registration data locally to ${CONFIG.DATA_FILE}`);
    } catch (error) {
        console.error('[DATA] Error writing to data file:', error);
    }
}
