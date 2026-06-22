let fs = require('fs');

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `❌ Masukkan path file!\n\nContoh:\n${usedPrefix}sf plugins/folder/nama.js\n(lalu quote pesan kode yang ingin disimpan)`
  if (!m.quoted || !m.quoted.text) throw `❌ Quote pesan kode yang ingin disimpan!`
  fs.writeFileSync(text, m.quoted.text)
  m.reply(`✅ File berhasil disimpan di *${text}*`)
}

handler.help = ['sf <path>']
handler.tags = ['owner']
handler.command = /^sf$/i
handler.rowner = true

module.exports = handler
