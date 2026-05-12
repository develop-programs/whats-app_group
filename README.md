# WhatsApp Group Automation Bot with Household Chores System

A Node.js + TypeScript bot that connects to WhatsApp Web, creates or joins groups, listens to incoming messages, and manages household chores. Built with a clean, modular architecture where each responsibility is separated into focused modules.

Built on top of [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).

---

## Overview

This project automates WhatsApp group management, message handling, and **household chores automation**. It can:
- Authenticate via QR code scan
- Create new WhatsApp groups with specified participants
- Connect to existing groups
- Listen for incoming messages and execute commands
- Track group membership changes (joins, leaves, updates)
- Log all activities to a file for audit trails
- **Manage household chores** (assign, track, remind)
- **Register family members** and assign tasks
- **Generate chore statistics** and weekly plans

---

## Features

- **QR Code Authentication** - Scan QR code in terminal to log in to WhatsApp Web
- **Group Creation** - Programmatically create groups by phone number or contact name
- **Group Connection** - Find and connect to existing groups
- **Message Listening** - Monitor and react to messages in real time
- **Command System** - Built-in commands: !ping, !logs, !help
- **Activity Logging** - All events logged to file with timestamps
- **Welcome Messages** - Automatically greet new members
- **Member Tracking** - Track joins, leaves, and group updates
- **Clean Architecture** - Modular code with separated concerns
- **Chores Management** - Create, assign, and track household chores
- **Family Member Registration** - Add family members with roles and contact info
- **Chore Categories** - Cleaning, Laundry, Cooking, Gardening, Babysitting
- **Priority Levels** - Set high, medium, or low priority for each chore
- **Status Tracking** - Pending, In-Progress, Completed statuses
- **Statistics & Reports** - View completion rates and weekly plans
- **CSV Storage** - All data stored in CSV files for easy access

---

## Tech Stack

| Package | Purpose |
|---|---|
| `whatsapp-web.js` | WhatsApp Web automation |
| `qrcode-terminal` | Display QR codes in terminal |
| `googleapis` | Google API integration |
| `typescript` | Type-safe JavaScript |
| `ts-node` | Run TypeScript directly in Node.js |

---

## Project Architecture

### Module Structure

```
src/
├── index.ts              # Application entry point
├── config.ts             # Configuration constants
├── logger.ts             # Logging utilities
├── client.ts             # WhatsApp client factory
├── group-service.ts      # Group management logic
├── event-handlers.ts     # WhatsApp event handlers
├── chores-config.ts      # Chores types and configuration
├── chores-storage.ts     # CSV file management for chores
└── chores-service.ts     # Chores business logic
```

### Module Responsibilities

**config.ts** - Centralized configuration
- Target group name
- Initial participants
- Logging file path
- Timing delays
- Message limits

**logger.ts** - Activity logging
- `logActivity()` - Write logs with timestamps
- `getRecentLogs()` - Retrieve recent activity
- `logFileExists()` - Check log file presence

**client.ts** - Client initialization
- `initializeClient()` - Create WhatsApp client instance
- `destroyClient()` - Clean shutdown and cleanup

**group-service.ts** - Group operations
- `syncGroup()` - Find or create target group
- `refreshGroupReference()` - Update group reference
- Participant lookup by phone or name
- Past activity fetching

**event-handlers.ts** - Event management
- QR code display
- Authentication handling
- Client ready state
- Message processing with commands
- Member join/leave notifications
- Group updates tracking
- Disconnection handling
- Chore command processing

**chores-config.ts** - Chores configuration
- Chore types (Category, Priority, Status)
- Sample chores for each category
- Configuration constants

**chores-storage.ts** - Chores data storage
- Initialize CSV files
- Add/retrieve chores from CSV
- Add/retrieve family members from CSV
- Update chore status

**chores-service.ts** - Chores business logic
- Create chores and register members
- Query chores by status, person, or date
- Calculate statistics
- Generate weekly plans
- Get person-specific summaries

**index.ts** - Bootstrap
- Client initialization
- Event handler setup
- Graceful shutdown management

---

## Available Commands

### Basic Commands

| Command | Description |
|---|---|
| `!ping` | Check if bot is alive |
| `!logs` | Show last 10 activities |
| `!help` | Display all available commands |

### Chore Commands

