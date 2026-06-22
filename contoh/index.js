/* Made By Vynaa
  WhatsApp : wa.me/6282389924037
  Telegram : t.me/VynaaValerie
  Youtube  : @VegaTech
*/

import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  downloadContentFromMessage,
  getContentType,
  DisconnectReason
} from "@whiskeysockets/baileys";
import pino from "pino";
import chalk from "chalk";
import readline from "readline";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import http from "http";
import NodeCache from "node-cache";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Supaya log internal Baileys tidak banjir di konsol ──────────────────────
const BAILEYS_NOISE = [
  'SessionEntry','Closing session','sing session',
  '_chains','registrationId','currentRatchet',
  'indexInfo','baseKeyType','pendingPreKey',
  'ephemeralKeyPair','rootKey','privKey','pubKey',
  'lastRemoteEphemeralKey','remoteIdentityKey','chainKey',
  'messageKeys','chainType','previousCounter','signedKeyId',
  'preKeyId','baseKey'
];
const _origWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, encoding, cb) => {
  const text = typeof chunk === 'string' ? chunk : chunk.toString();
  if (BAILEYS_NOISE.some(n => text.includes(n))) {
    if (typeof encoding === 'function') encoding();
    else if (typeof cb === 'function') cb();
    return true;
  }
  return _origWrite(chunk, encoding, cb);
};

// Import handler pesan
import handler, { startPremiumChecker } from './case.js';

// ── LID → Phone mapping helpers (module-level) ────────────────────────────
function saveLidMapping(lidNum, phoneNum) {
  if (!lidNum || !phoneNum) return;
  if (!global.db?.lidMap) return;
  if (global.db.lidMap[lidNum] === phoneNum) return;
  global.db.lidMap[lidNum] = phoneNum;
  const lidJid = `${lidNum}@lid`;
  if (global.db.users?.[lidJid] && !global.db.users[lidJid].phone) {
    global.db.users[lidJid].phone = phoneNum;
  }
  try { fs.writeFileSync(global.dbFile, JSON.stringify(global.db, null, 2)); } catch {}
  console.log(chalk.green(`[LID] ${lidNum} → ${phoneNum}`));
}

// Baca semua lid-mapping-{lidNum}_reverse.json dari VynaaSesi saat startup
function loadLidMappingsFromSession(sessionDir) {
  try {
    const files = fs.readdirSync(sessionDir);
    let count = 0;
    for (const file of files) {
      const match = file.match(/^lid-mapping-(\d+)_reverse\.json$/);
      if (!match) continue;
      const lidNum = match[1];
      try {
        const raw = fs.readFileSync(path.join(sessionDir, file), 'utf8').trim();
        const phoneNum = JSON.parse(raw);
        if (typeof phoneNum === 'string' && /^\d+$/.test(phoneNum)) {
          if (global.db.lidMap[lidNum] !== phoneNum) {
            global.db.lidMap[lidNum] = phoneNum;
            const lidJid = `${lidNum}@lid`;
            if (global.db.users?.[lidJid] && !global.db.users[lidJid].phone) {
              global.db.users[lidJid].phone = phoneNum;
            }
            count++;
          }
        }
      } catch {}
    }
    if (count > 0) {
      console.log(chalk.green(`[LID] Loaded ${count} LID→phone mappings from session files`));
      try { fs.writeFileSync(global.dbFile, JSON.stringify(global.db, null, 2)); } catch {}
    } else {
      console.log(chalk.cyan(`[LID] Session mappings up-to-date (${Object.keys(global.db.lidMap).length} cached)`));
    }
  } catch (e) {
    console.error('[LID] Error loading session mappings:', e.message);
  }
}

// Tmp dir
const tmpDir = path.resolve(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

// Bersihkan tmp setiap 10 menit
setInterval(() => {
  try {
    fs.readdirSync(tmpDir).forEach(file => {
      const fp = path.join(tmpDir, file);
      if (Date.now() - fs.statSync(fp).mtimeMs > 3600000) fs.unlinkSync(fp);
    });
  } catch {}
}, 600000);

// Pairing mode
const usePairingCode = true;

async function question(prompt) {
  return new Promise(resolve => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });
    rl.question(prompt, ans => {
      rl.close();
      process.stdin.pause();
      resolve(ans.trim());
    });
  });
}

function unwrapMessage(m) {
  let msg = m?.message ?? m;
  while (
    msg?.ephemeralMessage || msg?.viewOnceMessage ||
    msg?.viewOnceMessageV2 || msg?.viewOnceMessageV2Extension ||
    msg?.documentWithCaptionMessage
  ) {
    msg = msg?.ephemeralMessage?.message ??
          msg?.viewOnceMessage?.message ??
          msg?.viewOnceMessageV2?.message ??
          msg?.viewOnceMessageV2Extension?.message ??
          msg?.documentWithCaptionMessage?.message;
  }
  return msg;
}

