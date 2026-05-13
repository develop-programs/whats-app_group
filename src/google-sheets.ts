import { google } from 'googleapis';
import { CONFIG } from './config.js';
import fs from 'fs';
import readline from 'readline';

// Global promise to prevent multiple simultaneous auth requests
let authPromise: Promise<any> | null = null;

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
        scope: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file'
        ],
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
 * Gets the authenticated instance for Google APIs.
 */
/**
 * Gets the authenticated instance for Google APIs.
 * Uses a singleton promise to prevent parallel auth flows.
 */
async function getGoogleAuth(): Promise<any> {
    if (authPromise) return authPromise;

    authPromise = (async () => {
        try {
            // Try OAuth2 first
            const oAuth2Client = await getOAuth2Client();
            if (oAuth2Client) {
                console.log('[Google] Using OAuth2 Authentication');
                return oAuth2Client;
            }

            // Fallback to Service Account
            if (!fs.existsSync(CONFIG.GOOGLE_SHEETS_CREDENTIALS_PATH)) {
                console.error('[Google] Error: No OAuth2 credentials in .env AND no credentials.json found.');
                return null;
            }
            
            console.log('[Google] Using Service Account Authentication');
            return new google.auth.GoogleAuth({
                keyFile: CONFIG.GOOGLE_SHEETS_CREDENTIALS_PATH,
                scopes: [
                    'https://www.googleapis.com/auth/spreadsheets',
                    'https://www.googleapis.com/auth/drive.file'
                ],
            });
        } catch (error) {
            console.error('[Google] Authentication error:', error);
            authPromise = null; // Allow retry on error
            return null;
        }
    })();

    return authPromise;
}

/**
 * Proactively checks and triggers OAuth2 flow if needed.
 */
export async function checkGoogleAuth(): Promise<void> {
    await getGoogleAuth();
}

/**
 * Uploads a file to Google Drive and returns the webViewLink.
 */
export async function uploadToGoogleDrive(filePath: string, fileName: string): Promise<string | null> {
    try {
        const auth = await getGoogleAuth();
        if (!auth) return null;

        const drive = google.drive({ version: 'v3', auth: auth as any });

        const fileMetadata: any = {
            name: fileName,
        };

        if (CONFIG.GOOGLE_DRIVE_FOLDER_ID) {
            fileMetadata.parents = [CONFIG.GOOGLE_DRIVE_FOLDER_ID];
        }

        const media = {
            mimeType: 'image/jpeg',
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink',
        });

        const fileId = response.data.id;
        console.log(`[GDrive] File uploaded successfully. ID: ${fileId}`);

        // Make the file readable by anyone with the link (optional, but useful for the sheet)
        try {
            await drive.permissions.create({
                fileId: fileId!,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });
            console.log(`[GDrive] Permissions updated for file: ${fileId}`);
        } catch (permError) {
            console.warn(`[GDrive] Could not set public permissions:`, permError);
        }

        return response.data.webViewLink || null;
    } catch (error) {
        console.error('[GDrive] Error uploading to Google Drive:', error);
        return null;
    }
}

/**
 * Saves registration data to a Google Sheet.
 */
export async function appendToGoogleSheet(data: RegistrationData): Promise<void> {
    try {
        const auth = await getGoogleAuth();
        if (!auth) return;

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