**View Chores**
| Command | Description |
|---|---|
| `!chores-pending` | Show all pending chores |
| `!chores-completed` | Show recently completed chores |
| `!chores-today` | Show chores due today |
| `!chores-overdue` | Show overdue chores |
| `!chores-stats` | Show overall chore statistics |
| `!chores-weekly` | Show weekly chore plan |
| `!chores-my` | Show your assigned chores |

**Manage Chores**
| Command | Example |
|---|---|
| `!register-member Name Phone Role` | `!register-member Sarah +919876543210 Parent` |
| `!add-chore Name Category Person Priority DueDate` | `!add-chore "Clean bathroom" cleaning Sarah high 2026-05-15` |

---

## Chore System Details

### Chore Categories

- **cleaning** - Cleaning (sweeping, mopping, dusting)
- **laundry** - Laundry (washing, drying, ironing)
- **cooking** - Cooking (meal prep, cooking, dishes)
- **gardening** - Gardening (watering, weeding, lawn care)
- **babysitting** - Babysitting and childcare

### Priority Levels

- **high** - Urgent, should be done immediately
- **medium** - Important, should be done soon
- **low** - Can be done when convenient

### Chore Status

- **pending** - Not started yet
- **in-progress** - Currently being worked on
- **completed** - Finished

For detailed chore system documentation, see [CHORES_GUIDE.md](CHORES_GUIDE.md).

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v8 or higher
- Active WhatsApp account on mobile phone

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configuration

Edit [src/config.ts](src/config.ts) to customize:

```typescript
TARGET_GROUP_NAME: 'testing group'           // Group to monitor
INITIAL_PARTICIPANTS: ['+919294512259']      // Members to add when creating group
LOG_FILE: 'group_activity.log'               // Activity log file
GROUP_SYNC_DELAY: 5000                       // Wait time for group sync (ms)
GROUP_CREATION_DELAY: 3000                   // Wait time after group creation (ms)
MESSAGE_FETCH_LIMIT: 50                      // Past messages to fetch
RECENT_LOGS_LIMIT: 10                        // Recent logs to show in !logs command
```

### 3. Chores System Setup

The chores system is automatically initialized when the bot starts. It will create:
- `chores.csv` - Stores all household chores
- `family_members.csv` - Stores registered family members

You can pre-populate these files or add members/chores via WhatsApp commands.

---

## Running the Bot

### Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Build
```bash
npm start
```

---

## How It Works

1. **Launch** - Run `npm run dev` to start the bot
2. **Authenticate** - Scan the QR code displayed in terminal with your phone
3. **Connect** - Bot connects to WhatsApp Web and loads chats
4. **Sync Groups** - Bot finds existing group or creates new one with specified participants
5. **Initialize Chores** - Chores system initializes CSV files for data storage
6. **Listen** - Bot monitors the target group for incoming messages
7. **Respond** - Bot responds to commands and logs all activity
8. **Manage Chores** - Handle chore assignments, tracking, and reporting via WhatsApp
9. **Track** - Bot tracks member joins, leaves, group updates, and chore completions
10. **Shutdown** - Press Ctrl+C for graceful shutdown

---

## Using the Chores System

### Quick Start

1. Register family members:
   ```
   !register-member Alice +919876543210 Parent
   !register-member Bob +919876543211 Parent
   ```

2. Add chores:
   ```
   !add-chore "Clean bathroom" cleaning Alice high 2026-05-15
   !add-chore "Wash dishes" cooking Bob medium 2026-05-14
   ```

3. View and track:
   ```
   !chores-today
   !chores-my
   !chores-stats
   ```

See [CHORES_GUIDE.md](CHORES_GUIDE.md) for comprehensive documentation.

---

## Log File Format

Activities are logged to `group_activity.log` with timestamp format:

```
[5/12/2026, 3:45:30 PM] Message from John: Hello everyone
[5/12/2026, 3:46:15 PM] Join: Sarah joined the group
[5/12/2026, 3:47:00 PM] System: Bot is online and monitoring "testing group"
```

---

## File Organization

