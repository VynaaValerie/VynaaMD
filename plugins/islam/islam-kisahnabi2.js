let fetch = require('node-fetch')
let handler = async (m, { conn, usedPrefix, command }) => {
try {
  let res = await fetch(`https://api.vtech.biz.id/api/islamic/kisahnabi2?&apikey=${vtech}`);
  let json = await res.json()
  var _kn = [
       `―-KISAH NABI 2-―\n\n${json.result[0].name}\n\nTahun kelahiran: ${json.result[0].thn_kelahiran}\n\nUsia: ${json.result[0].usia}\n\n\nStory: ${json.result[0].description}`, 
    ]
conn.reply(m.chat,`${(_kn)}`);;
} catch (e) {
throw eror
  }
}
  
    handler.help = ['kisahnabi2']
    handler.tags = ['islam']
    handler.command = /^(kisahnabi2)$/i
    handler.group = false;
    handler.limit = true; 
    
    module.exports = handler
    



//danaputra133

