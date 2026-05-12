import qrcode from 'qrcode-terminal';
import { CONFIG } from './config.js';
import { logActivity } from './logger.js';
import { syncGroup } from './group-service.js';
import { registerFamilyMember } from './chores-service.js';
import { initializeChoresStorage } from './chores-storage.js';
import { t } from './language.js';
import {
    isWaitingForLanguageSelection,
    handleLanguageSelection,
    markUserWaitingForLanguage
} from './language-selector.js';
import {
    isUserRegistering,
    getUserRegistrationStep,
    startUserRegistration,
    moveToNextStep,
    storeRegistrationData,
    completeUserRegistration
} from './registration-tracker.js';

// Handle QR code display for authentication
export function setupQRHandler(client: any): void {
    client.on('qr', (qr: string) => {
        console.log('Scan the QR code below to log in:');
        qrcode.generate(qr, { small: true });
    });
}

// Handle successful authentication
export function setupAuthenticationHandlers(client: any): void {
    client.on('authenticated', () => {
        console.log('Authenticated successfully');
    });

    client.on('auth_failure', (msg: string) => {
        console.error('Authentication failure:', msg);
    });
}

// Handle client ready state
export function setupReadyHandler(client: any): void {
    client.on('ready', async () => {
        console.log('WhatsApp Client is ready');

        // Initialize chores storage
        initializeChoresStorage();
        console.log('Chores system initialized');

        const groupChat = await syncGroup(client);

        if (groupChat) {
            logActivity(`System: Bot is online and monitoring "${groupChat.name}"`);
            console.log(`Now listening for messages in: ${groupChat.name}`);
        }
    });
}

