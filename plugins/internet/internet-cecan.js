let fetch = require('node-fetch')

let handler = async (m, { conn, command }) => {
    try {
        let buffer = await fetch(`https://api.vtech.biz.id/api/cecan/${command}?apikey=${vtech}`).then(res => res.buffer())
        conn.sendFile(m.chat, buffer, 'hasil.jpg', `Random ${command}`, m)
    } catch (err) {
        throw eror
    }
}

handler.help = handler.command = ['china', 'vietnam', 'thailand', 'indonesia', 'korea', 'japan', 'malaysia', 'justinaxie', 'jeni', 'jiso', 'ryujin', 'rose', 'hijaber']
handler.tags = ['internet']
handler.limit = true
module.exports = handler
