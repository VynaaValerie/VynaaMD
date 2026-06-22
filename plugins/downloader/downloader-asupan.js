let handler = async(m, { conn }) => {
  const asupan = [
    `https://api.vtech.biz.id/api/asupan/rikagusriani?apikey=${vtech}`,
    `https://api.vtech.biz.id/api/asupan/santuy?apikey=${vtech}`,
    `https://api.vtech.biz.id/api/asupan/ukhty?apikey=${vtech}`,
    `https://api.vtech.biz.id/api/asupan/bocil?apikey=${vtech}`,
    `https://api.vtech.biz.id/api/asupan/gheayubi?apikey=${vtech}`,
    `https://api.vtech.biz.id/api/asupan/natajadeh?apikey=${vtech}`,
    `https://api.vtech.biz.id/api/asupan/euni?apikey=${vtech}`,
    `https://api.vtech.biz.id/api/asupan/douyin?apikey=${vtech}`,
    `https://api.vtech.biz.id/api/asupan/cecan?apikey=${vtech}`,
    `https://api.vtech.biz.id/api/asupan/hijaber?apikey=${vtech}`,
    `https://api.vtech.biz.id/api/asupan/asupan?apikey=${vtech}`,
    `https://api.vtech.biz.id/api/asupan/anony?apikey=${vtech}`   
  ]
  try {
    const url = pickRandom(asupan);
    await conn.sendFile(m.chat, url, null, '', m);
  } catch (e) {
    console.log(e);
    m.reply('Maaf, video asupan tidak ditemukan');
  }
}

handler.help = ['asupan']
handler.tags = ['downloader']
handler.command = /^asupan$/i
handler.owner = false
handler.premium = false
handler.group = false
handler.private = false

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

module.exports = handler