<<<<<<< HEAD
// Helper to normalize user IDs (handles @lid and @c.us interchangeably)
function normalizeUserid(id: string): string {
    if (!id) return id;
    if (id.includes('@g.us')) return id; // Keep group IDs as is
    return id.split('@')[0] + '@c.us'; // Force user IDs to @c.us format
=======
async function startRegistrationFlow(userPhone: string, message: any): Promise<void> {
    startUserRegistration(userPhone);
    const step = getUserRegistrationStep(userPhone);
    console.log(`[REG] Registration started for ${userPhone}, initial step: ${step}`);

    const namePrompt = t('register.askName', userPhone);
    console.log(`[REG] Sending name prompt to ${userPhone}: "${namePrompt}"`);
    await message.reply(namePrompt);
    console.log(`[REG] Name prompt sent successfully`);
}

function getSenderId(message: any, contact: any, chat: any): string {
    if (chat?.isGroup) {
        return message.author || contact?.id?._serialized || message.from;
    }
    return message.from;
>>>>>>> f100940 (Refactor registration flow and improve message handling in event handlers)
}

// Handle incoming messages for registration
export function setupMessageHandler(client: any): void {
    client.on('message', async (message: any) => {
        try {
            // Ignore messages from the bot itself
            if (message.fromMe) {
                console.log(`[BOT] Ignoring bot's own message: ${message.body}`);
                return;
            }

            const chat = await message.getChat();

            // Only process messages from target group
            if (chat.isGroup && chat.name === CONFIG.TARGET_GROUP_NAME) {
                const contact = await message.getContact();
<<<<<<< HEAD
                const sender = contact.name || contact.pushname || message.from;
                const rawUserPhone = message.author || message.from;
                const userPhone = normalizeUserid(rawUserPhone);
=======
                const userPhone = getSenderId(message, contact, chat);
                const sender = contact.name || contact.pushname || userPhone;
>>>>>>> f100940 (Refactor registration flow and improve message handling in event handlers)

                logActivity(`Message from ${sender}: ${message.body}`);
                console.log(`[MSG] From: ${sender} (${userPhone}), Body: "${message.body}"`);

                // Step 1: Check if user is waiting for language selection
                let isWaiting = isWaitingForLanguageSelection(userPhone);
                
                // Proactive check: If user sends 1 or 2, they might have just joined but the event was delayed/missed
                if (!isWaiting && (message.body.trim() === '1' || message.body.trim() === '2')) {
                    console.log(`[MSG] Proactively marking ${userPhone} for language selection as they sent: ${message.body}`);
                    markUserWaitingForLanguage(userPhone);
                    isWaiting = true;
                }

                if (isWaiting) {
                    console.log(`[LANG] User ${userPhone} is processing language selection`);
                    const selectedLanguage = handleLanguageSelection(userPhone, message.body);
                    if (selectedLanguage) {
                        console.log(`[LANG] Language selected: ${selectedLanguage} for ${userPhone}`);
                        logActivity(`${sender} selected language: ${selectedLanguage}`);

<<<<<<< HEAD
                        // Start registration after language selection
                        startUserRegistration(userPhone);
                        const step = getUserRegistrationStep(userPhone);
                        console.log(`[REG] Registration started for ${userPhone}, initial step: ${step}`);

                        // Small delay before asking for name
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        // Ask for name
                        const namePrompt = t('register.askName', userPhone);
                        console.log(`[REG] Sending name prompt to ${userPhone}: "${namePrompt}"`);
                        await message.reply(namePrompt);
                        console.log(`[REG] Name prompt sent successfully`);
                    } else if (message.body.trim() === '1' || message.body.trim() === '2') {
                         // This case shouldn't really happen with the new logic, but for safety:
                         console.log(`[LANG] Re-trying language selection for ${userPhone}`);
=======
                        await startRegistrationFlow(userPhone, message);
>>>>>>> f100940 (Refactor registration flow and improve message handling in event handlers)
                    } else {
                        console.log(`[LANG] Invalid language selection from ${userPhone}: "${message.body}"`);
                        const msg = t('register.selectLanguage', userPhone);
                        console.log(`[LANG] Resending language selection prompt`);
                        await message.reply(msg);
                    }
                    return;
                }

                // Fallback: accept language selection even without waiting state
                if (!isUserRegistering(userPhone)) {
                    const selectedLanguage = handleLanguageSelection(userPhone, message.body);
                    if (selectedLanguage) {
                        console.log(`[LANG] Language selected without waiting state: ${selectedLanguage} for ${userPhone}`);
                        logActivity(`${sender} selected language: ${selectedLanguage}`);
                        await startRegistrationFlow(userPhone, message);
                        return;
                    }
                }

                // Step 2: Check if user is in registration flow
                if (isUserRegistering(userPhone)) {
                    const currentStep = getUserRegistrationStep(userPhone);
                    const userInput = message.body.trim();

                    console.log(`[REG] User ${userPhone} in registration at step: ${currentStep}, input: "${userInput}"`);

                    try {
                        if (currentStep === 'name') {
                            console.log(`[REG] Processing NAME input: "${userInput}"`);
                            storeRegistrationData(userPhone, 'name', userInput);
                            moveToNextStep(userPhone);
                            const nextStep = getUserRegistrationStep(userPhone);
                            console.log(`[REG] Moved from name to: ${nextStep}`);

                            // Shorter delay for better automation flow
                            await new Promise(resolve => setTimeout(resolve, 500));

                            const phonePrompt = t('register.askPhone', userPhone);
                            console.log(`[REG] Sending phone prompt: "${phonePrompt}"`);
                            await message.reply(phonePrompt);
                            console.log(`[REG] Phone prompt sent successfully`);
                            return;
                        } else if (currentStep === 'phone') {
                            console.log(`[REG] Processing PHONE input: "${userInput}"`);
                            storeRegistrationData(userPhone, 'phone', userInput);
                            moveToNextStep(userPhone);
                            const nextStep = getUserRegistrationStep(userPhone);
                            console.log(`[REG] Moved from phone to: ${nextStep}`);

                            // Shorter delay for better automation flow
                            await new Promise(resolve => setTimeout(resolve, 500));

                            const rolePrompt = t('register.askRole', userPhone);
                            console.log(`[REG] Sending role prompt: "${rolePrompt}"`);
                            await message.reply(rolePrompt);
                            console.log(`[REG] Role prompt sent successfully`);
                            return;
                        } else if (currentStep === 'role') {
                            console.log(`[REG] Processing ROLE input: "${userInput}"`);
                            storeRegistrationData(userPhone, 'role', userInput);

                            // Complete registration
                            const regData = completeUserRegistration(userPhone);
                            console.log(`[REG] Registration completed with data:`, regData);

                            if (regData && regData.name && regData.phone && regData.role) {
                                // Register in the system
                                registerFamilyMember(regData.name, regData.phone, regData.role);
                                console.log(`[REG] User saved to system: ${regData.name}`);

                                // Send success message
                                const successMsg = t('register.success', userPhone)
                                    .replace('{name}', regData.name)
                                    .replace('{phone}', regData.phone)
                                    .replace('{role}', regData.role);
                                console.log(`[REG] Sending success message`);
                                await message.reply(successMsg);
                                logActivity(`User registered: ${regData.name} (${regData.role})`);
                                console.log(`[REG] SUCCESS: User ${userPhone} fully registered`);
                            } else {
                                console.error(`[REG] Registration data incomplete:`, regData);
                            }
                            return;
                        }
                    } catch (err) {
                        console.error(`[REG] Error during registration for ${userPhone}:`, err);
                        const errorMsg = t('register.error', userPhone);
                        await message.reply(errorMsg);
                        return;
                    }
                } else {
                    console.log(`[MSG] User ${userPhone} is not in any registration flow`);
                }
            }
        } catch (err) {
            console.error('Error in message handler:', err);
        }
    });
}

// Handle new group members joining
export function setupGroupJoinHandler(client: any): void {
    client.on('group_join', async (notification: any) => {
        const chat = await notification.getChat();

        if (chat.isGroup && chat.name === CONFIG.TARGET_GROUP_NAME) {
            console.log(`New member(s) joined "${chat.name}"`);

            try {
                const newMembers = await Promise.all(
                    notification.recipientIds.map((id: string) => client.getContactById(id))
                );
                const names = newMembers
                    .map((c: any) => c.name || c.pushname || c.id.user)
                    .join(', ');

                logActivity(`Join: ${names} joined the group`);

                const mentions = newMembers.map((contact: any) => contact.id._serialized);
                const firstMemberId = newMembers[0]?.id._serialized;

                // Ask new members for language preference
                const welcomeText = `${t('register.selectLanguage', firstMemberId)}\n\n${newMembers.map((c: any) => `@${c.id.user}`).join(', ')}`;

                await chat.sendMessage(welcomeText, { mentions });

                // Mark members as waiting for language selection
                newMembers.forEach((member: any) => {
                    const normalizedId = normalizeUserid(member.id._serialized);
                    console.log(`[JOIN] Marking ${normalizedId} as waiting for language selection`);
                    markUserWaitingForLanguage(normalizedId);
                });
            } catch (err) {
                console.error('Error sending welcome message:', err);
            }
        }
    });
}

// Handle group members leaving
export function setupGroupLeaveHandler(client: any): void {
    client.on('group_leave', async (notification: any) => {
        const chat = await notification.getChat();

        if (chat.isGroup && chat.name === CONFIG.TARGET_GROUP_NAME) {
            const leftMembers = await Promise.all(
                notification.recipientIds.map((id: string) => client.getContactById(id))
            );
            const names = leftMembers
                .map((c: any) => c.name || c.pushname || c.id.user)
                .join(', ');

            logActivity(`Leave: ${names} left the group`);
        }
    });
}

// Handle group settings and info changes
export function setupGroupUpdateHandler(client: any): void {
    client.on('group_update', async (notification: any) => {
        const chat = await notification.getChat();

        if (chat.isGroup && chat.name === CONFIG.TARGET_GROUP_NAME) {
            logActivity(`Update: Group settings changed (${notification.type})`);
        }
    });
}

// Handle client disconnection
export function setupDisconnectHandler(client: any): void {
    client.on('disconnected', (reason: string) => {
        logActivity(`System: Client disconnected (${reason})`);
        console.log('Client was logged out:', reason);
    });
}
