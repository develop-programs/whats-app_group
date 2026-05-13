import { google } from 'googleapis';
import { CONFIG } from './src/config.js';

async function test() {
    try {
        console.log('Testing Google API initialization...');
        const auth = new google.auth.OAuth2(
            CONFIG.GOOGLE_CLIENT_ID,
            CONFIG.GOOGLE_CLIENT_SECRET,
            CONFIG.GOOGLE_REDIRECT_URI
        );
        console.log('OAuth2 Client created');
        
        const drive = google.drive({ version: 'v3', auth });
        console.log('Drive API initialized');
        
        const sheets = google.sheets({ version: 'v4', auth });
        console.log('Sheets API initialized');
        
        console.log('Success!');
    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
