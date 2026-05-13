import qrcode from 'qrcode-terminal';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { CONFIG } from './config.js';
import { logActivity } from './logger.js';
import { syncGroup } from './group-service.js';
import { t } from './language.js';
import { appendToGoogleSheet } from './google-sheets.js';
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

    client.on('loading_screen', (percent: string, message: string) => {
        console.log(`LOADING: ${percent}% - ${message}`);
    });
}

// Handle client ready state
let isReady = false;
export function setupReadyHandler(client: any): void {
    client.on('ready', async () => {
        if (isReady) return;
        isReady = true;
        
        console.log('WhatsApp Client is ready');

        const groupChat = await syncGroup(client);

        if (groupChat) {
            logActivity(`System: Bot is online and monitoring "${groupChat.name}"`);
            console.log(`Now listening for messages in: ${groupChat.name}`);
        }
    });
}

async function startSelfRegistration(userPhone: string, message: any, isFromTargetGroup: boolean = false): Promise<void> {
    if (isFromTargetGroup) {
        console.log(`[REG] Starting self-registration for ${userPhone}`);
    }
    startUserRegistration(userPhone); // Starts at 'name' by default
    
    const namePrompt = t('register.askName', userPhone);
    await message.reply(namePrompt);
}

/**
 * Starts the registration flow for a specific target user (triggered by admin).
 */
async function startTargetRegistration(client: any, targetPhone: string, adminPhone: string, message: any): Promise<void> {
    try {
        // Clean and format the target phone number
        let cleanNumber = targetPhone.replace(/\D/g, '');
        if (!cleanNumber.startsWith('91') && cleanNumber.length === 10) {
            cleanNumber = '91' + cleanNumber;
        }
        const targetId = cleanNumber + '@c.us';

        console.log(`[REG] Admin ${adminPhone} starting registration for ${targetId}`);
        
        // Ensure the bot "knows" this contact/chat before sending a message
        try {
            await client.getContactById(targetId);
        } catch (e) {
            console.warn(`[REG] Warning: Could not pre-fetch contact ${targetId}, attempting to send anyway.`);
        }
        
        // Initialize state
        startUserRegistration(targetId);
        markUserWaitingForLanguage(targetId);
        
        // Notify the target user (Direct Message)
        const langMsg = t('register.selectLanguage', targetId);
        const welcomeMsg = `Hello! A registration flow has been started for you by an administrator.\n\n${langMsg}`;
        
        await client.sendMessage(targetId, welcomeMsg);
        
        // Confirm to the admin in the group
        await message.reply(`✅ Registration flow initiated for ${cleanNumber}. They have been sent a DM to proceed.`);
        
    } catch (err) {
        console.error(`[REG] Failed to start target registration:`, err);
        await message.reply(`❌ Failed to start registration for ${targetPhone}. Please check the number and try again.`);
    }
}

function getSenderId(message: any, contact: any, chat: any): string {
    if (chat?.isGroup) {
        // Prioritize the contact's real ID over the message author (which might be an @lid)
        const realId = contact?.id?._serialized;
        if (realId && !realId.includes('@lid')) {
            return realId;
        }
        return message.author || realId || message.from;
    }
    return message.from;
}

