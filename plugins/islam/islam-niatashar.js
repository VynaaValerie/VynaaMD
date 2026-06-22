let fetch = require('node-fetch')
let handler = async (m, { conn, usedPrefix, command }) => {
try {
  let res = await fetch(`https://api.vtech.biz.id/api/islamic/niatashar?&apikey=${vtech}`);
  let json = await res.json()
  var asr = [
       `―-NIAT ASHAR-―\n\n${json.result[0].name}\n\nArab: ${json.result[0].arabic}\n\nLatin: ${json.result[0].latin}\n\nTerjemahan: ${json.result[0].terjemahan}`, 
    ]
conn.reply(m.chat,`${(asr)}`);;
} catch (e) {
throw eror
  }
}
  
    handler.help = ['niatashar']
    handler.tags = ['islam']
    handler.command = /^(niatashar)$/i
    handler.group = false;
    handler.limit = true; 
    
    module.exports = handler
    



//danaputra133

