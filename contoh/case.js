import './config.js';
import fs from 'fs';
import {
  generateWAMessageFromContent,
  generateMessageIDV2,
  normalizeMessageContent,
  isJidGroup,
  downloadMediaMessage
} from '@whiskeysockets/baileys';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

async function fetchThumbnail(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return undefined;
    return Buffer.from(await res.arrayBuffer());
  } catch { return undefined; }
}

// ─── SMALL CAPS FONT CONVERTER ────────────────────────────────────────────────
const SC_MAP = {
  'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ꜰ','g':'ɢ','h':'ʜ',
  'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
  'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
  'y':'ʏ','z':'ᴢ',
  'A':'ᴀ','B':'ʙ','C':'ᴄ','D':'ᴅ','E':'ᴇ','F':'ꜰ','G':'ɢ','H':'ʜ',
  'I':'ɪ','J':'ᴊ','K':'ᴋ','L':'ʟ','M':'ᴍ','N':'ɴ','O':'ᴏ','P':'ᴘ',
  'Q':'ǫ','R':'ʀ','S':'ꜱ','T':'ᴛ','U':'ᴜ','V':'ᴠ','W':'ᴡ','X':'x',
  'Y':'ʏ','Z':'ᴢ'
};
function sc(text) {
  return String(text).split('').map(c => SC_MAP[c] ?? c).join('');
}

// ─── ANTI-SPAM: cooldown 1.2 detik per user ──────────────────────────────────
const userCooldown = new Map();
const COOLDOWN_MS  = 1200;

function isOnCooldown(jid) {
  return Date.now() - (userCooldown.get(jid) || 0) < COOLDOWN_MS;
}
function setCooldown(jid) { userCooldown.set(jid, Date.now()); }
setInterval(() => {
  const now = Date.now();
  for (const [j, t] of userCooldown) if (now - t > 60000) userCooldown.delete(j);
}, 300000);

// ─── DB HELPERS ──────────────────────────────────────────────────────────────
function saveDb() {
  try { fs.writeFileSync(global.dbFile, JSON.stringify(global.db, null, 2)); } catch {}
}
function getUser(jid)      { return global.db.users[jid] || null; }
function setUser(jid, data) {
  global.db.users[jid] = { ...global.db.users[jid], ...data };
  saveDb();
}

// Cari user di DB berdasarkan nomor HP — cek 3 cara:
// 1. JID prefix match (@s.whatsapp.net langsung)
// 2. Field phone tersimpan di record user
// 3. Reverse lookup lewat global.db.lidMap (persisted LID → phone)
function findUserByPhone(phone) {
  const num = phone.replace(/\D/g, '');

  // 1. Direct @s.whatsapp.net
  const directJid = `${num}@s.whatsapp.net`;
  if (global.db.users[directJid]) return { jid: directJid, data: global.db.users[directJid] };

  // 2. Stored phone field di record user (untuk @lid yang sudah ada mapping)
  const byField = Object.entries(global.db.users).find(([, d]) => d.phone === num);
  if (byField) return { jid: byField[0], data: byField[1] };

  // 3. Reverse lookup dari lidMap (persisted): cari LID yang phone-nya == num
  const lidMap = global.db.lidMap || {};
  const lidNum = Object.entries(lidMap).find(([, p]) => p === num)?.[0];
  if (lidNum) {
    const lidJid = `${lidNum}@lid`;
    if (global.db.users[lidJid]) return { jid: lidJid, data: global.db.users[lidJid] };
  }

  return null;
}

// Normalisasi JID masuk @lid → JID tersimpan di DB
function resolveJid(rawJid) {
  if (!rawJid.endsWith('@lid')) return rawJid;
  const lidNum = rawJid.split('@')[0];

  // Coba via lidMap (persisted): dapat nomor HP → cek @s.whatsapp.net
  const phone = (global.db.lidMap || {})[lidNum];
  if (phone) {
    const phoneJid = `${phone}@s.whatsapp.net`;
    if (global.db.users[phoneJid]) return phoneJid;
  }

  // Cek langsung: ada entry @lid dengan LID yang sama?
  if (global.db.users[rawJid]) return rawJid;

  // Fallback: tetap pakai rawJid (user baru)
  return rawJid;
}
function isInSession(jid)  { return !!global.db.sessions[jid]; }
function getPartner(jid)   { return global.db.sessions[jid] || null; }

function createSession(jid1, jid2) {
  global.db.sessions[jid1] = jid2;
  global.db.sessions[jid2] = jid1;
  global.db.settings.totalChats = (global.db.settings.totalChats || 0) + 1;
  if (global.db.users[jid1]) global.db.users[jid1].totalChats = (global.db.users[jid1].totalChats || 0) + 1;
  if (global.db.users[jid2]) global.db.users[jid2].totalChats = (global.db.users[jid2].totalChats || 0) + 1;
  saveDb();
}
function endSession(jid) {
  const partner = global.db.sessions[jid];
  delete global.db.sessions[jid];
  if (partner) delete global.db.sessions[partner];
  saveDb();
  return partner;
}
function addToQueue(jid) {
  if (!global.db.queue.includes(jid)) { global.db.queue.push(jid); saveDb(); }
}
function removeFromQueue(jid) {
  global.db.queue = global.db.queue.filter(j => j !== jid);
  saveDb();
}
function isInQueue(jid) { return global.db.queue.includes(jid); }

// ─── KIRIM INTERACTIVE BUTTON (format referensi, pakai Baileys internal) ─────
//
// Format persis seperti contoh WA terbaru:
//   nativeFlowMessage: { buttons: [ { name, buttonParamsJson }, ... ] }
//
// Binary node yang WAJIB diinject agar button muncul di WA:
//   - biz > interactive(native_flow) > native_flow  ← semua chat
//   - bot(biz_bot=1)                                ← private chat only
//
// Ganti URL ini dengan thumbnail VynaaChat kamu
const CARD_THUMB = 'https://files.catbox.moe/xoarh5.jpg';

