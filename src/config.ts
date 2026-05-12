// Application configuration constants
export const CONFIG = {
    // Target group name to monitor and manage
    TARGET_GROUP_NAME: 'Hello My Group',

    // Initial participants to add when creating the group (phone numbers with country code)
    INITIAL_PARTICIPANTS: ['+917470449162'],

    // Log file path for activity tracking
    LOG_FILE: 'group_activity.log',

    // Local file path for saving actual registration data
    DATA_FILE: 'registrations.csv',

    // Puppeteer configuration for WhatsApp client
    PUPPETEER_ARGS: {
        handleSIGINT: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        protocolTimeout: 0, 
    },

    // Delay for group sync stability (milliseconds)
    GROUP_SYNC_DELAY: 5000,

    // Delay for new group to appear in chat list (milliseconds)
    GROUP_CREATION_DELAY: 3000,

    // Message fetch limit for past activity
    MESSAGE_FETCH_LIMIT: 50,

    // Number of recent logs to show
    RECENT_LOGS_LIMIT: 10,

    // Google Sheets Configuration
    GOOGLE_SHEET_ID: '1b6e_UMO3dRx1yrZK2EKEuw4HwsWUBd75OuLO8Q8R5E0',
    GOOGLE_SHEETS_CREDENTIALS_PATH: 'credentials.json',
};
