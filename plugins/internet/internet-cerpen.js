 /*
   Created By Dana
   Source From: https://github.com/DanaPutra133/Aquabot-V3/blob/main/aqua%20bot/plugins/search-cerpen.js
   Github: https://github.com/DanaPutra133/Aquabot-V3/
   Created At: 13 June 2024
   Dont Delete This Watermark and Sell This Code !!!!
*/

const fetch = require('node-fetch')

//mulai

let handler = async (m, {conn, command}) => {
  try {
    let cerdn = `----( *${command.toUpperCase()}* )----\n\n`;

    if (command === 'cerpenremaja') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-remaja?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpenanak') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-anak?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpenmisteri') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-misteri?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpenbudaya') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-budaya?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpenromantis') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-romantis?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpengalau') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-galau?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpengokil') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-gokil?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpeninspiratif') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-inspiratif?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpenkehidupan') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-kehidupan?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpensastra') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-sastra?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpenjepang') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-jepang?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpenkorea') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-korea?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpenkeluarga') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-keluarga?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpenpersahabatan') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-persahabatan?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpenkristen') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-kristen?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpenramadhan') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-ramadhan?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpenliburan') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-liburan?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpenlingkungan') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-lingkungan?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }
    else if(command === 'cerpenmengharukan') {
        const res = await (await fetch(`https://api.vtech.biz.id/api/story/cerpen-mengharukan?apikey=${vtech}`)).json();
        cerdn += `Judul: *${res.result.title}*\nAuthor: *${res.result.author}*\nKategori: *${res.result.kategori}*\nLolos: *${res.result.lolos}*\n\n*Cerita:* ${res.result.cerita}\n `
    }

    await m.reply(cerdn);
    
      } catch (e) {
        console.log(e);
        m.reply('Maaf, cerpen tidak di temukan');
        await conn.sendMessage(m.chat, {
          react: {
              text: '😞',
              key: m.key,
          }
      })
      }

};



handler.help = handler.command = ['cerpenremaja', 'cerpenanak', 'cerpenbudaya', 'cerpenmisteri', 'cerpenromantis', 'cerpencinta', 'cerpengokil', 'cerpengalau', 'cerpenkehidupan', 'cerpeninspiratif', 'cerpensastra', 'cerpenjepang', 'cerpenkorea', 'cerpenkeluarga', 'cerpenpersahabatan', 'cerpenkristen', 'cerpenramadhan', 'cerpenhiburan', 'cerpenlingkungan', 'cerpenmengharukan'];
handler.tags = ['internet']
handler.limit = true;

module.exports = handler

//dana_putra13
