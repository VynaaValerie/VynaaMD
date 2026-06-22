var { 
sticker5 
} = require('../../lib/sticker')
var handler = async (m, {
 conn, 
 command
 }) => {
    var error = (`https://a.top4top.io/p_37802zcmd1.png`)
    try {
        if (command == 'dinokuning' || command == 'sdino') {
        const res = `https://api.vtech.biz.id/api/sticker/dinokuning?apikey=${vtech}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
        else if (command == 'patrick' || command == 'spatrick') {
        const res = `https://api.vtech.biz.id/api/sticker/patrick?apikey=${vtech}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
        else if (command == 'spongebob' || command == 'sspongebob') {
        const res = `https://api.vtech.biz.id/api/sticker/spongebob?apikey=${vtech}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
        else if (command == 'doge' || command == 'sdoge') {
        const res = `https://api.vtech.biz.id/api/sticker/doge?apikey=${vtech}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
        else if (command == 'manusialidi' || command == 'smanusialidi') {
        const res = `https://api.vtech.biz.id/api/sticker/manusialidi?apikey=${vtech}`
            var stiker = await sticker5(res, { packname })
            await conn.sendFile(m.chat, stiker, 'emror.webp', '', m)
        }
    } catch (e) {
        console.log(e)
        await conn.sendFile(m.chat, error, 'error.webp', '', m)
    }
}

handler.command = handler.help = ['dinokuning', 'patrick', 'spongebob', 'doge', 'manusialidi', 'sdino', 'spatrick', 'sspongebob', 'sdoge', 'smanusialidi']
handler.tags = ['sticker']
handler.limit = true
module.exports = handler
