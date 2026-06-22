let fetch = require('node-fetch');
let handler = async (m, {
 text, 
 usedPrefix, 
 command
 }) => {
if (!text) throw `Masukkan pertanyaan!\n\n*Contoh:* Siapa presiden Indonesia? `
try {
  await m.reply(wait)
  let res = await (await fetch(`https://api.vtech.biz.id/api/search/bard-ai?apikey=${vtech}&text=${text}`)).json()
  await m.reply(res.message)
} catch (err) {
  console.error(err)
  throw eror
}
}
handler.command = handler.help = ['bard','bardai','gemini'];
handler.tags = ['ai'];
handler.premium = false
handler.limit = true;
module.exports = handler;