async function sendInteractiveBtn(sock, jid, bodyText, buttons, footerText = 'Zeyora.id', cardTitle = 'Anonymous Chat', cardBody = 'by Zeyora.id') {
  try {
    // Kirim card thumbnail dulu via sendMessage biasa (satu-satunya cara agar foto muncul)
    await sock.sendMessage(jid, {
      text: sc(bodyText),
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363427321491231@newsletter',
          serverMessageId: null,
          newsletterName: 'Zeyora.id',
        },
        externalAdReply: {
          title: cardTitle,
          body: cardBody,
          mediaType: 1,
          previewType: 1,
          thumbnail: await fetchThumbnail(CARD_THUMB),
          renderLargerThumbnail: true,
          mediaUrl: 'https://wa.me/6282389924037',
          sourceUrl: 'https://wa.me/6282389924037',
        }
      }
    });

    // Bangun nativeFlowMessage.buttons persis format referensi
    const nativeButtons = buttons.map(b => ({
      name:             b.name || 'quick_reply',
      buttonParamsJson: b.buttonParamsJson ?? JSON.stringify({
        display_text: b.label || b.display_text || 'OK',
        id:           b.id    || 'btn'
      })
    }));

    // interactiveMessage untuk tombol-tombolnya
    const content = {
      interactiveMessage: {
        body:   { text: '👇 Pilih:' },
        footer: { text: footerText },
        header: { hasMediaAttachment: false },
        nativeFlowMessage: { buttons: nativeButtons }
      }
    };

    // Buat WAMessage lewat Baileys internal (bypass validasi sendMessage)
    const userJid = sock.authState?.creds?.me?.id || sock.user?.id;
    const fullMsg  = generateWAMessageFromContent(jid, content, {
      logger:    sock.logger,
      userJid,
      messageId: generateMessageIDV2(userJid),
      timestamp: new Date()
    });

    // Binary node yang dibutuhkan agar WhatsApp render button
    const additionalNodes = [
      {
        tag: 'biz',
        attrs: {},
        content: [{
          tag: 'interactive',
          attrs: { type: 'native_flow', v: '1' },
          content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
        }]
      }
    ];
    // Private chat butuh node "bot" tambahan
    if (!isJidGroup(jid)) {
      additionalNodes.push({ tag: 'bot', attrs: { biz_bot: '1' } });
    }

    // Relay dengan binary node injection
    await sock.relayMessage(jid, fullMsg.message, {
      messageId:  fullMsg.key.id,
      additionalNodes
    });

  } catch (e) {
    // Fallback teks jika gagal
    console.log('[BTN-ERR]', e?.message);
    const opts = buttons.map((b, i) => `${i + 1}. ${b.label || b.display_text}`).join('\n');
    await sock.sendMessage(jid, {
      text: `${bodyText}\n\n${opts}\n\n_Balas angka pilihan atau ketik perintah._`
    });
  }
}

async function sendText(sock, jid, text) {
  await sock.sendMessage(jid, { text: sc(text) });
}

// ─── BACA RESPONSE BUTTON ────────────────────────────────────────────────────
// (format tangkap dari referensi + interactiveResponseMessage terbaru)
function getButtonId(msg) {
  // 1. quick_reply nativeFlowMessage (WA terbaru)
  try {
    const p = msg?.message?.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
    if (p) return JSON.parse(p)?.id || null;
  } catch {}
  // 2. Button biasa lama
  return (
    msg?.message?.buttonsResponseMessage?.selectedButtonId ||
    msg?.message?.templateButtonReplyMessage?.selectedId   ||
    msg?.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    null
  );
}

function isButtonResponse(msg) {
  return !!(
    msg?.message?.interactiveResponseMessage  ||
    msg?.message?.buttonsResponseMessage      ||
    msg?.message?.templateButtonReplyMessage  ||
    msg?.message?.listResponseMessage
  );
}

// ─── UI TEMPLATES ────────────────────────────────────────────────────────────

async function sendWelcome(sock, jid, name) {
  const text =
    `👋 ꜱᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ ᴅɪ ᴢᴇʏᴏʀᴀ ᴄʜᴀᴛ!\n\n` +
    `ᴅɪ ꜱɪɴɪ ᴋᴀᴍᴜ ʙɪꜱᴀ ʙᴇʀᴛᴇᴍᴜ ᴅᴀɴ ᴍᴇɴɢᴏʙʀᴏʟ ᴅᴇɴɢᴀɴ ᴏʀᴀɴɢ ʙᴀʀᴜ ꜱᴇᴄᴀʀᴀ ᴀɴᴏɴɪᴍ. ꜱɪᴀᴘᴀ ᴘᴜɴ ʙɪꜱᴀ ᴊᴀᴅɪ ᴛᴇᴍᴀɴ ɴɢᴏʙʀᴏʟᴍᴜ ʙᴇʀɪᴋᴜᴛɴʏᴀ, ᴀᴛᴀᴜ ꜱᴜᴍʙᴇʀ ᴛʀᴀᴜᴍᴀ ᴋᴇᴄɪʟ ʜᴀʀɪ ɪɴɪ. ꜱᴇᴍᴏɢᴀ ʏᴀɴɢ ᴘᴇʀᴛᴀᴍᴀ. 💬\n\n` +
    ``;

  await sendInteractiveBtn(sock, jid, text, [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👨 Cowok', id: 'gender_pria'   }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👩 Cewek', id: 'gender_wanita' }) }
  ], 'ᴘɪʟɪʜ ɢᴇɴᴅᴇʀ ᴋᴀᴍᴜ ᴅᴜʟᴜ:', 'Anonymous Chat', 'Daftar dulu — pilih gender kamu');
}

