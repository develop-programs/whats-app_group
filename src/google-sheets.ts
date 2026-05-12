import { google } from 'googleapis';
import { CONFIG } from './config.js';
import fs from 'fs';
import readline from 'readline';

export interface RegistrationData {
    date?: string;
    name: string;
    phone: string;
    aadhaar: string;
    trade: string;
    experience: string;
    availability: string;
    selfiePath: string;
}

/**
 * Gets an authenticated OAuth2 client.
 */
async function getOAuth2Client() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_TOKENS_PATH } = CONFIG;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return null;
    }

    const oAuth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
    );

    // Check if we have previously stored a token.
    if (fs.existsSync(GOOGLE_TOKENS_PATH)) {
        const token = fs.readFileSync(GOOGLE_TOKENS_PATH, 'utf-8');
        oAuth2Client.setCredentials(JSON.parse(token));
        return oAuth2Client;
    }

    // If no token, we need to get one. 
    // NOTE: In a server environment, this part is tricky.
    // We'll print the URL and expect the user to provide the code.
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('\n--- GOOGLE SHEETS AUTHORIZATION REQUIRED ---');
    console.log('Authorize this app by visiting this url:', authUrl);
    console.log('After authorizing, you will be redirected to localhost. Copy the "code" parameter from the URL.');
    console.log('Example: http://localhost/?code=4/0AfgeX... -> Your code is 4/0AfgeX...');
    console.log('--------------------------------------------\n');

    // This is a blocking call during the first run.
    // In a real bot, you might want to handle this differently.
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) {
                    console.error('Error while trying to retrieve access token', err);
                    resolve(null);
                    return;
                }
                if (token) {
                    oAuth2Client.setCredentials(token);
                    // Store the token to disk for later program executions
                    fs.writeFileSync(GOOGLE_TOKENS_PATH, JSON.stringify(token));
                    console.log('Token stored to', GOOGLE_TOKENS_PATH);
                    resolve(oAuth2Client);
                } else {
                    resolve(null);
                }
            });
        });
    });
}

/**
 * Saves registration data to a Google Sheet.
 */
export async function appendToGoogleSheet(data: RegistrationData): Promise<void> {
    try {
        let auth: any;

        // Try OAuth2 first
        const oAuth2Client = await getOAuth2Client();
        if (oAuth2Client) {
            auth = oAuth2Client;
            console.log('[GSheet] Using OAuth2 Authentication');
        } else {
            // Fallback to Service Account
            if (!fs.existsSync(CONFIG.GOOGLE_SHEETS_CREDENTIALS_PATH)) {
                console.error('[GSheet] Error: No OAuth2 credentials in .env AND no credentials.json found.');
                return;
            }
            console.log('[GSheet] Using Service Account Authentication');
            auth = new google.auth.GoogleAuth({
                keyFile: CONFIG.GOOGLE_SHEETS_CREDENTIALS_PATH,
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
        }

        const sheets = google.sheets({ version: 'v4', auth });

        await sheets.spreadsheets.values.append({
            spreadsheetId: CONFIG.GOOGLE_SHEET_ID,
            range: 'Sheet1!A:H',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [
                        data.date || new Date().toLocaleString(),
                        data.name || '',
                        data.phone || '',
                        data.aadhaar || '',
                        data.trade || '',
                        data.experience || '',
                        data.availability || '',
                        data.selfiePath || ''
                    ]
                ]
            },
        });

        console.log('[GSheet] Data successfully appended to Google Sheet');
    } catch (error) {
        console.error('[GSheet] Error appending to Google Sheet:', error);
    }
}