// Handle incoming messages for registration
export function setupMessageHandler(client: any): void {
    console.log('>>> MESSAGE HANDLER VERSION 2.0 (LID FIX ACTIVE) <<<');
    client.on('message', async (message: any) => {
        try {
            // Ignore status updates
            if (message.from === 'status@c.us') return;

            // Normally ignore messages from the bot itself to prevent loops,
            // but allow them if they are commands (starting with '/') so the owner can use the bot.
            if (message.fromMe && !message.body.trim().startsWith('/')) return;

            const chat = await message.getChat();
            const contact = await message.getContact();
            const rawUserPhone = getSenderId(message, contact, chat);
            const userPhone = normalizeUserid(rawUserPhone);
            const sender = contact.name || contact.pushname || userPhone;

            const isFromTargetGroup = chat.isGroup && chat.name === CONFIG.TARGET_GROUP_NAME;
            const isDirectMessage = !chat.isGroup;

            // Only log if it's from the target group
            if (isFromTargetGroup) {
                console.log(`[MSG] Processing: "${message.body}" from ${sender}`);
            }

            // Handle /register command
            const msgBody = message.body.trim();
            if (msgBody.startsWith('/register')) {
                console.log(`[CMD] Register command detected. From: ${sender}, isFromTargetGroup: ${isFromTargetGroup}, isDirectMessage: ${isDirectMessage}`);
                if (isFromTargetGroup || isDirectMessage) {
                    const parts = msgBody.split(/\s+/);
                    
                    // Case 1: Admin registering someone else (/register 91XXXXXXXXXX)
                    if (parts.length > 1 && isFromTargetGroup) {
                        const isAdmin = message.fromMe || chat.participants.some((p: any) => 
                            normalizeUserid(p.id._serialized) === userPhone && p.isAdmin
                        );

                        if (isAdmin) {
                            const targetPhone = parts[1];
                            await startTargetRegistration(client, targetPhone, userPhone, message);
                            return;
                        } else {
                            await message.reply('❌ Only group admins can register other users. Use just `/register` to register yourself.');
                            return;
                        }
                    }

                    // Case 2: Self-registration (/register)
                    if (isFromTargetGroup) {
                        console.log(`[CMD] Register command received from ${userPhone}`);
                    }
                    await startSelfRegistration(userPhone, message, isFromTargetGroup);
                }
                return;
            }

            if (isFromTargetGroup || isDirectMessage) {
                // Step 1: Check if user is waiting for language selection
                let isWaiting = isWaitingForLanguageSelection(userPhone);

                // Proactive check: If user sends 1 or 2, and not registering, trigger language selection
                if (!isWaiting && !isUserRegistering(userPhone) && (message.body.trim() === '1' || message.body.trim() === '2')) {
                    markUserWaitingForLanguage(userPhone);
                    isWaiting = true;
                }

                if (isWaiting) {
                    const selectedLanguage = handleLanguageSelection(userPhone, message.body);
                    if (selectedLanguage) {
                        logActivity(`${sender} selected language: ${selectedLanguage}`);
                        await startSelfRegistration(userPhone, message, isFromTargetGroup);
                    } else {
                        const msg = t('register.selectLanguage', userPhone);
                        await message.reply(msg);
                    }
                    return;
                }

                // Handle "UPDATE AVAILABILITY" command
                if (message.body.trim().toUpperCase() === 'UPDATE AVAILABILITY') {
                    await message.reply(t('register.askAvailability', userPhone));
                    // Simple logic: we'll handle this manually or start the availability step
                    return;
                }

                // Handle "!approve-worker" command (Admin only)
                if (message.body.startsWith('!approve-worker')) {
                    const parts = message.body.split(' ');
                    if (parts.length >= 2) {
                        const workerPhone = parts[1].includes('@c.us') ? parts[1] : parts[1] + '@c.us';
                        const activationMsg = t('register.activated', workerPhone);
                        await client.sendMessage(workerPhone, activationMsg);
                        await message.reply(`✅ Worker ${workerPhone.split('@')[0]} approved and notified.`);
                    }
                    return;
                }

                // Step 2: Check if user is in registration flow
                if (isUserRegistering(userPhone)) {
                    const currentStep = getUserRegistrationStep(userPhone);
                    const userInput = message.body.trim();

                    if (isFromTargetGroup) {
                        console.log(`[REG] User ${userPhone} at step: ${currentStep}`);
                    }

                    try {
                        if (currentStep === 'name') {
                            storeRegistrationData(userPhone, 'name', userInput);
                            moveToNextStep(userPhone);
                            await message.reply(t('register.askAadhaar', userPhone));
                            return;
                        } else if (currentStep === 'aadhaar') {
                            if (/^\d{12}$/.test(userInput)) {
                                storeRegistrationData(userPhone, 'aadhaar', userInput);
                                moveToNextStep(userPhone);
                                
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
                            if (userInput === '1') trade = 'Electrical';
                            else if (userInput === '2') trade = 'Plumbing';
                            else if (userInput === '3') trade = 'AC';
                            
                            if (trade) {
                                storeRegistrationData(userPhone, 'trade', trade);
                                moveToNextStep(userPhone);
                                await message.reply(t('register.askExperience', userPhone));
                            } else {
                                await message.reply('Please reply with 1, 2 or 3:\n1️⃣ Electrical\n2️⃣ Plumbing\n3️⃣ AC Service');
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
                            if (message.hasMedia) {
                                const media = await message.downloadMedia();
                                if (media && media.mimetype.startsWith('image/')) {
                                    const uploadDir = join(process.cwd(), 'uploads', 'selfies');
                                    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

                                    const extension = media.mimetype.split('/')[1] || 'jpg';
                                    const fileName = `${userPhone.split('@')[0]}_selfie.${extension}`;
                                    const filePath = join(uploadDir, fileName);
                                    
                                    writeFileSync(filePath, Buffer.from(media.data, 'base64'));
                                    storeRegistrationData(userPhone, 'selfiePath', filePath);
                                    
                                    const regData = completeUserRegistration(userPhone);
                                    await message.reply(t('register.confirmation', userPhone));
                                    
                                    if (regData) {
                                        const cleanPhone = '+' + userPhone.split('@')[0];
                                        const adminMsg = `🚨 *NEW WORKER ONBOARDING* 🚨\n\n` +
                                            `Name: ${regData.name}\n` +
                                            `Phone: ${cleanPhone}\n` +
                                            `Aadhaar: ${regData.aadhaar}\n` +
                                            `Trade: ${regData.trade}\n` +
                                            `Exp: ${regData.experience} years\n` +
                                            `Availability: ${regData.availability}\n\n` +
                                            `*Action Required*: Review and initiate e-KYC. Photo: ${fileName}`;
                                        
                                        await chat.sendMessage(adminMsg);

                                        // Save to Google Sheets
                                        await appendToGoogleSheet({
                                            name: regData.name || '',
                                            phone: cleanPhone,
                                            aadhaar: regData.aadhaar || '',
                                            trade: regData.trade || '',
                                            experience: regData.experience || '',
                                            availability: regData.availability || '',
                                            selfiePath: fileName
                                        });

                                        logActivity(`Worker submission: ${regData.name} (${regData.trade})`);
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
                        console.error(`[REG] Error:`, err);
                        await message.reply(t('register.error', userPhone));
                    }
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
            try {
                const newMembers = await Promise.all(
                    notification.recipientIds.map((id: string) => client.getContactById(id))
                );
                const firstMemberId = newMembers[0]?.id._serialized;
                const mentions = newMembers.map((contact: any) => contact.id._serialized);
                
                const welcomeText = `${t('register.selectLanguage', firstMemberId)}\n\n${newMembers.map((c: any) => `@${c.id.user}`).join(', ')}`;
                await chat.sendMessage(welcomeText, { mentions });

                newMembers.forEach((member: any) => {
                    const normalizedId = normalizeUserid(member.id._serialized);
                    markUserWaitingForLanguage(normalizedId);
                });
            } catch (err) {
                console.error('Error in join handler:', err);
            }
        }
    });
}

export function setupGroupLeaveHandler(client: any): void {
    client.on('group_leave', async (notification: any) => {
        const chat = await notification.getChat();
        if (chat.isGroup && chat.name === CONFIG.TARGET_GROUP_NAME) {
            logActivity(`System: Member left the group`);
        }
    });
}

export function setupGroupUpdateHandler(client: any): void {
    client.on('group_update', async (notification: any) => {
        const chat = await notification.getChat();
        if (chat.isGroup && chat.name === CONFIG.TARGET_GROUP_NAME) {
            logActivity(`System: Group updated (${notification.type})`);
        }
    });
}

export function setupDisconnectHandler(client: any): void {
    client.on('disconnected', (reason: string) => {
        logActivity(`System: Client disconnected (${reason})`);
    });

    client.on('change_state', (state: string) => {
        console.log(`State Changed: ${state}`);
    });

    client.on('error', (err: any) => {
        console.error('Client Error:', err);
    });
}
