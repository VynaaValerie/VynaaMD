import fs from 'fs';
import path from 'path';

global.owner = [
  "6285881770512",
  "6285335010300",
  "6282389924037",
  "261289217650892",
  "170420007391474",
  "242137790681132"
];

global.dbFile = path.resolve('./database.json');

const defaultDb = {
  users: {},
  sessions: {},
  queue: [],
  lidMap: {},
  settings: {
    autoread: true,
    botName: "Anonymous Chat",
    totalChats: 0
  }
};

if (!fs.existsSync(global.dbFile)) {
  fs.writeFileSync(global.dbFile, JSON.stringify(defaultDb, null, 2));
}

try {
  global.db = JSON.parse(fs.readFileSync(global.dbFile, 'utf8'));
} catch {
  global.db = defaultDb;
}

if (!global.db.users)    global.db.users    = {};
if (!global.db.sessions) global.db.sessions = {};
if (!global.db.queue)    global.db.queue    = [];
if (!global.db.lidMap)   global.db.lidMap   = {};
if (!global.db.settings) global.db.settings = defaultDb.settings;
if (typeof global.db.settings.totalChats === 'undefined') global.db.settings.totalChats = 0;

setInterval(() => {
  try {
    fs.writeFileSync(global.dbFile, JSON.stringify(global.db, null, 2));
  } catch (e) {}
}, 15000);