async function sendMainMenu(sock, jid) {
  const user = getUser(jid);
  if (!user) return;

  const cardText =
    `┌「 *Anonymous Chat* 」\n` +
    `│\n` +
    `└ Mau ngapain?`;

  // Baris list menu sekunder
  const listRows = [
    { header: '', title: '📋 Profil',       description: 'Lihat info akun kamu',          id: 'profil'       },
    { header: '', title: '👑 Info Premium',  description: 'Upgrade & lihat harga',          id: 'info_premium' },
    { header: '', title: '❓ FAQ',            description: 'Pertanyaan yang sering ditanya', id: 'faq'          },
    { header: '', title: '📜 S&K',           description: 'Syarat & Ketentuan pemakaian',   id: 'syarat'       }
  ];

  if (user.premium) {
    listRows.splice(1, 0, {
      header: '', title: '⚙️ Filter Gender',
      description: 'Pilih tipe pasangan chat', id: 'setting_filter'
    });
  }

  // Satu pesan: quick_reply "Cari Chat Baru" + single_select list
  const buttons = [
    {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({ display_text: '🔍 Cari Chat Baru', id: 'cari_chat' })
    },
    {
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: '≡ Menu Lainnya',
        sections: [{ title: 'Akun & Info', highlight_label: '', rows: listRows }]
      })
    }
  ];

  await sendInteractiveBtn(sock, jid, cardText, buttons, 'Zeyora.id', 'Anonymous Chat', 'by Zeyora.id');
}

async function sendProfileMenu(sock, jid) {
  const user = getUser(jid);
  if (!user) return;

  const badge  = user.premium ? 'Premium' : 'Free';
  const filter = user.premium && user.genderFilter
    ? (user.genderFilter === 'pria' ? 'Cowok aja' : 'Cewek aja')
    : 'Random';
  const joined = user.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString('id-ID')
    : '-';

  const genderLabel = user.gender === 'pria' ? '👨 Cowok' : '👩 Cewek';
  const text =
    `┌「 *Profil Kamu* 」\n` +
    `│\n` +
    `├ Nama     : ${user.name}\n` +
    `├ Gender   : ${genderLabel}\n` +
    `├ Status   : ${badge}\n` +
    (user.premium ? `├ Filter   : ${filter}\n` : '') +
    `├ Total Chat: ${user.totalChats || 0}x\n` +
    `│\n` +
    `└ Bergabung: ${joined}`;

  const premExpiry = user.premiumExpiry
    ? new Date(user.premiumExpiry).toLocaleDateString('id-ID')
    : '-';

  await sendInteractiveBtn(sock, jid, text, [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Ganti Gender', id: 'ganti_gender' }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Menu Utama',   id: 'back_menu'    }) }
  ], 'Zeyora.id', 'Profil Kamu', 'by Zeyora.id');
}

async function sendPremiumInfo(sock, jid) {
  const user = getUser(jid);
  const isPremium = user?.premium;
  const expiry = isPremium && user?.premiumExpiry
    ? new Date(user.premiumExpiry).toLocaleDateString('id-ID')
    : null;

  const text = isPremium
    ? `┌「 *Premium* 」\n` +
      `│\n` +
      `├ ✅ Kamu udah Premium!\n` +
      (expiry ? `├ 📅 Aktif sampai: *${expiry}*\n` : '') +
      `│\n` +
      `├ Yang kamu dapetin:\n` +
      `├ 👫 Filter pasangan by gender\n` +
      `├ ⚡ Prioritas antrian lebih cepat\n` +
      `├ 👑 Badge Premium di profil\n` +
      `│\n` +
      `└ Atur filter di menu Filter Gender ya.`
    : `┌「 *Info Premium* 」\n` +
      `│\n` +
      `├ Upgrade Premium, kamu bisa:\n` +
      `├ 👫 Pilih chat sama cowok / cewek\n` +
      `├ ⚡ Antrian lebih cepat\n` +
      `├ 👑 Badge Premium di profil\n` +
      `│\n` +
      `├ 💰 *Pricelist:*\n` +
      `├ 1 hari   → Rp 2.000\n` +
      `├ 4 hari   → Rp 5.000\n` +
      `├ 7 hari   → Rp 7.000\n` +
      `├ 15 hari  → Rp 10.000\n` +
      `├ 30 hari  → Rp 25.000\n` +
      `│\n` +
      `├ Hubungi owner buat upgrade:\n` +
      `└ wa.me/6282389924037`;

  await sendInteractiveBtn(sock, jid, text, [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Menu Utama', id: 'back_menu' }) }
  ], 'Zeyora.id', 'Info Premium', 'Upgrade akun kamu sekarang');
}

async function sendFilterMenu(sock, jid) {
  const user = getUser(jid);
  if (!user?.premium) {
    await sendText(sock, jid, 'Fitur ini khusus pengguna Premium.');
    return;
  }
  const current = user.genderFilter
    ? (user.genderFilter === 'pria' ? 'Cowok aja' : 'Cewek aja')
    : 'Random';

  await sendInteractiveBtn(sock, jid,
    `┌「 *Filter Gender* 」\n` +
    `│\n` +
    `├ Filter aktif: *${current}*\n` +
    `│\n` +
    `└ Pilih mau chat sama siapa:`, [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👨 Cowok aja',  id: 'filter_pria'   }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👩 Cewek aja',  id: 'filter_wanita' }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎲 Random',     id: 'filter_random' }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Menu Utama',    id: 'back_menu'     }) }
  ], 'Zeyora.id', 'Filter Gender', 'Pilih tipe pasangan chat kamu');
}

