var fetch = require("node-fetch");

var handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    throw `Contoh:\n${usedPrefix + command} Big boobs`;
  }
  try {
  const search = await fetch(
    `https://api.vtech.biz.id/api/search/xnxx?query=${text}&apikey=${vtech}`
  );
  const hasil = await search.json();
  
  let teks = `*XNXX RESULTS* \n\n🔍 *KEYWORDS* *${text}*\n\n`;
  let no = 1;
  
  for (let i of hasil.result) {
    teks += `📑 *No* : ${no++}\n📚 *Title* : ${i.title}\n⏱️ *Duration* : ${i.duration}\n🔗 *URL* ${i.link}\n\n─────────────────\n\n`;
  }
  
  await conn.sendMessage(m.chat, { react: { text: `⏱️`, key: m.key }});
  await conn.sendMessage(m.chat, { image: { url: hasil.result[0].thumb }, caption: teks }, { quoted: m });
} catch (e) {
throw `Can't find data!`
}
 };

handler.help = handler.command = ['xnxxsearch'];
handler.tags = ['internet'];
handler.limit = true;
handler.premium = true;

module.exports = handler;
