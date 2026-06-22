let handler = async (m, { conn }) => {
  if (!process.send) throw '❌ Jalankan bot dengan: *node index.js*\nbukan: node main.js'
  if (global.conn.user.jid == conn.user.jid) {
    await m.reply('🔄 *VynaaMD sedang direstart...*\n\nMohon tunggu sekitar 1 menit 🙏\n\n> _© VynaaMD by VynaaValerie_')
    process.send('reset')
  } else throw '❌ Tidak bisa restart dari koneksi ini!'
}

handler.help = ['restart']
handler.tags = ['owner']
handler.command = /^(srvrestart|restart)$/i
handler.rowner = true

module.exports = handler