const logHeader = () => {
  process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');
  console.log(chalk.red('════════════════════════════════════════════'));
  console.log(chalk.hex('#FF00FF').bold('       🎭  Anonymous Chat — by Zeyora.id'));
  console.log(chalk.yellow('     WhatsApp : wa.me/6282389924037'));
  console.log(chalk.red('════════════════════════════════════════════'));
  console.log('');
};

const msgRetryCounterCache = new NodeCache();
const msgCache = new NodeCache({ stdTTL: 600 });

async function connectToWhatsApp() {
  logHeader();

  const sessionDir = path.resolve(__dirname, 'VynaaSesi');
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  // ── 1. Load SEMUA mapping yang sudah tersimpan di VynaaSesi/*_reverse.json ─
  loadLidMappingsFromSession(sessionDir);

  // ── 2. Monkey-patch state.keys.set untuk intercept mapping BARU real-time ──
  // Baileys menyimpan: { 'lid-mapping': { '{lidNum}_reverse': pnUser, '{pnUser}': lidUser } }
  const _origKeysSet = state.keys.set.bind(state.keys);
  state.keys.set = async function(data) {
    const lidData = data?.['lid-mapping'];
    if (lidData && typeof lidData === 'object') {
      for (const [key, value] of Object.entries(lidData)) {
        if (key.endsWith('_reverse') && typeof value === 'string' && /^\d+$/.test(value)) {
          const lidNum = key.replace('_reverse', '');
          saveLidMapping(lidNum, value);
        }
      }
    }
    return _origKeysSet(data);
  };

  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(chalk.cyan(`[INFO] WA v${version.join('.')}, isLatest: ${isLatest}`));

  const noopLogger = {
    level: 'silent',
    trace: () => {}, debug: () => {}, info: () => {},
    warn: () => {}, error: () => {}, fatal: () => {},
    child: () => noopLogger
  };

  const sock = makeWASocket({
    logger: noopLogger,
    printQRInTerminal: !usePairingCode,
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    version,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 10000,
    emitOwnEvents: true,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    getMessage: async (key) => msgCache.get(key.id) ?? { conversation: '' }
  });

  global.vynaa = sock;

  // ── Real-time intercept: monkey-patch keys.set sudah dipasang sebelum ini ─

  // Download media helper
  sock.downloadMediaMessage = async (input) => {
    try {
      const root = input?.message ? input : { message: input };
      const unwrapped = unwrapMessage(root.message);
      const type = getContentType(unwrapped);
      if (!type) throw new Error('Tidak ada media');
      const msgContent = unwrapped[type];
      const mediaKind = type.replace('Message', '');
      const stream = await downloadContentFromMessage(msgContent, mediaKind);
      let buffer = Buffer.alloc(0);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      return { buffer, mimetype: msgContent.mimetype, type: mediaKind };
    } catch (e) {
      throw new Error('Gagal download media');
    }
  };

  // Pairing code
  if (usePairingCode && !sock.authState.creds.registered) {
    try {
      const phone = await question('☘️  Masukkan nomor WA (awali 62): ');
      const code = await sock.requestPairingCode(phone.trim());
      console.log(chalk.green(`🎁 Pairing Code : ${code}`));
    } catch (e) {
      console.log(chalk.red('❌ Error pairing: ' + e.message));
    }
  }

  sock.ev.on('creds.update', saveCreds);

  // ── lid-mapping.update — supplementary event (newsletter notifications) ───
  // LIDMapping = { pn: 'xxx@s.whatsapp.net', lid: 'yyy@lid' }
  sock.ev.on('lid-mapping.update', (mapping) => {
    if (!mapping) return;
    const mappings = Array.isArray(mapping) ? mapping : [mapping];
    for (const m of mappings) {
      if (m?.pn && m?.lid) {
        saveLidMapping(m.lid.split('@')[0], m.pn.split('@')[0]);
      }
    }
  });

  // messaging-history.set — punya lidPnMappings (array LIDMapping)
  sock.ev.on('messaging-history.set', ({ contacts, lidPnMappings }) => {
    // Proses lidPnMappings dulu (paling akurat)
    if (lidPnMappings?.length) {
      for (const m of lidPnMappings) {
        if (m?.pn && m?.lid) {
          saveLidMapping(m.lid.split('@')[0], m.pn.split('@')[0]);
        }
      }
    }
    // Fallback: contacts array (pn = phone JID, lid = LID JID)
    if (contacts?.length) {
      for (const c of contacts) {
        if (c.pn?.endsWith('@s.whatsapp.net') && c.lid?.endsWith('@lid')) {
          saveLidMapping(c.lid.split('@')[0], c.pn.split('@')[0]);
        }
        // Format lama: c.id = phone, c.lid = lid
        if (c.lid && c.id?.endsWith('@s.whatsapp.net')) {
          saveLidMapping(c.lid.split('@')[0], c.id.split('@')[0]);
        }
        if (c.id?.endsWith('@lid') && c.phoneNumber) {
          saveLidMapping(c.id.split('@')[0], c.phoneNumber.replace(/\D/g, ''));
        }
      }
    }
  });

  // contacts.upsert & contacts.update — fallback
  const processContacts = (contacts) => {
    for (const c of contacts) {
      if (c.lid && c.id?.endsWith('@s.whatsapp.net')) {
        saveLidMapping(c.lid.split('@')[0], c.id.split('@')[0]);
      }
      if (c.id?.endsWith('@lid') && c.phoneNumber) {
        saveLidMapping(c.id.split('@')[0], c.phoneNumber.replace(/\D/g, ''));
      }
    }
  };
  sock.ev.on('contacts.upsert', processContacts);
  sock.ev.on('contacts.update', processContacts);

  // ── Connection Update ──────────────────────────────────────────────────────
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      console.log(chalk.red('❌ Koneksi terputus, reconnect...'));
      if (shouldReconnect) setTimeout(() => connectToWhatsApp(), 5000);

    } else if (connection === 'open') {
      global.vynaa = sock;
      console.log(chalk.green('✅ Anonymous Chat Bot terhubung ke WhatsApp!'));
      console.log(chalk.blue('🎭 Siap menerima pesan — by Zeyora.id'));
      console.log(chalk.cyan('─────────────────────────────────────────'));

      // Mulai premium expiry checker
      startPremiumChecker(sock);

      // Laporan ke developer (throttle 30 menit)
      const lastReport = global.lastOnlineReport || 0;
      if (Date.now() - lastReport > 30 * 60 * 1000) {
        setTimeout(async () => {
          try {
            await sock.sendMessage('6282389924037@s.whatsapp.net', {
              text: `✅ *Anonymous Chat Bot Online*\n\n🕐 ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n📱 wa.me/6282389924037\n\n_by Zeyora.id_`
            });
            global.lastOnlineReport = Date.now();
          } catch {}
        }, 4000);
      }

    } else if (connection === 'connecting') {
      console.log(chalk.yellow('🔄 Menghubungkan ke WhatsApp...'));
    }
  });

  // ── Messages Upsert ────────────────────────────────────────────────────────
  // Set untuk deduplicasi — cegah pesan yang sama diproses dua kali
  const processedIds = new Set();
  setInterval(() => { if (processedIds.size > 500) processedIds.clear(); }, 120000);

  sock.ev.on('messages.upsert', async (m) => {
    try {
      if (m.type !== 'notify') return;
      const msg = m.messages[0];
      if (!msg?.message) return;

      // Deduplikasi berdasarkan message ID
      const msgId = msg.key?.id;
      if (msgId) {
        if (processedIds.has(msgId)) return;
        processedIds.add(msgId);
      }

      // Cache untuk retry decrypt
      if (msg.key?.id && msg.message) msgCache.set(msg.key.id, msg.message);

      const jid = msg.key.remoteJid;
      const isGroup = jid?.endsWith('@g.us');
      const pushName = msg.pushName || 'Unknown';
      const msgType = getContentType(msg) || 'text';
      const msgText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        (msgType.replace('Message', '').toUpperCase() + ' Media');

      // Resolve nomor HP dari JID (handle @lid → nomor asli)
      const rawNum = jid?.split('@')[0] || '';
      let displayNum = rawNum;
      if (jid?.endsWith('@lid')) {
        // 1. Cek lidMap persisted (di database.json)
        const mapped = (global.db?.lidMap || {})[rawNum];
        if (mapped) {
          displayNum = mapped;
        } else {
          // 2. Cek field phone di record user
          const dbUser = global.db?.users?.[jid];
          if (dbUser?.phone) displayNum = dbUser.phone;
          else displayNum = `${rawNum}@lid`;
        }
      }

      // Log konsol
      console.log(chalk.cyan('─────────────────────────────────────────'));
      console.log(`${chalk.yellow.bold('» PESAN')} : ${isGroup ? chalk.magenta('[GROUP]') : chalk.green('[PRIVATE]')} ${chalk.gray(jid)}`);
      console.log(`${chalk.blue('» DARI')}  : ${chalk.cyan(pushName)} ${chalk.green('(' + displayNum + ')')}`);
      console.log(`${chalk.blue('» TIPE')}  : ${chalk.red(msgType)}`);
      console.log(`${chalk.blue('» ISI')}   : ${chalk.white(msgText)}`);

      // AutoRead
      if (global.db?.settings?.autoread) {
        try { await sock.readMessages([msg.key]); } catch {}
      }

      // Panggil handler
      await handler(sock, m);

    } catch (err) {
      console.log(chalk.red('❌ Error handler: ' + (err?.stack || err?.message)));
    }
  });

  return sock;
}

// ── HTTP keep-alive untuk Replit ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
http.createServer((req, res) => {
  const status = global.vynaa ? '🟢 Anonymous Chat Online' : '🔴 Bot Offline';
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`${status}\nAnonymous Chat — by Zeyora.id\n`);
}).listen(PORT, () => {
  console.log(chalk.cyan(`[HTTP] Keep-alive server port ${PORT}`));
});

connectToWhatsApp().catch(e => {
  console.log(chalk.red('❌ Fatal error: ' + e.message));
});