```
whats-app_group/
├── src/
│   ├── index.ts              # Application entry point
│   ├── config.ts             # Configuration constants
│   ├── logger.ts             # Logging utilities
│   ├── client.ts             # Client initialization
│   ├── group-service.ts      # Group management
│   ├── event-handlers.ts     # Event handlers
│   ├── chores-config.ts      # Chores types and config
│   ├── chores-storage.ts     # Chores CSV storage
│   └── chores-service.ts     # Chores business logic
├── dist/                     # Compiled output (generated)
├── chores.csv                # Chores data (generated)
├── family_members.csv        # Family members data (generated)
├── group_activity.log        # Activity log (generated)
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── README.md                 # This file
└── CHORES_GUIDE.md          # Chores system documentation
```

---

## Troubleshooting

### QR Code Not Appearing
- Ensure terminal supports graphics
- Check WhatsApp is not already logged in on this browser
- Clear `.wwebjs_auth` folder if it exists

### Group Not Found
- Verify group name in `config.ts` matches exactly
- Check bot has access to the group
- Ensure group exists in WhatsApp

### Messages Not Being Received
- Verify bot is in the target group
- Check group name matches configuration
- Review `group_activity.log` for errors

### Connection Timeout
- Check internet connection
- WhatsApp might be blocking the session
- Try clearing authentication with `npm run clean-auth` (if added)

---

## Security Considerations

- Store sensitive data in environment variables (not hardcoded)
- Use strong participant lists
- Review logged activities regularly
- Keep dependencies updated
- Use `.gitignore` to exclude `.wwebjs_auth` folder

---

## Dependencies

See [package.json](package.json) for complete list. Key dependencies:
- `whatsapp-web.js` - WhatsApp Web automation
- `qrcode-terminal` - Terminal QR display
- `csv-writer` - CSV file writing
- `csv-parse` - CSV file parsing
- `uuid` - Unique ID generation
- `typescript` - Type safety
- `ts-node` - TypeScript execution

---

## Notes

- This bot uses WhatsApp Web via Puppeteer automation
- Activity logging helps audit group interactions
- Commands can be extended by adding handlers in `event-handlers.ts`
- Configuration is centralized for easy updates

---

## Future Enhancements

Potential features to add:
- Database integration for activity storage
- Scheduled messages
- Admin commands for group management
- Analytics dashboard
- Message filtering and search
- Integration with external APIs
- Media handling
- Recurring/repeating chores
- Chore rotation among family members
- Points/rewards system for completed chores
- Photo evidence of completed chores
- Send chore reminders via WhatsApp at specific times
- Chore history and analytics
- Mobile app integration for tracking

---

## Support

For issues or questions, review the code comments in each module for detailed explanations.

## 🛠️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/whats-app_group.git
cd whats-app_group

# 2. Install dependencies
npm install
```

---

## ▶️ Usage

### Development

```bash
npm run dev
```

### Build & Run

```bash
# Compile TypeScript
npm run build

# Run compiled output
npm start
```

---

## 🔐 Authentication

On first run, a **QR code** will appear in your terminal.

1. Open **WhatsApp** on your phone
2. Go to **Settings → Linked Devices → Link a Device**
3. Scan the QR code in the terminal
4. ✅ You're connected!

> Your session is saved locally so you won't need to scan again on subsequent runs.

---

## 📬 How It Works

```
Start App
   │
   ▼
Generate QR Code (terminal)
   │
   ▼
User Scans QR → WhatsApp Web Session Established
   │
   ├── Create New Group  ──► Add participants by phone number
   │
   ├── Connect to Existing Group  ──► Find group by name
   │
   └── Listen to Messages  ──► React / log / forward incoming messages
```

---

## 🧪 Example Workflow

```typescript
// Listen to messages in a specific group
client.on('message', async (message) => {
  const chat = await message.getChat();

  if (chat.isGroup && chat.name === 'My Target Group') {
    console.log(`[${chat.name}] ${message.from}: ${message.body}`);
  }
});
```

---

## 🚧 Roadmap

- [ ] Auto-reply to specific keywords
- [ ] Log messages to Google Sheets via Googleapis
- [ ] Generate QR code invite links for groups
- [ ] Schedule messages to groups
- [ ] Web dashboard to monitor groups

---

## ⚠️ Disclaimer

This project uses an unofficial WhatsApp Web API. Use responsibly and in accordance with [WhatsApp's Terms of Service](https://www.whatsapp.com/legal/terms-of-service). Automated messaging may result in your account being banned if misused.

---

## 📄 License

ISC © Shreyansh
