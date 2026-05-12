import pkg from 'whatsapp-web.js';
import { CONFIG } from './config.js';
import { t } from './language.js';

const { Client, LocalAuth } = pkg;

// Initialize and return WhatsApp client instance
export function initializeClient() {
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            handleSIGINT: CONFIG.PUPPETEER_ARGS.handleSIGINT,
            args: CONFIG.PUPPETEER_ARGS.args,
          protocolTimeout: CONFIG.PUPPETEER_ARGS.protocolTimeout,
        },
    });

    return client;
}

// Destroy client and cleanup resources
export async function destroyClient(client: any): Promise<void> {
    try {
        await client.destroy();
    } catch (error) {
        console.error(t('system.errorDestroying'), error);
    }
}
