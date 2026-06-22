let handler = async (m, { conn, text }) => {
  if (!text) throw `❌ Masukkan pesan broadcast!\n\nContoh: ${'.'}bc Halo semua!`

  let chats = Object.keys(await conn.chats)
  conn.reply(m.chat, `📢 Mengirim broadcast ke *${chats.length}* chat...`, m)

  let success = 0
  let fail = 0

  for (let id of chats) {
    await sleep(3000)
    try {
      await conn.sendMessage(id, {
        image: { url: 'https://a.top4top.io/p_37802zcmd1.png' },
        caption: text.trim()
      })
      success++
    } catch (e) {
      fail++
    }
  }

  m.reply(`✅ Broadcast selesai!\n\n📊 Statistik:\n• Berhasil: ${success}\n• Gagal: ${fail}`)
}

handler.help = ['broadcast <pesan>', 'bc <pesan>']
handler.tags = ['owner']
handler.command = /^(broadcast|bc)$/i
handler.owner = true
handler.mods = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.fail = null

module.exports = handler

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