async function sendSearching(sock, jid) {
  const user   = getUser(jid);
  const filter = user?.premium && user?.genderFilter
    ? (user.genderFilter === 'pria' ? 'Cowok' : 'Cewek')
    : 'Random';

  await sendInteractiveBtn(sock, jid,
    `┌「 *Lagi Nyari...* 」\n` +
    `│\n` +
    `├ Filter : ${filter}\n` +
    `│\n` +
    `├ Bentar ya, otomatis terhubung\n` +
    `└ kalau ada yang match.`, [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⛔ Batal', id: 'stop_search' }) }
  ], 'Zeyora.id', 'Mencari Pasangan...', 'Tunggu sebentar ya');
}

async function sendConnected(sock, jid, partnerGender, isPremium) {
  const gLine = isPremium
    ? `├ Kamu lagi chat sama ${partnerGender === 'pria' ? '👨 cowok' : '👩 cewek'} anonim.\n`
    : `├ Kamu lagi chat sama orang asing.\n`;
  await sendInteractiveBtn(sock, jid,
    `┌「 *Terhubung!* 」\n` +
    `│\n` +
    `${gLine}` +
    `├ Identitas tetap anonim, santai aja.\n` +
    `│\n` +
    `└ Kirim pesan, foto, video, atau stiker!`, [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⛔ Stop Chat', id: 'stop_chat' }) }
  ], 'Zeyora.id', 'Terhubung!', 'Chat anonim dimulai');
}

async function sendGenderChangeMenu(sock, jid) {
  await sendInteractiveBtn(sock, jid,
    `┌「 *Ganti Gender* 」\n` +
    `│\n` +
    `└ Pilih gender baru kamu:`, [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👨 Cowok', id: 'gender_pria'   }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👩 Cewek', id: 'gender_wanita' }) }
  ], 'Zeyora.id', 'Ganti Gender', 'Pilih gender kamu');
}

// ─── FAQ & SYARAT KETENTUAN ───────────────────────────────────────────────────
async function sendFAQ(sock, jid) {
  const text =
    `┌「 *FAQ — Anonymous Chat* 」\n` +
    `│\n` +
    `├ ❓ *Apakah identitasku aman?*\n` +
    `├ Ya! Nama, nomor, dan info kamu\n` +
    `├ tidak akan diketahui siapapun.\n` +
    `│\n` +
    `├ ❓ *Gimana cara mulai chat?*\n` +
    `├ Pilih "Cari Chat Baru" di menu.\n` +
    `├ Bot otomatis carikan pasangan.\n` +
    `│\n` +
    `├ ❓ *Bisa pilih gender pasangan?*\n` +
    `├ Bisa, tapi khusus pengguna Premium.\n` +
    `│\n` +
    `├ ❓ *Cara keluar dari chat?*\n` +
    `├ Ketik /stop atau klik Stop Chat.\n` +
    `│\n` +
    `├ ❓ *Cara ganti ke pasangan baru?*\n` +
    `├ Ketik /next saat sedang chat.\n` +
    `│\n` +
    `└ Ada pertanyaan? wa.me/6282389924037`;

  await sendInteractiveBtn(sock, jid, text, [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Menu Utama', id: 'back_menu' }) }
  ], 'Zeyora.id', 'FAQ', 'Pertanyaan yang sering ditanya');
}

async function sendSyarat(sock, jid) {
  const text =
    `┌「 *Syarat & Ketentuan* 」\n` +
    `│\n` +
    `├ 📌 Dilarang mengirim konten:\n` +
    `├ • SARA, pornografi, kekerasan\n` +
    `├ • Spam atau iklan\n` +
    `├ • Data pribadi orang lain\n` +
    `│\n` +
    `├ 📌 Aturan penggunaan:\n` +
    `├ • Bot hanya untuk 18+\n` +
    `├ • Hormati sesama pengguna\n` +
    `├ • Penyalahgunaan = banned\n` +
    `│\n` +
    `├ 📌 Privasi:\n` +
    `├ • Percakapan tidak disimpan\n` +
    `├ • Identitas dijaga kerahasiaannya\n` +
    `│\n` +
    `└ Dengan pakai bot ini kamu setuju\n` +
    `  dengan semua ketentuan di atas.`;

  await sendInteractiveBtn(sock, jid, text, [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Menu Utama', id: 'back_menu' }) }
  ], 'Zeyora.id', 'Syarat & Ketentuan', 'Baca sebelum pakai');
}

// ─── PREMIUM EXPIRY CHECKER ───────────────────────────────────────────────────
function startPremiumChecker(sock) {
  // Migrasi startup: isi field phone untuk user lama yang belum punya
  try {
    let changed = false;
    for (const [jid, data] of Object.entries(global.db.users)) {
      if (!data.phone && jid.endsWith('@s.whatsapp.net')) {
        data.phone = jid.split('@')[0];
        changed = true;
      }
      // @lid user: ambil dari lidMap persisted
      if (!data.phone && jid.endsWith('@lid')) {
        const lidNum = jid.split('@')[0];
        const phone  = (global.db.lidMap || {})[lidNum];
        if (phone) { data.phone = phone; changed = true; }
      }
    }
    if (changed) saveDb();
  } catch {}

  setInterval(async () => {
    try {
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      for (const [jid, user] of Object.entries(global.db.users)) {
        if (!user.premium || !user.premiumExpiry) continue;
        const expiry = new Date(user.premiumExpiry).getTime();
        const remaining = expiry - now;

        if (remaining <= 0) {
          // Expired — hapus premium
          setUser(jid, { premium: false, genderFilter: null, premiumExpiry: null, premiumWarnSent: false });
          try {
            await sock.sendMessage(jid, {
              text: `⚠️ *Premium kamu sudah habis!*\n\nKamu kembali ke akun Free.\nUpgrade lagi? Hubungi owner:\nwa.me/6282389924037`
            });
          } catch {}
        } else if (remaining <= oneDayMs && !user.premiumWarnSent) {
          // 1 hari lagi — kirim warning
          setUser(jid, { premiumWarnSent: true });
          const exp = new Date(user.premiumExpiry).toLocaleDateString('id-ID');
          try {
            await sock.sendMessage(jid, {
              text: `⏰ *Peringatan!* Premium kamu habis besok (${exp}).\n\nSegera perpanjang biar ga putus:\nwa.me/6282389924037`
            });
          } catch {}
        }
      }
    } catch (e) {
      console.log('[PREM-CHECKER]', e?.message);
    }
  }, 30 * 60 * 1000); // cek setiap 30 menit
}

