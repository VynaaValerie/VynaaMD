process.env.TZ = 'Asia/Jakarta'

const moment  = require('moment-timezone')
const { fetchThumbnail } = require('../../lib/sendInteractiveBtn')

const arrayMenu = [
  'all', 'ai', 'main', 'downloader', 'database', 'rpg', 'rpgG',
  'sticker', 'advanced', 'xp', 'fun', 'game', 'github', 'group',
  'image', 'nsfw', 'info', 'internet', 'islam', 'kerang', 'maker',
  'news', 'owner', 'voice', 'quotes', 'store', 'stalk', 'shortlink',
  'tools', 'anonymous'
]

const allTags = {
  all: 'SEMUA MENU', ai: 'AI', main: 'UTAMA', downloader: 'DOWNLOADER',
  database: 'DATABASE', rpg: 'RPG', rpgG: 'RPG GUILD', sticker: 'STICKER',
  advanced: 'ADVANCED', xp: 'XP & LEVEL', fun: 'FUN', game: 'GAME',
  github: 'GITHUB', group: 'GROUP', image: 'IMAGE', nsfw: 'NSFW',
  info: 'INFO', internet: 'INTERNET', islam: 'ISLAM', kerang: 'KERANG AJAIB',
  maker: 'MAKER', news: 'NEWS', owner: 'OWNER', voice: 'VOICE',
  quotes: 'QUOTES', store: 'STORE', stalk: 'STALK', shortlink: 'SHORTLINK',
  tools: 'TOOLS', anonymous: 'ANONYMOUS'
}

// ── Konfigurasi card ──────────────────────────────────────────────────────────
const CARD_THUMB      = 'https://files.catbox.moe/xoarh5.jpg'
const CARD_URL        = 'https://wa.me/6282389924037'
const NEWSLETTER_JID  = '120363427321491231@newsletter'
const NEWSLETTER_NAME = 'VynaaMD'

// Cache thumbnail agar tidak fetch berulang
let _thumbCache = null
async function getThumb() {
  if (_thumbCache) return _thumbCache
  _thumbCache = await fetchThumbnail(CARD_THUMB)
  return _thumbCache
}

// ── Helper kirim pesan dengan style tmenu2 ────────────────────────────────────
async function sendCard(conn, jid, text, thumb, m) {
  const ctx = {
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: NEWSLETTER_JID,
      serverMessageId: null,
      newsletterName: NEWSLETTER_NAME,
    },
    externalAdReply: {
      title: 'VynaaMD Bot',
      body: 'by VynaaValerie',
      mediaType: 1,
      previewType: 1,
      thumbnail: thumb,
      renderLargerThumbnail: true,
      mediaUrl: CARD_URL,
      sourceUrl: CARD_URL,
    }
  }

  if (thumb) {
    return conn.sendMessage(jid, { text, contextInfo: ctx }, { quoted: m })
  }
  return conn.sendMessage(jid, { text }, { quoted: m })
}

// ─────────────────────────────────────────────────────────────────────────────

let handler = async (m, { conn, usedPrefix, args }) => {
  try {
    const user   = global.db.data.users[m.sender] || {}
    const level  = user.level || 0
    const limit  = user.limit || 0
    const name   = m.pushName || 'User'
    const input  = (args[0] || '').toLowerCase()

    const now    = moment().tz('Asia/Jakarta')
    const tanggal = now.format('DD/MM/YYYY')
    const jam    = now.format('HH:mm:ss')
    const uptime = clockString(process.uptime() * 1000)

    const thumb  = await getThumb()

    const plugins = Object.values(global.plugins)
      .filter(v => v.help && !v.disabled)
      .map(v => ({
        help: Array.isArray(v.help) ? v.help : [v.help],
        tags: Array.isArray(v.tags) ? v.tags : [v.tags],
        premium: v.premium,
        limit: v.limit,
        customPrefix: v.customPrefix
      }))

    // ── MENU UTAMA ────────────────────────────────────────────────────────────
    if (!input) {
      let categoryText = ''
      for (const tag of arrayMenu) {
        if (tag === 'all') continue
        categoryText += `│◦ ${usedPrefix}menu ${tag}\n`
      }

      const text = `
╭━━━〔 VYNAAMD 〕━━━⬣
│
│◦ Halo ${name}
│◦ Prefix : ${usedPrefix}
│◦ Level  : ${level}
│◦ Limit  : ${limit}
│
│◦ Date   : ${tanggal}
│◦ Time   : ${jam} WIB
│◦ Runtime: ${uptime}
│
├─〔 LIST MENU 〕
${categoryText}│
├─〔 INFO 〕
│◦ Ketik ${usedPrefix}menu all
│◦ Untuk melihat semua menu
│
╰━━━〔 VYNAA VALERIE 〕━━⬣`.trim()

      return sendCard(conn, m.chat, text, thumb, m)
    }

    // ── MENU TIDAK DITEMUKAN ──────────────────────────────────────────────────
    if (!allTags[input]) {
      return m.reply(`Menu *${input}* tidak ditemukan.\n\nKetik:\n${usedPrefix}menu`)
    }

    // ── RENDER CATEGORY ───────────────────────────────────────────────────────
    const renderCategory = (tag) => {
      const cmds = plugins.filter(v => v.tags.includes(tag))
      let txt = `╭━━━〔 ${allTags[tag]} 〕━━━⬣\n│`

      if (cmds.length < 1) {
        txt += `\n│◦ Tidak ada menu`
      }
      for (const cmd of cmds) {
        for (const h of cmd.help) {
          const isPremium = cmd.premium ? ' Ⓟ' : ''
          const isLimit   = cmd.limit   ? ' Ⓛ' : ''
          txt += `\n│◦ ${cmd.customPrefix ? '' : usedPrefix}${h}${isLimit}${isPremium}`
        }
      }
      txt += `\n│\n╰━━━━━━━━━━━━⬣`
      return txt
    }

    // ── MENU ALL / CATEGORY ───────────────────────────────────────────────────
    let result = `
╭━━━〔 VYNAAMD MENU 〕━━━⬣
│
│◦ User  : ${name}
│◦ Level : ${level}
│◦ Limit : ${limit}
│◦ Time  : ${jam} WIB
│
╰━━━━━━━━━━━━⬣`.trim()

    if (input === 'all') {
      for (const tag of arrayMenu) {
        if (tag === 'all') continue
        result += '\n\n' + renderCategory(tag)
      }
    } else {
      result += '\n\n' + renderCategory(input)
    }

    result += `\n\n> Ⓛ = memakai limit\n> Ⓟ = premium only`

    return sendCard(conn, m.chat, result, thumb, m)

  } catch (e) {
    console.log(e)
    m.reply('Menu error.')
  }
}

handler.help    = ['menu', 'help']
handler.tags    = ['main']
handler.command = /^(menu|help)$/i

module.exports = handler

function clockString(ms) {
  if (isNaN(ms)) return '--'
  const h = Math.floor(ms / 3600000)
  const min = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return [h, min, s].map(v => v.toString().padStart(2, 0)).join(':')
}
