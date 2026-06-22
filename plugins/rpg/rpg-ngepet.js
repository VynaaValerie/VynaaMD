let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    global.DATABASE.data.users[m.sender].lastngepet = global.db.data.users[m.sender].lastngepet || 0
    let randomaku = `${Math.floor(Math.random() * 150)}`.trim()
    let randomkamu = `${Math.floor(Math.random() * 20)}`.trim()
    let Aku = (randomaku * 1)
    let Kamu = (randomkamu * 1)
    
    let botol = global.wm
    
    let __timers = (new Date - global.db.data.users[m.sender].lastngepet)
    let _timers = (18000000 - __timers) 
    let timers = clockString(_timers)
    let user = global.db.data.users[m.sender]
    if (new Date - global.db.data.users[m.sender].lastngepet > 18000000) {
      if (Aku > Kamu) {
        conn.sendMessage(m.chat, {
          image: { url: 'https://a.top4top.io/p_37802zcmd1.png' },
          caption: `Kamu lengah Saat Ngepet, Dan Kamu Mines -10 juta`
        }, { quoted: m })
        user.money -= 10000000
        global.db.data.users[m.sender].lastngepet = new Date * 1
      } else if (Aku < Kamu) {
        user.money += 5000000
        conn.sendMessage(m.chat, {
          image: { url: 'https://a.top4top.io/p_37802zcmd1.png' },
          caption: `Kamu berhasil Ngepet, Dan kamu mendapatkan 5 Juta rupiah`
        }, { quoted: m })
        global.db.data.users[m.sender].lastngepet = new Date * 1
      } else {
        conn.sendMessage(m.chat, `Maaf kamu tidak mendapatkan *Duit* dan kamu tidak masuk Dunia Lain karna melarikan diri\n${botol}`, m)
        global.db.data.users[m.sender].lastngepet = new Date * 1
      }
    } else conn.sendMessage(m.chat, {
      image: { url: 'https://a.top4top.io/p_37802zcmd1.png' },
      caption: `Kamu sudah melakukan *ngepet*\nDan kamu harus menunggu selama agar bisa ngepet kembali ${timers}`
    }, { quoted: m })
  } catch (e) {
    throw `${e}`
  }
}

handler.help = ['ngepet']
handler.tags = ['rpg']
handler.command = /^(ngepet|ngefet)$/i
handler.premium = true
handler.group = true
handler.rpg = true
handler.fail = null

module.exports = handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}
function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  console.log({ms,h,m,s})
  return [h, m, s].map(v => v.toString().padStart(2, 0) ).join(':')
}
