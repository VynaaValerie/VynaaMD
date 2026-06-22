# Vynaa Bot - Guide & Features

Vynaa Bot is a high-performance WhatsApp bot designed for stability and efficient management.

## 🚀 Key Features
 
- **LID Retrieval**: Automatically get your User ID (LID).
- **Owner Only**: Strict access control ensuring only authorized users can use the bot.
- **Auto-Clean**: Systematic removal of temporary files (`tmp/`) every 10 minutes.
- **JSON Database**: Persistent data storage for users, chats, and settings.
- **Session Stability**: Advanced connection handling to keep the bot online 24/7.
- **Advanced Broadcast**: Multiple broadcast modes including targeting and delay options.

## 🛠️ Commands

### User Commands
- `.me`: Retrieve your LID (User ID). This is the only command accessible by everyone.
- `.ping`: Check bot response speed.

### Owner Commands
- `.menu`: Displays the full list of available features.
- `.listgc`: Lists all groups the bot is currently in.
- `.listadmin`: Lists admins of the current group.
- `.bc <text>`: Broadcast text message to all groups.
- `.bcpc <id> <text>`: Broadcast to a specific group's members via private chat.
- `.bcpcv2 <id> <text>`: Broadcast to a specific group's members with a 30-second delay.
- `.bctarget <numbers> | <text>`: Broadcast to specific numbers (comma separated) with a 30-60 second delay.
- `.share <text>`: Alternative command for broadcasting.

## ⚙️ Configuration

- **Owners**: Defined in `config.js`.
- **Database**: `database.json` (auto-saves every 30 seconds).
- **Temporary Files**: `tmp/` folder (auto-cleaned).

## 🛡️ Stability & Security
The bot uses a session-based connection system. If the connection drops, it will automatically attempt to reconnect unless the session is invalid.
