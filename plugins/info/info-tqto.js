let handler = async (m, { conn }) => {
  let text = `🌸 *Tim & Kredit VynaaMD*

╭─────────────────────
│ 🙏 *Terima kasih kepada:*
│─────────────────────
│ ☝️ Allah SWT — atas segalanya
│ 👑 VynaaValerie — Developer
│ 🔧 WhiskeySockets — Library Baileys
│ 💎 Semua pengguna VynaaMD
╰─────────────────────

> _© VynaaMD by VynaaValerie_`

  conn.sendMessage(m.chat, {
    image: { url: 'https://a.top4top.io/p_37802zcmd1.png' },
    caption: text
  }, { quoted: m })
}

handler.help = ['tqto', 'team']
handler.tags = ['info']
handler.command = /^(tqto|team)$/i

module.exports = handler
