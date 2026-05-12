import { google } from 'googleapis';
import { CONFIG } from './config.js';
import fs from 'fs';

export async function saveRegistrationToSheet(data: { name?: string; phone?: string; profession?: string; subProfession?: string; date?: string }): Promise<void> {
    try {
        if (!CONFIG.GOOGLE_SHEET_ID) {
            console.log('[SHEETS] No Google Sheet ID configured. Skipping sheet update.');
            return;
        }

        if (!fs.existsSync(CONFIG.GOOGLE_SHEETS_CREDENTIALS_PATH)) {
            console.error(`[SHEETS] Credentials file not found at ${CONFIG.GOOGLE_SHEETS_CREDENTIALS_PATH}. Skipping sheet update.`);
            return;
        }

        const auth = new google.auth.GoogleAuth({
            keyFile: CONFIG.GOOGLE_SHEETS_CREDENTIALS_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Append the data to the first sheet (assumes the sheet has headers: Date, Name, Phone, Profession, Specialization)
        await sheets.spreadsheets.values.append({
            spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
            range: 'Sheet1!A:E',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [
                        data.date || new Date().toISOString(),
                        data.name || '',
                        data.phone || '',
                        data.profession || '',
                        data.subProfession || ''
                    ]
                ]
            }
        });

        console.log(`[SHEETS] Successfully appended registration for ${data.name} to Google Sheets.`);
    } catch (error) {
        console.error('[SHEETS] Error saving data to Google Sheets:', error);
    }
}
