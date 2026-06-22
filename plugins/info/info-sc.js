let handler = async (m, { conn }) => {
  let user = `@${m.sender.split('@')[0]}`
  let text = `🌸 *Script Info — VynaaMD*

╭─────────────────────
│ 🤖 Bot      : VynaaMD
│ 👤 Owner    : VynaaValerie
│ 📸 IG       : @VynaaValerie
│ 🔧 Library  : Baileys (WhiskeySockets)
│ 💻 Runtime  : Node.js
│ 🗓️ Updated  : 2025/2026
╰─────────────────────

Hai ${user}, terima kasih sudah menggunakan *VynaaMD Bot*! 🌸

> _© VynaaMD by VynaaValerie_`

  conn.sendMessage(m.chat, {
    image: { url: 'https://a.top4top.io/p_37802zcmd1.png' },
    caption: text,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['sc', 'sourcecode']
handler.tags = ['info']
handler.command = /^(sc|sourcecode)$/i

module.exports = handler
