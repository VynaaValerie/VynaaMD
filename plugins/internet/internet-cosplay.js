let fetch = require('node-fetch');

let handler = async (m, { conn }) => {    
    try {
        const response = await fetch(`https://api.vtech.biz.id/api/wallpaper/cosplay?apikey=${vtech}`);
        const buffer = await response.buffer();
        conn.sendFile(m.chat, buffer, 'hasil.jpg', 'Random Cosplay', m);
    } catch (err) {
        throw eror
    }
}

handler.help = handler.command = ['cosplay'];
handler.tags = ['internet'];
handler.limit = true;

module.exports = handler;
