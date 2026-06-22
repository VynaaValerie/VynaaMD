let handler = async (m, { conn }) => {
    let _uptime = process.uptime() * 1000
    let tio = clockString(_uptime)
    let time = require('moment-timezone').tz('Asia/Jakarta').format('HH:mm:ss [WIB]')

    let txt = `╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🌸 *V y n a a M D* 🌸
╰━━━━━━━━━━━━━━━━━━━━━╯

╭─────────────────────
│ ⏱️ *RUNTIME BOT*
│─────────────────────
│ 🕐 Waktu : ${time}
│ ⚡ Uptime : ${tio}
╰─────────────────────

> _© VynaaMD by VynaaValerie_`

    conn.sendMessage(m.chat, {
        image: { url: 'https://a.top4top.io/p_37802zcmd1.png' },
        caption: txt,
        mentions: [m.sender]
    }, { quoted: m })
}

handler.help = ['runtime', 'uptime']
handler.tags = ['info']
handler.command = /^(uptime|runtime)$/i

module.exports = handler

function clockString(ms) {
    let days = Math.floor(ms / (24 * 60 * 60 * 1000))
    let daysms = ms % (24 * 60 * 60 * 1000)
    let hours = Math.floor(daysms / (60 * 60 * 1000))
    let hoursms = ms % (60 * 60 * 1000)
    let minutes = Math.floor(hoursms / (60 * 1000))
    let minutesms = ms % (60 * 1000)
    let sec = Math.floor(minutesms / 1000)
    return `${days} Hari ${hours} Jam ${minutes} Menit ${sec} Detik`
}
