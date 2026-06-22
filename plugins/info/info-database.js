let handler = async (m) => {
    let total = Object.keys(global.db.data.users).length
    let registered = Object.values(global.db.data.users).filter(u => u.registered == true).length
    let premium = Object.values(global.db.data.users).filter(u => u.premium == true).length
    let banned = Object.values(global.db.data.users).filter(u => u.banned == true).length
    let totalGroups = Object.keys(global.db.data.chats).filter(c => c.endsWith('@g.us')).length

    m.reply(`╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🌸 *V y n a a M D* 🌸
╰━━━━━━━━━━━━━━━━━━━━━╯

╭─────────────────────
│ 📊 *STATISTIK DATABASE*
│─────────────────────
│ 👥 Total User   : ${total}
│ ✅ Terdaftar    : ${registered}
│ 💎 Premium      : ${premium}
│ 🚫 Dibanned     : ${banned}
│ 👥 Total Grup   : ${totalGroups}
╰─────────────────────

> _© VynaaMD by VynaaValerie_`)
}

handler.help = ['database', 'user']
handler.tags = ['info']
handler.command = /^(database|jumlahdatabase|user)$/i

module.exports = handler
