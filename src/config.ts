// Application configuration constants
export const CONFIG = {
    // Target group name to monitor and manage
    TARGET_GROUP_NAME: 'testing group',

    // Initial participants to add when creating the group (phone numbers with country code)
    INITIAL_PARTICIPANTS: ['+919294512259'],

    // Log file path for activity tracking
    LOG_FILE: 'group_activity.log',

    // Puppeteer configuration for WhatsApp client
    PUPPETEER_ARGS: {
        handleSIGINT: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },

    // Delay for group sync stability (milliseconds)
    GROUP_SYNC_DELAY: 5000,

    // Delay for new group to appear in chat list (milliseconds)
    GROUP_CREATION_DELAY: 3000,

    // Message fetch limit for past activity
    MESSAGE_FETCH_LIMIT: 50,

    // Number of recent logs to show
    RECENT_LOGS_LIMIT: 10,
};