// ─── MATCHING ─────────────────────────────────────────────────────────────────
async function tryMatch(sock, seekerJid) {
  const seeker = getUser(seekerJid);
  if (!seeker) return;

  let candidates = global.db.queue.filter(jid =>
    jid !== seekerJid && !isInSession(jid) && getUser(jid) !== null
  );

  // Terapkan filter gender jika seeker Premium + punya filter
  if (seeker.premium && seeker.genderFilter) {
    const f = candidates.filter(jid => getUser(jid)?.gender === seeker.genderFilter);
    if (f.length > 0) candidates = f; else return; // tunggu dulu
  }

  // Buang kandidat Premium yang filternya tidak cocok dengan gender seeker
  candidates = candidates.filter(jid => {
    const c = getUser(jid);
    if (!c) return false;
    if (c.premium && c.genderFilter && c.genderFilter !== seeker.gender) return false;
    return true;
  });

  if (candidates.length === 0) return;

  const partnerJid    = candidates[Math.floor(Math.random() * candidates.length)];
  const partnerGender = getUser(partnerJid)?.gender;

  removeFromQueue(seekerJid);
  removeFromQueue(partnerJid);
  createSession(seekerJid, partnerJid);

  await sendConnected(sock, seekerJid, partnerGender, seeker.premium);
  await sendConnected(sock, partnerJid, seeker.gender, getUser(partnerJid)?.premium);
}

// ─── RELAY PESAN ANONIM (support semua tipe) ─────────────────────────────────
async function relayMessage(sock, fromJid, msg) {
  const partnerJid = getPartner(fromJid);
  if (!partnerJid) return;

  // Unwrap ephemeral / viewOnce
  let inner = msg.message;
  if (!inner) return;
  while (
    inner?.ephemeralMessage         ||
    inner?.viewOnceMessage          ||
    inner?.viewOnceMessageV2        ||
    inner?.viewOnceMessageV2Extension
  ) {
    inner =
      inner?.ephemeralMessage?.message           ??
      inner?.viewOnceMessage?.message            ??
      inner?.viewOnceMessageV2?.message          ??
      inner?.viewOnceMessageV2Extension?.message;
  }

  const type = inner ? Object.keys(inner)[0] : null;
  if (!type) return;

  // ── 1. Coba copyNForward dulu (paling ringan) ─────────────────────────────
  try {
    await sock.copyNForward(partnerJid, msg, false, {});
    return;
  } catch {}

  // ── 2. Fallback: download & kirim ulang per-tipe ─────────────────────────
  try {
    switch (type) {
      // Teks biasa
      case 'conversation':
        await sock.sendMessage(partnerJid, { text: inner.conversation });
        break;

      case 'extendedTextMessage':
        await sock.sendMessage(partnerJid, { text: inner.extendedTextMessage.text });
        break;

      // Gambar (foto)
      case 'imageMessage': {
        const buf = await downloadMediaMessage(msg, 'buffer', {});
        await sock.sendMessage(partnerJid, {
          image:    buf,
          caption:  inner.imageMessage.caption  || '',
          mimetype: inner.imageMessage.mimetype || 'image/jpeg'
        });
        break;
      }

      // Video
      case 'videoMessage': {
        const buf = await downloadMediaMessage(msg, 'buffer', {});
        await sock.sendMessage(partnerJid, {
          video:    buf,
          caption:  inner.videoMessage.caption  || '',
          mimetype: inner.videoMessage.mimetype || 'video/mp4'
        });
        break;
      }

      // Pesan suara / Voice Note (ptt=true) & audio biasa
      case 'audioMessage': {
        const buf = await downloadMediaMessage(msg, 'buffer', {});
        await sock.sendMessage(partnerJid, {
          audio:    buf,
          mimetype: inner.audioMessage.mimetype || 'audio/ogg; codecs=opus',
          ptt:      inner.audioMessage.ptt      || false  // true = voice note
        });
        break;
      }

      // Stiker
      case 'stickerMessage': {
        const buf = await downloadMediaMessage(msg, 'buffer', {});
        await sock.sendMessage(partnerJid, {
          sticker:  buf,
          mimetype: inner.stickerMessage.mimetype || 'image/webp',
          isAnimated: inner.stickerMessage.isAnimated || false
        });
        break;
      }

      // Dokumen / File
      case 'documentMessage': {
        const buf = await downloadMediaMessage(msg, 'buffer', {});
        await sock.sendMessage(partnerJid, {
          document: buf,
          mimetype: inner.documentMessage.mimetype  || 'application/octet-stream',
          fileName: inner.documentMessage.fileName  || 'file',
          caption:  inner.documentMessage.caption   || ''
        });
        break;
      }

      // Lokasi
      case 'locationMessage':
        await sock.sendMessage(partnerJid, {
          location: {
            degreesLatitude:  inner.locationMessage.degreesLatitude,
            degreesLongitude: inner.locationMessage.degreesLongitude
          }
        });
        break;

      // Kontak
      case 'contactMessage':
        await sock.sendMessage(partnerJid, {
          contacts: { contacts: [{ vcard: inner.contactMessage.vcard }] }
        });
        break;

      // GIF / video pendek
      case 'videoMessage' + '_gif': {
        const buf = await downloadMediaMessage(msg, 'buffer', {});
        await sock.sendMessage(partnerJid, {
          video:    buf,
          mimetype: 'video/mp4',
          gifPlayback: true
        });
        break;
      }

      default:
        // Tipe tidak dikenali — tidak diteruskan (diam saja)
        break;
    }
  } catch (err) {
    console.log('[RELAY-ERR]', type, err?.message);
  }
}

