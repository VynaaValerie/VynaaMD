/**
 * sendInteractiveBtn — helper kompatibel VynaaMD
 * Fix Android: thumbnail di-resize ke JPEG kecil pakai jimp sebelum dikirim
 */

const fetch = require('node-fetch')
const Jimp  = require('jimp')

// ── Small Caps converter ──────────────────────────────────────────────────────
const SC_MAP = {
  'a':'ᴀ','b':'ʙ','c':'ᴄ','d':'ᴅ','e':'ᴇ','f':'ꜰ','g':'ɢ','h':'ʜ',
  'i':'ɪ','j':'ᴊ','k':'ᴋ','l':'ʟ','m':'ᴍ','n':'ɴ','o':'ᴏ','p':'ᴘ',
  'q':'ǫ','r':'ʀ','s':'ꜱ','t':'ᴛ','u':'ᴜ','v':'ᴠ','w':'ᴡ','x':'x',
  'y':'ʏ','z':'ᴢ',
  'A':'ᴀ','B':'ʙ','C':'ᴄ','D':'ᴅ','E':'ᴇ','F':'ꜰ','G':'ɢ','H':'ʜ',
  'I':'ɪ','J':'ᴊ','K':'ᴋ','L':'ʟ','M':'ᴍ','N':'ɴ','O':'ᴏ','P':'ᴘ',
  'Q':'ǫ','R':'ʀ','S':'ꜱ','T':'ᴛ','U':'ᴜ','V':'ᴠ','W':'ᴡ','X':'x',
  'Y':'ʏ','Z':'ᴢ'
}
function sc(text) {
  return String(text).split('').map(c => SC_MAP[c] ?? c).join('')
}

// ── Fetch + resize thumbnail → JPEG kecil (fix Android) ──────────────────────
async function fetchThumbnail(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 8000
    })
    if (!res.ok) return undefined
    const raw = await res.buffer()

    // Resize ke 300x150 max, JPEG quality 80 — wajib kecil agar muncul di Android
    const img  = await Jimp.read(raw)
    img.scaleToFit(300, 150)
    const jpeg = await img.getBufferAsync(Jimp.MIME_JPEG)
    return jpeg
  } catch (e) {
    console.log('[fetchThumbnail ERR]', e?.message)
    return undefined
  }
}

// ── Lazy-load Baileys functions ───────────────────────────────────────────────
let _generateWAMessageFromContent = null
let _generateMessageID = null

async function _initBaileys() {
  if (_generateWAMessageFromContent) return
  const { loadBaileys } = await import('../baileys-loader.mjs')
  const baileys = await loadBaileys()
  _generateWAMessageFromContent = baileys.generateWAMessageFromContent
  _generateMessageID            = baileys.generateMessageID
}

// ── Kirim card thumbnail + interactive buttons ────────────────────────────────
async function sendInteractiveBtn(
  conn, jid, bodyText, buttons,
  footerText  = 'VynaaMD',
  cardTitle   = 'VynaaMD Bot',
  cardBody    = 'by VynaaValerie',
  cardThumb   = 'https://files.catbox.moe/xoarh5.jpg',
  cardUrl     = 'https://wa.me/6282389924037',
  newsletterJid  = '120363427321491231@newsletter',
  newsletterName = 'VynaaMD'
) {
  await _initBaileys()

  const thumb = await fetchThumbnail(cardThumb)

  try {
    // 1. Kirim pesan card dengan thumbnail
    await conn.sendMessage(jid, {
      text: sc(bodyText),
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid,
          serverMessageId: null,
          newsletterName,
        },
        externalAdReply: {
          title: cardTitle,
          body: cardBody,
          mediaType: 1,
          previewType: 1,
          thumbnail: thumb,
          renderLargerThumbnail: true,
          mediaUrl: cardUrl,
          sourceUrl: cardUrl,
        }
      }
    })

    // 2. Bangun nativeFlowMessage.buttons
    const nativeButtons = buttons.map(b => ({
      name: b.name || 'quick_reply',
      buttonParamsJson: b.buttonParamsJson ?? JSON.stringify({
        display_text: b.label || b.display_text || 'OK',
        id: b.id || 'btn'
      })
    }))

    // 3. interactiveMessage
    const content = {
      interactiveMessage: {
        body:   { text: '👇 Pilih:' },
        footer: { text: footerText },
        header: { hasMediaAttachment: false },
        nativeFlowMessage: { buttons: nativeButtons }
      }
    }

    // 4. Generate WAMessage
    const userJid = conn.authState?.creds?.me?.id || conn.user?.id || ''
    const fullMsg = _generateWAMessageFromContent(jid, content, {
      logger:    conn.logger,
      userJid,
      messageId: _generateMessageID(),
      timestamp: new Date()
    })

    // 5. Binary nodes
    const isGroup = jid.endsWith('@g.us')
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
    ]
    if (!isGroup) additionalNodes.push({ tag: 'bot', attrs: { biz_bot: '1' } })

    // 6. Relay
    await conn.relayMessage(jid, fullMsg.message, {
      messageId: fullMsg.key.id,
      additionalNodes
    })

  } catch (e) {
    console.log('[sendInteractiveBtn ERR]', e?.message)
    const opts = buttons.map((b, i) => {
      const label = b.label || b.display_text ||
        (() => { try { return JSON.parse(b.buttonParamsJson)?.display_text } catch { return 'OK' } })()
      return `${i + 1}. ${label}`
    }).join('\n')
    await conn.sendMessage(jid, {
      text: `${bodyText}\n\n${opts}\n\n_Balas angka pilihan atau ketik perintah._`
    })
  }
}

module.exports = { sendInteractiveBtn, fetchThumbnail, sc }
