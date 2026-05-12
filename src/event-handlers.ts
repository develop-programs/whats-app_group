import qrcode from 'qrcode-terminal';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { CONFIG } from './config.js';
import { logActivity } from './logger.js';
import { syncGroup } from './group-service.js';
import { t } from './language.js';
import { normalizeUserid } from './utils.js';
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

        const groupChat = await syncGroup(client);

        if (groupChat) {
            logActivity(`System: Bot is online and monitoring "${groupChat.name}"`);
            console.log(`Now listening for messages in: ${groupChat.name}`);
        }
    });
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
                const sender = contact.name || contact.pushname || message.from;
                const rawUserPhone = message.author || message.from;
                const userPhone = normalizeUserid(rawUserPhone);

                logActivity(`Message from ${sender}: ${message.body}`);
                console.log(`[MSG] From: ${sender} (${userPhone}), Body: "${message.body}"`);

                // Step 1: Check if user is waiting for language selection
                let isWaiting = isWaitingForLanguageSelection(userPhone);

                // Proactive check: If user sends 1 or 2, they might have just joined but the event was delayed/missed
                // CRITICAL FIX: Don't trigger if user is already in registration flow
                if (!isWaiting && !isUserRegistering(userPhone) && (message.body.trim() === '1' || message.body.trim() === '2')) {
                    console.log(`[MSG] Proactively marking ${userPhone} for language selection as they sent: ${message.body}`);
                    markUserWaitingForLanguage(userPhone);
                    isWaiting = true;
                }

                if (isWaiting) {
                    console.log(`[LANG] User ${userPhone} is processing language selection`);
                    const selectedLanguage = handleLanguageSelection(userPhone, message.body);
                    if (selectedLanguage) {
                        console.log(`[LANG] Language selected: ${selectedLanguage} for ${userPhone}`);
                        const confirmMsg = selectedLanguage === 'en'
                            ? 'Language set to English ✓'
                            : 'भाषा हिंदी में सेट की गई है ✓';
                        await message.reply(confirmMsg);
                        logActivity(`${sender} selected language: ${selectedLanguage}`);

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
                    } else {
                        console.log(`[LANG] Invalid language selection from ${userPhone}: "${message.body}"`);
                        const msg = t('register.selectLanguage', userPhone);
                        console.log(`[LANG] Resending language selection prompt`);
                        await message.reply(msg);
                    }
                    return;
                }

                // Handle "UPDATE AVAILABILITY" command
                if (message.body.trim().toUpperCase() === 'UPDATE AVAILABILITY') {
                    console.log(`[CMD] User ${userPhone} requested availability update`);
                    // We'll treat this as starting a specific registration step or a separate flow
                    // For simplicity, let's start a mini-flow
                    await message.reply(t('register.askAvailability', userPhone));
                    // We might need a separate state for updates, but for now let's just use the registration map
                    // or just handle it as a one-off. Let's start the availability step.
                    // markUserForAvailabilityUpdate(userPhone); // Hypothetical
                    return;
                }

                // Handle "!approve-worker" command (Admin only)
                if (message.body.startsWith('!approve-worker')) {
                    const parts = message.body.split(' ');
                    if (parts.length >= 2) {
                        const workerPhone = parts[1].includes('@c.us') ? parts[1] : parts[1] + '@c.us';
                        console.log(`[ADMIN] Approving worker: ${workerPhone}`);

                        // Send activation message in Hindi (as requested)
                        const activationMsg = t('register.activated', workerPhone);
                        await client.sendMessage(workerPhone, activationMsg);

                        await message.reply(`✅ Worker ${workerPhone} has been approved and notified.`);
                        logActivity(`Admin approved worker: ${workerPhone}`);
                    } else {
                        await message.reply('Usage: !approve-worker <PhoneWithCountryCode>');
                    }
                    return;
                }

                // Step 2: Check if user is in registration flow
                if (isUserRegistering(userPhone)) {
                    const currentStep = getUserRegistrationStep(userPhone);
                    const userInput = message.body.trim();

                    console.log(`[REG] User ${userPhone} in registration at step: ${currentStep}`);

                    try {
                        if (currentStep === 'name') {
                            storeRegistrationData(userPhone, 'name', userInput);
                            moveToNextStep(userPhone);
                            await message.reply(t('register.askAadhaar', userPhone));
                            return;
                        } else if (currentStep === 'aadhaar') {
                            // Aadhaar validation (12 digits)
                            if (/^\d{12}$/.test(userInput)) {
                                storeRegistrationData(userPhone, 'aadhaar', userInput);
                                moveToNextStep(userPhone);
                                
                                // Send trade selection as a clean Text Menu
                                const tradeMenu = `🛠️ *Hindustaan Seva - Trade Selection* 🛠️\n\n` +
                                    `Please select your trade category:\n` +
                                    `अपनी ट्रेड श्रेणी चुनें:\n\n` +
                                    `1️⃣ Electrical (बिजली का काम)\n` +
                                    `2️⃣ Plumbing (प्लंबिंग का काम)\n` +
                                    `3️⃣ AC Service (एसी सर्विस)\n\n` +
                                    `*Reply with 1, 2 or 3*`;
                                
                                await message.reply(tradeMenu);
                            } else {
                                await message.reply(t('register.invalidAadhaar', userPhone));
                            }
                            return;
                        } else if (currentStep === 'trade') {
                            let trade = '';
                            const input = userInput.trim();
                            
                            if (input === '1') trade = 'Electrical';
                            else if (input === '2') trade = 'Plumbing';
                            else if (input === '3') trade = 'AC';
                            
                            if (trade) {
                                storeRegistrationData(userPhone, 'trade', trade);
                                moveToNextStep(userPhone);
                                await message.reply(t('register.askExperience', userPhone));
                            } else {
                                const retryMenu = `⚠️ *Invalid Selection / अमान्य विकल्प*\n\n` +
                                    `Please reply with 1, 2 or 3:\n` +
                                    `1️⃣ Electrical\n` +
                                    `2️⃣ Plumbing\n` +
                                    `3️⃣ AC Service`;
                                await message.reply(retryMenu);
                            }
                            return;
                        } else if (currentStep === 'experience') {
                            storeRegistrationData(userPhone, 'experience', userInput);
                            moveToNextStep(userPhone);
                            await message.reply(t('register.askAvailability', userPhone));
                            return;
                        } else if (currentStep === 'availability') {
                            storeRegistrationData(userPhone, 'availability', userInput);
                            moveToNextStep(userPhone);
                            await message.reply(t('register.askSelfie', userPhone));
                            return;
                        } else if (currentStep === 'selfie') {
                            // Check if message has media
                            if (message.hasMedia) {
                                const media = await message.downloadMedia();
                                if (media && media.mimetype.startsWith('image/')) {
                                    console.log(`[REG] Received selfie from ${userPhone}`);

                                    // Ensure uploads directory exists
                                    const uploadDir = join(process.cwd(), 'uploads', 'selfies');
                                    if (!existsSync(uploadDir)) {
                                        mkdirSync(uploadDir, { recursive: true });
                                    }

                                    // Save the selfie image
                                    const extension = media.mimetype.split('/')[1] || 'jpg';
                                    const fileName = `${userPhone.split('@')[0]}_selfie.${extension}`;
                                    const filePath = join(uploadDir, fileName);

                                    try {
                                        writeFileSync(filePath, Buffer.from(media.data, 'base64'));
                                        console.log(`[REG] Selfie saved to ${filePath}`);

                                        storeRegistrationData(userPhone, 'selfie', filePath);
                                        moveToNextStep(userPhone);

                                        // Final step: Confirmation
                                        const regData = completeUserRegistration(userPhone);
                                        console.log(`[REG] Full registration data for ${userPhone}:`, regData);

                                        // Send confirmation to worker
                                        await message.reply(t('register.confirmation', userPhone));

                                        if (regData) {
                                            // Notify Admin (Target Group)
                                            const adminMsg = `🚨 *NEW WORKER ONBOARDING* 🚨\n\n` +
                                                `Name: ${regData.name}\n` +
                                                `Phone: ${userPhone}\n` +
                                                `Aadhaar: ${regData.aadhaar}\n` +
                                                `Trade: ${regData.trade}\n` +
                                                `Exp: ${regData.experience} years\n` +
                                                `Availability: ${regData.availability}\n\n` +
                                                `*Action Required*: Please review and initiate e-KYC. Photo saved as ${fileName}`;

                                            await chat.sendMessage(adminMsg);
                                            logActivity(`New worker onboarding submission: ${regData.name} (${regData.trade})`);
                                        } else {
                                            console.error('[REG] Registration data was null unexpectedly');
                                        }
                                    } catch (writeErr) {
                                        console.error('[REG] Error saving selfie file:', writeErr);
                                        await message.reply(t('register.error', userPhone));
                                    }
                                } else {
                                    await message.reply(t('register.askSelfie', userPhone));
                                }
                            } else {
                                await message.reply(t('register.askSelfie', userPhone));
                            }
                            return;
                        }
                    } catch (err) {
                        console.error(`[REG] Error during registration for ${userPhone}:`, err);
                        await message.reply(t('register.error', userPhone));
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
