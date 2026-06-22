let fs = require('fs');

let handler = async (m, { text, usedPrefix, command }) => {
  if (command === 'sfp') {
    if (!text) throw `❌ Masukkan nama plugin!\n\nContoh:\n${usedPrefix}sfp nama_plugin\n(lalu quote pesan kode plugin-nya)`
    if (!m.quoted || !m.quoted.text) throw `❌ Quote pesan kode plugin yang ingin disimpan!`
    let pluginPath = `plugins/${text}.js`
    fs.writeFileSync(pluginPath, m.quoted.text)
    m.reply(`✅ Plugin berhasil disimpan di *${pluginPath}*`)
  } else if (command === 'df') {
    if (!text) throw `❌ Masukkan nama plugin!\n\nContoh:\n${usedPrefix}df nama_plugin`
    let pluginPath = `plugins/${text}.js`
    if (!fs.existsSync(pluginPath)) throw `❌ File plugin *${text}.js* tidak ditemukan!`
    fs.unlinkSync(pluginPath)
    m.reply(`🗑️ Plugin *${text}.js* berhasil dihapus!`)
  }
}

handler.help = ['sfp <nama>', 'df <nama>']
handler.tags = ['owner']
handler.command = /^(sfp|df)$/i
handler.rowner = true

module.exports = handler
