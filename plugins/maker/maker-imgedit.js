const uploadImage = require('../../lib/uploadImage');
const fetch = require("node-fetch");
const axios = require("axios");

let handler = async (m, { 
  conn, 
  usedPrefix, 
  command, 
  args 
}) => {
  var q = m.quoted ? m.quoted : m;
  var mime = (q.msg || q).mimetype || q.mediaType || '';
  
  if (/image/g.test(mime) && !/webp/g.test(mime)) {
    await conn.reply(m.chat, '🍟 *Processing...*', m);
    try {
      const img = await q.download?.();
      let out = await uploadImage(img);
      let old = new Date();
      let apiUrl = '';

      if (command === 'todisney') {
        apiUrl = `https://api.vtech.biz.id/api/maker/jadidisney?url=${out}&apikey=${vtech}`;
      } else if (command === 'topixar') {
        apiUrl = `https://api.vtech.biz.id/api/maker/jadipixar?url=${out}&apikey=${vtech}`;
      } else if (command === 'tocartoon') {
        apiUrl = `https://api.vtech.biz.id/api/maker/jadicartoon?url=${out}&apikey=${vtech}`;
      } else if (command === 'tocyberpunk') {
        apiUrl = `https://api.vtech.biz.id/api/maker/jadicyberpunk?url=${out}&apikey=${vtech}`;
      } else if (command === 'tovangogh') {
        apiUrl = `https://api.vtech.biz.id/api/maker/jadivangogh?url=${out}&apikey=${vtech}`;
      } else if (command === 'topixelart') {
        apiUrl = `https://api.vtech.biz.id/api/maker/jadipixelart?url=${out}&apikey=${vtech}`;
      } else if (command === 'tocomicbook') {
        apiUrl = `https://api.vtech.biz.id/api/maker/jadicomicbook?url=${out}&apikey=${vtech}`;
      } else if (command === 'tohijab') {
        apiUrl = `https://api.vtech.biz.id/api/maker/jadihijab?url=${out}&apikey=${vtech}`;
      } else if (command === 'tohitam' || command === 'hitamkan' || command === 'hytamkan') {
        apiUrl = `https://api.vtech.biz.id/api/maker/jadihitam?url=${out}&apikey=${vtech}`;
      } else if (command === 'toputih') {
        apiUrl = `https://api.vtech.biz.id/api/maker/jadiputih?url=${out}&apikey=${vtech}`;
      } else if (command === 'toghibli') {
        apiUrl = `https://api.vtech.biz.id/api/maker/jadighibili?url=${out}&apikey=${vtech}`;
      } else if (command === 'imgedit') {
        const text = args.join(" "); 
        if (!text) {
          return m.reply(`Please provide text for editing the image.`);
        }

        let result = await imageedit(text, out);
        let resultUrl = result.result;

        await conn.sendMessage(m.chat, { 
          image: { url: resultUrl },
          caption: `🍟 *Fetching* : ${((new Date - old) * 1)} ms`
        }, { quoted: m });
        return;
      } else {
        return m.reply(`Command *${command}* not recognized. Please use a valid one.`);
      }

      let buff = await fetch(apiUrl).then(res => res.buffer());
      await conn.sendMessage(m.chat, { 
        image: buff, 
        caption: `🍟 *Fetching* : ${((new Date - old) * 1)} ms`
      }, { quoted: m });

    } catch (e) {
      console.log(e);
      m.reply(`[ ! ] Identifikasi Gagal.`)
    }
  } else {
    m.reply(`Please send an image with caption *${usedPrefix + command}* or reply to an image.`);
  }
};

handler.help = ['todisney', 'topixar', 'tocartoon', 'tocyberpunk', 'tovangogh', 'topixelart', 'tocomicbook', 'tohijab', 'tohitam', 'hitamkan', 'hytamkan', 'toputih', 'toghibli', 'imgedit'];
handler.command = ['todisney', 'topixar', 'tocartoon', 'tocyberpunk', 'tovangogh', 'topixelart', 'tocomicbook', 'tohijab', 'tohitam', 'hitamkan', 'hytamkan', 'toputih', 'toghibli', 'imgedit'];
handler.tags = ['maker'];
handler.premium = false;
handler.limit = 5;

module.exports = handler;

/*
 * @ CJS Image Edit Ai Use VtechAPI
 * @ Param {string} text - The text prompt for the image generation.
 * @ Param {string} url - The URL of the image to be edited.
 * @ Param {string} [apikey] - API key for authentication.
 * @ Returns {Object} - { creator: string, result: string (URL) }
 * @ Throws {Error} - If the image generation fails.
 * @ Example Usage:
 */

async function imageedit(text, url) {
  try {
    const { data } = await axios.post("https://api.vtech.biz.id/api/maker/imgedit", {
      text: text,
      url: url,
      apikey: vtech
    });
    
    return data;
  } catch (error) {
    throw null
  };
};
