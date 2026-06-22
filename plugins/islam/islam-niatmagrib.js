let fetch = require('node-fetch')
let handler = async (m, { conn, usedPrefix, command }) => {
try {
  let res = await fetch(`https://api.vtech.biz.id/api/islamic/niatmaghrib?&apikey=${vtech}`);
  let json = await res.json()
  var mgh = [
       `―-NIAT MAGRIB-―\n\n${json.result[0].name}\n\nArab: ${json.result[0].arabic}\n\nLatin: ${json.result[0].latin}\n\nTerjemahan: ${json.result[0].terjemahan}`, 
    ]
conn.reply(m.chat,`${(mgh)}`);;
} catch (e) {
throw eror
  }
}
  
    handler.help = ['niatmaghrib']
    handler.tags = ['islam']
    handler.command = /^(niatmaghrib)$/i
    handler.group = false;
    handler.limit = true; 
    
    module.exports = handler
    



//danaputra133