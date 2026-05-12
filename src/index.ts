// Entry point for the WhatsApp Registration Bot
import { t } from './language.js'; // Import language first to initialize translations
import { initializeClient, destroyClient } from './client.js';
import {
    setupQRHandler,
    setupAuthenticationHandlers,
    setupReadyHandler,
    setupMessageHandler,
    setupGroupJoinHandler,
    setupGroupLeaveHandler,
    setupGroupUpdateHandler,
    setupDisconnectHandler,
} from './event-handlers.js';

// Initialize WhatsApp client
console.log(t('system.initializingClient'));
const client = initializeClient();

// Setup all event handlers
setupQRHandler(client);
setupAuthenticationHandlers(client);
setupReadyHandler(client);
setupMessageHandler(client);
setupGroupJoinHandler(client);
setupGroupLeaveHandler(client);
setupGroupUpdateHandler(client);
setupDisconnectHandler(client);

// Start client
client.initialize();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log(t('system.shutting'));
    await destroyClient(client);
    process.exit(0);
});