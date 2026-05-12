// Language configuration and translations
import { getUserLanguagePreference, updateUserLanguagePreference } from './language-storage.js';
import { Language } from './language-types.js';

// User language preferences storage
const userLanguagePreferences: Map<string, Language> = new Map();

// Translations dictionary
const translations: Record<Language, Record<string, string>> = {
    en: {
        // Basic commands
        'cmd.ping.pong': 'pong!',
        'cmd.help.title': 'Available Commands:',
        'cmd.help.basic': 'BASIC:',
        'cmd.help.ping': '!ping - Check if bot is alive',
        'cmd.help.logs': '!logs - Show last 10 activities',
        'cmd.help.help': '!help - Show this menu',
        'cmd.help.chores': 'CHORES:',
        'cmd.help.pending': '!chores-pending - Show pending chores',
        'cmd.help.completed': '!chores-completed - Show completed chores',
        'cmd.help.today': '!chores-today - Show today\'s chores',
        'cmd.help.overdue': '!chores-overdue - Show overdue chores',
        'cmd.help.stats': '!chores-stats - Show chore statistics',
        'cmd.help.weekly': '!chores-weekly - Show weekly plan',
        'cmd.help.myChores': '!chores-my - Show your assigned chores',
        'cmd.help.register': '!register-member Name Phone Role - Register family member',
        'cmd.help.addChore': '!add-chore Name Category Person Priority DueDate - Add new chore',

        // Chores messages
        'chores.noPending': 'No pending chores. Great job!',
        'chores.pendingTitle': 'PENDING CHORES:',
        'chores.noCompleted': 'No completed chores yet.',
        'chores.completedTitle': 'COMPLETED CHORES',
        'chores.noToday': 'No chores scheduled for today. Enjoy your day!',
        'chores.todayTitle': 'TODAY\'S CHORES:',
        'chores.noOverdue': 'No overdue chores. All caught up!',
        'chores.overdueTitle': 'OVERDUE CHORES',
        'chores.statsTitle': 'CHORE STATISTICS:',
        'chores.total': 'Total Chores',
        'chores.pending': 'Pending',
        'chores.inProgress': 'In Progress',
        'chores.completed': 'Completed',
        'chores.overdue': 'Overdue',
        'chores.completionRate': 'Completion Rate',
        'chores.yourChoresTitle': 'YOUR CHORES:',
        'chores.noChoresAssigned': 'You have no chores assigned.',
        'chores.details': 'DETAILS:',

        // Registration
        'register.selectLanguage': 'Welcome! Please select your preferred language / स्वागत है! कृपया अपनी पसंदीदा भाषा चुनें:\n\n1️⃣ English के लिए "1" टाइप करें\n2️⃣ Hindi के लिए "2" टाइप करें\n\nReply with: 1 or 2',
        'register.languageSelected': 'Language set to English',
        'register.askName': 'Please enter your full name:',
        'register.askPhone': 'Please enter your phone number (with country code, e.g., +919876543210):',
        'register.askRole': 'What is your role in the family? (e.g., Parent, Child, Grandparent):',
        'register.success': 'Registration complete! ✓\n\nName: {name}\nPhone: {phone}\nRole: {role}',
        'register.error': 'Error during registration. Please try again.',

        // Group messages
        'group.welcomeTitle': 'Welcome to',
        'group.welcomeMessage': 'We are glad to have you here. Type !help to see what I can do!',
        'group.systemOnline': 'Bot is online and monitoring',
        'group.joined': 'joined the group',
        'group.left': 'left the group',

        // Logs
        'logs.recentActivities': 'Recent Activities:',
        'logs.noLogs': 'No logs found yet.',

        // Add chore
        'addChore.usage': 'Usage: !add-chore Name Category Person Priority DueDate',
        'addChore.categories': 'Categories:',
        'addChore.priority': 'Priority: high, medium, low',
        'addChore.dueDate': 'DueDate: YYYY-MM-DD',
        'addChore.example': 'Example: !add-chore "Clean bathroom" cleaning Sarah high 2026-05-15',
        'addChore.errorRequired': 'Error: All parameters are required.',
        'addChore.invalidCategory': 'Invalid category. Valid categories:',
        'addChore.invalidPriority': 'Invalid priority. Use: high, medium, or low',
        'addChore.invalidDate': 'Invalid date format. Use: YYYY-MM-DD',
        'addChore.success': 'Chore added:',
        'addChore.assignedTo': 'assigned to',
        'addChore.due': 'Due:',
        'addChore.error': 'Error adding chore. Please try again.',

        // System
        'system.initializingClient': 'Initializing WhatsApp Client...',
        'system.authenticated': 'Authenticated successfully',
        'system.authFailure': 'Authentication failure:',
        'system.clientReady': 'WhatsApp Client is ready',
        'system.choresInitialized': 'Chores system initialized',
        'system.listeningFor': 'Now listening for messages in:',
        'system.shutting': 'Shutting down...',
        'system.scanQR': 'Scan the QR code below to log in:',
        'system.errorDestroying': 'Error destroying client:',
        'system.errorSending': 'Error sending welcome message:',
        'system.disconnected': 'Client disconnected',
        'system.loggedOut': 'Client was logged out:',
    },
    hi: {
        // Basic commands
        'cmd.ping.pong': 'पोंग!',
        'cmd.help.title': 'उपलब्ध कमांड:',
        'cmd.help.basic': 'बेसिक:',
        'cmd.help.ping': '!ping - चेक करें कि बॉट जीवित है',
        'cmd.help.logs': '!logs - पिछली 10 गतिविधियां दिखाएं',
        'cmd.help.help': '!help - यह मेनू दिखाएं',
        'cmd.help.chores': 'काम:',
        'cmd.help.pending': '!chores-pending - लंबित काम दिखाएं',
        'cmd.help.completed': '!chores-completed - पूर्ण किए गए काम दिखाएं',
        'cmd.help.today': '!chores-today - आज के काम दिखाएं',
        'cmd.help.overdue': '!chores-overdue - समय सीमा से अधिक काम दिखाएं',
        'cmd.help.stats': '!chores-stats - काम के आंकड़े दिखाएं',
        'cmd.help.weekly': '!chores-weekly - साप्ताहिक योजना दिखाएं',
        'cmd.help.myChores': '!chores-my - अपने काम दिखाएं',
        'cmd.help.register': '!register-member नाम फोन भूमिका - परिवार के सदस्य को पंजीकृत करें',
        'cmd.help.addChore': '!add-chore नाम श्रेणी व्यक्ति प्राथमिकता तारीख - नया काम जोड़ें',

        // Chores messages
        'chores.noPending': 'कोई लंबित काम नहीं। शानदार काम!',
        'chores.pendingTitle': 'लंबित काम:',
        'chores.noCompleted': 'अभी तक कोई पूर्ण किया गया काम नहीं।',
        'chores.completedTitle': 'पूर्ण किए गए काम',
        'chores.noToday': 'आज कोई काम निर्धारित नहीं। अपने दिन का आनंद लें!',
        'chores.todayTitle': 'आज के काम:',
        'chores.noOverdue': 'कोई समय सीमा से अधिक काम नहीं। सब कुछ पूरा है!',
        'chores.overdueTitle': 'समय सीमा से अधिक काम',
        'chores.statsTitle': 'काम के आंकड़े:',
        'chores.total': 'कुल काम',
        'chores.pending': 'लंबित',
        'chores.inProgress': 'प्रगति में',
        'chores.completed': 'पूर्ण किया गया',
        'chores.overdue': 'समय सीमा से अधिक',
        'chores.completionRate': 'पूर्ण दर',
        'chores.yourChoresTitle': 'आपके काम:',
        'chores.noChoresAssigned': 'आपको कोई काम नहीं दिया गया है।',
        'chores.details': 'विवरण:',

        // Registration
        'register.selectLanguage': 'Welcome! Please select your preferred language / स्वागत है! कृपया अपनी पसंदीदा भाषा चुनें:\n\n1️⃣ English के लिए "1" टाइप करें\n2️⃣ Hindi के लिए "2" टाइप करें\n\nReply with: 1 or 2',
        'register.languageSelected': 'Language set to English',
        'register.askName': 'कृपया अपना पूरा नाम दर्ज करें:',
        'register.askPhone': 'कृपया अपना फोन नंबर दर्ज करें (देश कोड के साथ, जैसे +919876543210):',
        'register.askRole': 'परिवार में आपकी भूमिका क्या है? (जैसे माता-पिता, बच्चा, दादा-दादी):',
        'register.success': 'पंजीकरण पूर्ण! ✓\n\nनाम: {name}\nफोन: {phone}\nभूमिका: {role}',
        'register.error': 'पंजीकरण के दौरान त्रुटि। कृपया फिर से कोशिश करें।',

        // Group messages
        'group.welcomeTitle': 'में आपका स्वागत है',
        'group.welcomeMessage': 'हम आपको यहां पाकर खुश हैं। यह देखने के लिए !help टाइप करें कि मैं क्या कर सकता हूं!',
        'group.systemOnline': 'बॉट ऑनलाइन है और निगरानी कर रहा है',
        'group.joined': 'समूह में शामिल हुए',
        'group.left': 'समूह से चले गए',

        // Logs
        'logs.recentActivities': 'हाल की गतिविधियां:',
        'logs.noLogs': 'अभी तक कोई लॉग नहीं मिले।',

        // Add chore
        'addChore.usage': 'उपयोग: !add-chore नाम श्रेणी व्यक्ति प्राथमिकता तारीख',
        'addChore.categories': 'श्रेणियां:',
        'addChore.priority': 'प्राथमिकता: high, medium, low',
        'addChore.dueDate': 'तारीख: YYYY-MM-DD',
        'addChore.example': 'उदाहरण: !add-chore "बाथरूम साफ करें" cleaning Sarah high 2026-05-15',
        'addChore.errorRequired': 'त्रुटि: सभी पैरामीटर आवश्यक हैं।',
        'addChore.invalidCategory': 'अमान्य श्रेणी। मान्य श्रेणियां:',
        'addChore.invalidPriority': 'अमान्य प्राथमिकता। उपयोग करें: high, medium, या low',
        'addChore.invalidDate': 'अमान्य तारीख प्रारूप। उपयोग करें: YYYY-MM-DD',
        'addChore.success': 'काम जोड़ा गया:',
        'addChore.assignedTo': 'को सौंपा गया',
        'addChore.due': 'तारीख:',
        'addChore.error': 'काम जोड़ने में त्रुटि। कृपया फिर से कोशिश करें।',

        // System
        'system.initializingClient': 'व्हाट्सएप क्लाइंट शुरू किया जा रहा है...',
        'system.authenticated': 'सफलतापूर्वक प्रमाणित',
        'system.authFailure': 'प्रमाणीकरण विफलता:',
        'system.clientReady': 'व्हाट्सएप क्लाइंट तैयार है',
        'system.choresInitialized': 'कार्य प्रणाली शुरू की गई',
        'system.listeningFor': 'अब संदेशों के लिए सुन रहा है:',
        'system.shutting': 'बंद किया जा रहा है...',
        'system.scanQR': 'लॉगिन करने के लिए नीचे दिए गए QR कोड को स्कैन करें:',
        'system.errorDestroying': 'क्लाइंट को नष्ट करने में त्रुटि:',
        'system.errorSending': 'स्वागत संदेश भेजने में त्रुटि:',
        'system.disconnected': 'क्लाइंट डिसकनेक्ट हो गया',
        'system.loggedOut': 'क्लाइंट लॉगआउट किया गया:',
    },
};

// Get translated message
export function t(key: string, userPhone?: string, defaultLang: Language = 'en'): string {
    let lang = defaultLang;

    if (userPhone) {
        // Try to get from in-memory cache first
        const cached = userLanguagePreferences.get(userPhone);
        if (cached) {
            lang = cached;
        } else {
            // Try to get from persistent storage
            const stored = getUserLanguagePreference(userPhone);
            if (stored) {
                lang = stored;
                userLanguagePreferences.set(userPhone, lang);
            }
        }
    }

    return translations[lang]?.[key] || translations.en[key] || key;
}

// Set user language preference
export function setUserLanguage(userPhone: string, language: Language): void {
    userLanguagePreferences.set(userPhone, language);
    updateUserLanguagePreference(userPhone, language);
}

// Get user language preference
export function getUserLanguage(userPhone: string): Language {
    const cached = userLanguagePreferences.get(userPhone);
    if (cached) return cached;

    const stored = getUserLanguagePreference(userPhone);
    if (stored) {
        userLanguagePreferences.set(userPhone, stored);
        return stored;
    }

    return 'en';
}

// Get all user languages
export function getAllUserLanguages(): Map<string, Language> {
    return new Map(userLanguagePreferences);
}
