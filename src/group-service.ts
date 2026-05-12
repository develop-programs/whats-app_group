import { CONFIG } from './config.js';
import { logActivity } from './logger.js';

// Helper function to delay execution (milliseconds)
async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Find or create target group
export async function syncGroup(client: any) {
    console.log('Syncing groups (waiting for stability)...');
    await delay(CONFIG.GROUP_SYNC_DELAY);

    const chats = await client.getChats();
    let group = chats.find((chat: any) => chat.isGroup && chat.name === CONFIG.TARGET_GROUP_NAME);

    if (group) {
        console.log(`Connected to existing group: "${CONFIG.TARGET_GROUP_NAME}"`);

        // Fetch past activity
        console.log('Fetching past activity...');
        const messages = await group.fetchMessages({ limit: CONFIG.MESSAGE_FETCH_LIMIT });
        logActivity(`--- START PAST ACTIVITY FOR "${CONFIG.TARGET_GROUP_NAME}" ---`);

        for (const msg of messages) {
            const contact = await msg.getContact();
            const sender = contact.name || contact.pushname || msg.from;
            const typePrefix = msg.type === 'chat' ? '' : `[${msg.type.toUpperCase()}] `;
            logActivity(`(PAST) ${sender}: ${typePrefix}${msg.body || '(No content)'}`);
        }

        logActivity(`--- END PAST ACTIVITY ---`);
    } else {
        console.log(`Group "${CONFIG.TARGET_GROUP_NAME}" not found. Creating...`);
        await createGroup(client);
    }

    return group;
}

// Create new group with initial participants
async function createGroup(client: any) {
    try {
        const participantIds: string[] = [];

        for (const participant of CONFIG.INITIAL_PARTICIPANTS) {
            // Check if it looks like a phone number (digits and optional +)
            if (/^\+?\d+$/.test(participant)) {
                const cleanNumber = participant.replace('+', '');
                const id = await client.getNumberId(cleanNumber);
                if (id) {
                    participantIds.push(id._serialized);
                    console.log(`Found participant by number: ${participant}`);
                } else {
                    console.warn(`Could not find WhatsApp ID for number: ${participant}`);
                }
            } else {
                // Search by name in contacts
                const contacts = await client.getContacts();
                const contact = contacts.find((c: any) =>
                    (c.name || c.pushname || '').includes(participant)
                );
                if (contact) {
                    participantIds.push(contact.id._serialized);
                    console.log(`Found participant by name: ${participant}`);
                } else {
                    console.warn(`Could not find contact for name: ${participant}`);
                }
            }
        }

        if (participantIds.length > 0) {
            console.log(`Creating group with ${participantIds.length} participants...`);
            await client.createGroup(CONFIG.TARGET_GROUP_NAME, participantIds);
            console.log('Group created successfully');

            // Wait for the new group to appear in the chat list
            await delay(CONFIG.GROUP_CREATION_DELAY);
        } else {
            console.error('No valid participants found. Check names or phone numbers.');
        }
    } catch (err) {
        console.error('Error during group creation:', err);
    }
}

// Refresh group reference after creation
export async function refreshGroupReference(client: any) {
    const updatedChats = await client.getChats();
    return updatedChats.find((chat: any) => chat.isGroup && chat.name === CONFIG.TARGET_GROUP_NAME);
}