// ─── OWNER CHECK ─────────────────────────────────────────────────────────────
function isOwner(msg) {
  const sender = msg.key.participant || msg.key.remoteJid;
  const num    = sender.split('@')[0].replace('+', '');
  return global.owner.some(o => o.replace('+', '').split('@')[0] === num);
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
export { startPremiumChecker };
export default async (sock, m) => {
  try {
    const msg = m.messages[0];
    if (!msg?.message) return;

    const rawJid = msg.key.remoteJid;
    if (!rawJid) return;
    if (msg.key.fromMe) return; // abaikan pesan dari bot sendiri

    const isGroup = rawJid.endsWith('@g.us');

    // Ambil teks pesan
    const rawText = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption     ||
      msg.message?.videoMessage?.caption     ||
      ''
    ).trim();

    const PREFIX_REGEX = /^[\/\.!#$%^&*]/;
    const isCmd  = PREFIX_REGEX.test(rawText);
    const cmdRaw = isCmd ? rawText.slice(1).split(' ')[0].toLowerCase() : '';
    const args   = isCmd ? rawText.split(' ').slice(1).join(' ').trim() : '';

    // Group: balas kalau ada command, lalu stop
    if (isGroup) {
      if (isCmd) {
        const senderJid = msg.key.participant || rawJid;
        await sock.sendMessage(rawJid, {
          text:
            `𝚆𝚎𝚕𝚌𝚘𝚖𝚎 👋\n` +
            `𝙻𝚊𝚐𝚒 𝚐𝚊𝚋𝚞𝚝? 𝙼𝚊𝚜𝚞𝚔 𝚊𝚓𝚊. 𝚂𝚒𝚊𝚙𝚊 𝚝𝚊𝚑𝚞 𝚔𝚎𝚝𝚎𝚖𝚞 𝚝𝚎𝚖𝚊𝚗 𝚋𝚊𝚛𝚞, 𝚙𝚊𝚛𝚝𝚗𝚎𝚛 𝚖𝚊𝚋𝚊𝚛, 𝚊𝚝𝚊𝚞 𝚘𝚛𝚊𝚗𝚐 𝚛𝚊𝚗𝚍𝚘𝚖 𝚢𝚊𝚗𝚐 𝚓𝚞𝚐𝚊 𝚕𝚊𝚐𝚒 𝚋𝚒𝚗𝚐𝚞𝚗𝚐 𝚖𝚊𝚞 𝚗𝚐𝚊𝚙𝚊𝚒𝚗.\n\n` +
            `𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖: https://t.me/ZeyoraChatBot\n\n` +
            `𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙: https://wa.me/6283845541133?text=%2Fmenu`,
          mentions: [senderJid]
        });
      }
      return;
    }

    const jid = resolveJid(rawJid); // normalisasi @lid → JID yang tersimpan di DB

    const senderName    = msg.pushName || 'Pengguna';
    const isBtnResponse = isButtonResponse(msg);
    const btnId         = getButtonId(msg);
    const isOwnerSender = isOwner(msg);

    const user = getUser(jid);

    // Anti-spam cooldown (dikecualikan: relay saat dalam sesi, dan klik button)
    if (!isBtnResponse && !isInSession(jid)) {
      if (isOnCooldown(jid)) return;
      setCooldown(jid);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  OWNER COMMANDS
    // ══════════════════════════════════════════════════════════════════════════
    if (isOwnerSender && isCmd) {
      if (cmdRaw === 'menuowner') {
        await sendText(sock, jid,
          `┌「 *Menu Owner* 」\n│\n` +
          `├ /addprem [nomor] [hari]\n` +
          `├ /delprem [nomor]\n` +
          `├ /listprem\n` +
          `├ /ban [nomor]\n` +
          `├ /unban [nomor]\n` +
          `├ /stats\n` +
          `├ /listuser\n` +
          `└ /bc [pesan]`
        );
        return;
      }

      if (cmdRaw === 'addprem') {
        const parts  = args.trim().split(/\s+/);
        const target = parts[0]?.replace(/\D/g, '');
        const days   = parseInt(parts[1]);
        if (!target || !days || isNaN(days) || days < 1)
          return sendText(sock, jid, '❌ Format: /addprem [nomor] [hari]');
        const found = findUserByPhone(target);
        if (!found) return sendText(sock, jid, `❌ User ${target} belum daftar.`);
        const tJid  = found.jid;
        const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        setUser(tJid, { premium: true, premiumExpiry: expiry, premiumWarnSent: false });
        const expDate = new Date(expiry).toLocaleDateString('id-ID');
        await sendText(sock, jid, `✅ ${target} sekarang Premium selama *${days} hari*.\nAktif sampai: ${expDate}`);
        await sock.sendMessage(tJid, {
          text: sc(`🎉 Selamat! Kamu udah aktif Premium!\n\n` +
                `├ Durasi : ${days} hari\n` +
                `└ Sampai : ${expDate}\n\n` +
                `Fitur yang kamu dapat:\n` +
                `👫 Filter pasangan by gender\n` +
                `⚡ Prioritas antrian lebih cepat\n\n` +
                `Ketik /menu untuk mulai.`)
        });
        return;
      }

      if (cmdRaw === 'delprem') {
        const target = args.replace(/\D/g, '');
        if (!target) return sendText(sock, jid, '❌ Format: /delprem [nomor]');
        const found = findUserByPhone(target);
        if (!found) return sendText(sock, jid, `❌ User tidak ditemukan.`);
        const tJid = found.jid;
        setUser(tJid, { premium: false, genderFilter: null, premiumExpiry: null, premiumWarnSent: false });
        await sendText(sock, jid, `✅ Premium ${target} dihapus.`);
        await sock.sendMessage(tJid, { text: sc(`⚠️ Premium kamu telah dicabut oleh owner.`) });
        return;
      }

      if (cmdRaw === 'listprem') {
        const prems = Object.entries(global.db.users).filter(([, d]) => d.premium);
        if (!prems.length) return sendText(sock, jid, 'Belum ada pengguna Premium.');
        let text = `┌「 *Daftar Premium* 」\n│\n`;
        prems.forEach(([u, d], i) => {
          const exp = d.premiumExpiry
            ? new Date(d.premiumExpiry).toLocaleDateString('id-ID')
            : 'Tanpa batas';
          // Resolve nomor HP: cek field phone, lalu lidMap, lalu fallback ke JID prefix
          let displayNum = d.phone || null;
          if (!displayNum && u.endsWith('@lid')) {
            const lidNum = u.split('@')[0];
            displayNum = (global.db.lidMap || {})[lidNum] || lidNum;
          }
          if (!displayNum) displayNum = u.split('@')[0];
          const displayName = d.name ? ` (${d.name})` : '';
          text += `├ ${i + 1}. ${displayNum}${displayName} — s/d ${exp}\n`;
        });
        text += `│\n└ Total: ${prems.length} user`;
        await sendText(sock, jid, text);
        return;
      }

      if (cmdRaw === 'addpremium') {
        return sendText(sock, jid, '❌ Perintah lama. Pakai /addprem [nomor] [hari]');
      }

      if (cmdRaw === 'ban') {
        const target = args.replace(/\D/g, '');
        if (!target) return sendText(sock, jid, '❌ Format: /ban [nomor]');
        const found = findUserByPhone(target);
        if (!found) return sendText(sock, jid, `❌ User tidak ditemukan.`);
        const tJid = found.jid;
        setUser(tJid, { banned: true });
        endSession(tJid); removeFromQueue(tJid);
        await sendText(sock, jid, `✅ ${target} di-ban.`);
        await sendText(sock, tJid, `❌ Kamu di-ban dari Anonymous Chat.`);
        return;
      }
      if (cmdRaw === 'unban') {
        const target = args.replace(/\D/g, '');
        if (!target) return sendText(sock, jid, '❌ Format: /unban [nomor]');
        const found = findUserByPhone(target);
        if (!found) return sendText(sock, jid, `❌ User tidak ditemukan.`);
        setUser(found.jid, { banned: false });
        await sendText(sock, jid, `✅ ${target} di-unban.`);
        return;
      }
      if (cmdRaw === 'bc' || cmdRaw === 'broadcast') {
        if (!args) return sendText(sock, jid, '❌ Format: /bc [pesan]');
        const all = Object.keys(global.db.users);
        let sent = 0, failed = 0;
        for (const u of all) {
          try {
            await sock.sendMessage(u, { text: `📢 *Pengumuman*\n\n${args}\n\n_— Anonymous Chat_` });
            sent++;
            await new Promise(r => setTimeout(r, 600));
          } catch { failed++; }
        }
        await sendText(sock, jid, `✅ BC selesai. Terkirim: ${sent} · Gagal: ${failed}`);
        return;
      }
      if (cmdRaw === 'stats') {
        const users = Object.values(global.db.users);
        const prem  = users.filter(u => u.premium).length;
        const pria  = users.filter(u => u.gender === 'pria').length;
        const wan   = users.filter(u => u.gender === 'wanita').length;
        const sesi  = Math.floor(Object.keys(global.db.sessions).length / 2);
        await sendText(sock, jid,
          `┌「 *Statistik Anonymous Chat* 」\n│\n` +
          `├ Total user : ${users.length}\n` +
          `├ Cowok      : ${pria}\n` +
          `├ Cewek      : ${wan}\n` +
          `├ Premium    : ${prem}\n` +
          `├ Sesi aktif : ${sesi}\n` +
          `├ Antrian    : ${global.db.queue.length}\n` +
          `└ Total chat : ${global.db.settings.totalChats || 0}`
        );
        return;
      }
      if (cmdRaw === 'listuser') {
        const entries = Object.entries(global.db.users).slice(0, 20);
        if (!entries.length) return sendText(sock, jid, 'Belum ada user.');
        let text = `┌「 *Daftar User (max 20)* 」\n│\n`;
        entries.forEach(([u, d], i) => {
          let displayNum = d.phone || null;
          if (!displayNum && u.endsWith('@lid')) {
            const lidNum = u.split('@')[0];
            displayNum = (global.db.lidMap || {})[lidNum] || lidNum;
          }
          if (!displayNum) displayNum = u.split('@')[0];
          const displayName = d.name ? ` (${d.name})` : '';
          const gender = d.gender === 'pria' ? 'Cowok' : d.gender === 'wanita' ? 'Cewek' : '?';
          text += `├ ${i + 1}. ${d.premium ? '👑' : '👤'} ${displayNum}${displayName} — ${gender}\n`;
        });
        text += `└ Total: ${entries.length}`;
        await sendText(sock, jid, text);
        return;
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  CEK BAN
    // ══════════════════════════════════════════════════════════════════════════
    if (user?.banned) {
      await sendText(sock, jid, '❌ Kamu di-ban dari Anonymous Chat.');
      return;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  BELUM TERDAFTAR → WELCOME + PILIH GENDER
    // ══════════════════════════════════════════════════════════════════════════
    if (!user || !user.registered) {
      if (btnId === 'gender_pria' || btnId === 'gender_wanita') {
        const gender = btnId === 'gender_pria' ? 'pria' : 'wanita';
        // Simpan nomor HP di field phone agar bisa dicari pakai findUserByPhone
        let phone = null;
        if (jid.endsWith('@s.whatsapp.net')) {
          phone = jid.split('@')[0];
        } else if (jid.endsWith('@lid')) {
          const lidNum = jid.split('@')[0];
          phone = (global.lidPhoneMap || {})[lidNum] || null;
        }
        setUser(jid, {
          jid, name: senderName, gender, phone,
          premium: false, genderFilter: null,
          registered: true, banned: false,
          joinedAt: new Date().toISOString(), totalChats: 0
        });
        await sendText(sock, jid, `Oke, kamu terdaftar sebagai *${gender === 'pria' ? 'Cowok' : 'Cewek'}*!`);
        await sendMainMenu(sock, jid);
        return;
      }
      await sendWelcome(sock, jid, senderName);
      return;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  PERINTAH TEKS
    // ══════════════════════════════════════════════════════════════════════════
    if (cmdRaw === 'stop' || btnId === 'stop_chat' || btnId === 'stop_search') {
      if (isInQueue(jid)) {
        removeFromQueue(jid);
        await sendText(sock, jid, 'Pencarian dibatalkan.');
        await sendMainMenu(sock, jid);
        return;
      }
      if (isInSession(jid)) {
        const partner = endSession(jid);
        await sendText(sock, jid, 'Chat diakhiri.');
        await sendMainMenu(sock, jid);
        if (partner) {
          await sendText(sock, partner, 'Orang yang kamu chat barusan udah keluar.');
          await sendMainMenu(sock, partner);
        }
        return;
      }
      await sendText(sock, jid, 'Kamu lagi ga ada di sesi chat.');
      await sendMainMenu(sock, jid);
      return;
    }

    if (cmdRaw === 'next') {
      if (isInSession(jid)) {
        const partner = endSession(jid);
        if (partner) { await sendText(sock, partner, 'Orang yang kamu chat lagi nyari orang baru.'); await sendMainMenu(sock, partner); }
      }
      removeFromQueue(jid);
      addToQueue(jid);
      await sendSearching(sock, jid);
      await tryMatch(sock, jid);
      return;
    }

    if (cmdRaw === 'menu' || cmdRaw === 'start') { await sendMainMenu(sock, jid); return; }
    if (cmdRaw === 'profil' || cmdRaw === 'profile') { await sendProfileMenu(sock, jid); return; }
    if (cmdRaw === 'faq') { await sendFAQ(sock, jid); return; }
    if (cmdRaw === 'sk' || cmdRaw === 'syarat') { await sendSyarat(sock, jid); return; }

    // ══════════════════════════════════════════════════════════════════════════
    //  BUTTON RESPONSES
    // ══════════════════════════════════════════════════════════════════════════
    if (btnId) {
      if (btnId === 'gender_pria' || btnId === 'gender_wanita') {
        if (isInSession(jid)) {
          const p = endSession(jid);
          if (p) { await sendText(sock, p, 'Orang yang kamu chat barusan udah keluar.'); await sendMainMenu(sock, p); }
        }
        removeFromQueue(jid);
        const gender = btnId === 'gender_pria' ? 'pria' : 'wanita';
        setUser(jid, { gender });
        await sendText(sock, jid, `Gender diubah ke *${gender === 'pria' ? 'Cowok' : 'Cewek'}*.`);
        await sendMainMenu(sock, jid);
        return;
      }

      if (btnId === 'cari_chat') {
        if (isInSession(jid)) { await sendText(sock, jid, 'Kamu lagi chat sekarang. Ketik /stop dulu.'); return; }
        if (isInQueue(jid))   { await sendText(sock, jid, 'Masih lagi nyari, tunggu dulu ya...'); return; }
        addToQueue(jid);
        await sendSearching(sock, jid);
        await tryMatch(sock, jid);
        return;
      }

      if (btnId === 'profil')         { await sendProfileMenu(sock, jid);      return; }
      if (btnId === 'info_premium')   { await sendPremiumInfo(sock, jid);      return; }
      if (btnId === 'setting_filter') { await sendFilterMenu(sock, jid);       return; }
      if (btnId === 'ganti_gender')   { await sendGenderChangeMenu(sock, jid); return; }
      if (btnId === 'back_menu')      { await sendMainMenu(sock, jid);         return; }
      if (btnId === 'faq')            { await sendFAQ(sock, jid);              return; }
      if (btnId === 'syarat')         { await sendSyarat(sock, jid);           return; }

      if (btnId === 'filter_pria' || btnId === 'filter_wanita' || btnId === 'filter_random') {
        if (!user.premium) { await sendText(sock, jid, 'Fitur ini khusus pengguna Premium.'); return; }
        let filter = null, label = 'Random';
        if (btnId === 'filter_pria')   { filter = 'pria';   label = 'Cowok aja'; }
        if (btnId === 'filter_wanita') { filter = 'wanita'; label = 'Cewek aja'; }
        setUser(jid, { genderFilter: filter });
        await sendText(sock, jid, `Filter diubah ke *${label}*.`);
        await sendMainMenu(sock, jid);
        return;
      }

      // Button tidak dikenali → menu
      await sendMainMenu(sock, jid);
      return;
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  PESAN BIASA
    // ══════════════════════════════════════════════════════════════════════════
    if (isInSession(jid)) { await relayMessage(sock, jid, msg); return; }
    if (isInQueue(jid))   { return; } // abaikan pesan saat mencari

    // Registered tapi tidak dalam sesi/antrian → hint singkat (bukan spam menu)
    if (!isCmd && rawText) {
      await sendText(sock, jid, `Ketik /menu untuk buka menu, atau /stop buat keluar chat.`);
    }

  } catch (err) {
    console.error('[HANDLER ERROR]', err?.message || err);
  }
};
