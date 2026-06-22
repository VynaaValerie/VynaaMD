let handler = async (m, { conn }) => {
    let totalf = Object.values(global.plugins).filter(v => v.help && v.tags).length
    let totalPlugins = Object.keys(global.plugins).length

    let txt = `╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🌸 *V y n a a M D* 🌸
╰━━━━━━━━━━━━━━━━━━━━━╯

╭─────────────────────
│ 📊 *TOTAL FITUR*
│─────────────────────
│ 🔌 Plugin Loaded : ${totalPlugins}
│ ✨ Total Fitur   : ${totalf}
╰─────────────────────

> _© VynaaMD by VynaaValerie_`

    conn.sendMessage(m.chat, {
        image: { url: 'https://a.top4top.io/p_37802zcmd1.png' },
        caption: txt
    }, { quoted: m })
}

handler.help = ['totalfitur']
handler.tags = ['info']
handler.command = ['totalfitur']

module.exports = handler
