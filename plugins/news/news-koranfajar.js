let fetch = require('node-fetch')
let handler = async (m, { conn }) => {
try {
  let res = await fetch(`https://api.vtech.biz.id/api/news/koranfajar?&apikey=${vtech}`);
  let json = await res.json()
  var _news = [
       `―KORANFAJAR―\n\nBeritaUrl: ${json.result[0].berita_url}\n\nBerita di upload: ${json.result[0].berita_diupload}`, 
       `―KORANFAJAR―\n\nBeritaUrl: ${json.result[1].berita_url}\n\nBerita di upload: ${json.result[1].berita_diupload}`, 
       `―KORANFAJAR―\n\nBeritaUrl: ${json.result[2].berita_url}\n\nBerita di upload: ${json.result[2].berita_diupload}`, 
       `―KORANFAJAR―\n\nBeritaUrl: ${json.result[3].berita_url}\n\nBerita di upload: ${json.result[3].berita_diupload}`, 
       `―KORANFAJAR―\n\nBeritaUrl: ${json.result[4].berita_url}\n\nBerita di upload: ${json.result[4].berita_diupload}`, 
       `―KORANFAJAR―\n\nBeritaUrl: ${json.result[5].berita_url}\n\nBerita di upload: ${json.result[5].berita_diupload}`, 
       `―KORANFAJAR―\n\nBeritaUrl: ${json.result[6].berita_url}\n\nBerita di upload: ${json.result[6].berita_diupload}`, 
       `―KORANFAJAR―\n\nBeritaUrl: ${json.result[7].berita_url}\n\nBerita di upload: ${json.result[7].berita_diupload}`, 
       `―KORANFAJAR―\n\nBeritaUrl: ${json.result[8].berita_url}\n\nBerita di upload: ${json.result[8].berita_diupload}`, 
    
    ]
conn.reply(m.chat,`${pickRandom(_news)}`);;
} catch (e) {
throw `Internal server eror!`
  }
}
  
handler.help = ['koranfajar']
handler.tags = ['news']
handler.command = /^(koranfajar)$/i
handler.group = false;
handler.limit = true;
module.exports = handler

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}