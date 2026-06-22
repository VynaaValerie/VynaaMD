let fetch = require('node-fetch')
let handler = async (m, { conn, text, usedPrefix, command }) => {
if (!text) throw `Masukkan Nama!\n\ncontoh: ${usedPrefix + command} Budi`;
try {
  await m.reply(wait)
  let res = await fetch(`https://api.vtech.biz.id/api/primbon/artinama?nama=${text}&apikey=${vtech}`);
  let json = await res.json()
  let anu = [
       `―-ARTI NAMA-―\n\nNama: ${json.result.message.nama}\n\nArti: ${json.result.message.arti}`, 
    ]
conn.reply(m.chat,`${(anu)}`);;
} catch (e) {
throw eror
  }
}
  
    handler.help = ['artinama']
    handler.tags = ['fun']
    handler.command = /^(artinama)$/i
    handler.group = false;
    handler.limit = true; 
    
    module.exports = handler
    



//danaputra133