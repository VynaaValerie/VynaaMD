let PhoneNumber = require('awesome-phonenumber')
let levelling = require('../../lib/levelling')
const { createHash } = require('crypto')

let handler = async (m, { conn, usedPrefix, command, text }) => {
  let who
  if (m.quoted) {
    who = m.quoted.sender
  } else if (m.mentionedJid && m.mentionedJid[0]) {
    who = m.mentionedJid[0]
  } else if (text) {
    let input = text.replace(/[^0-9]/g, '')
    if (input.length > 5 && input.length < 20) {
      who = input + '@s.whatsapp.net'
    }
  }

  if (!who) who = m.sender
  if (!who.includes('@')) who += '@s.whatsapp.net'

  if (!global.db.data.users[who]) {
    global.db.data.users[who] = {
      exp: 0, limit: 10, lastclaim: 0, registered: false,
      name: '', age: -1, regTime: -1, premium: false,
      premiumDate: 0, level: 0, money: 0, pasangan: '',
      role: 'Newbie', banned: false
    }
  }

  let user = global.db.data.users[who]
  let { name, limit, exp, money, lastclaim, premiumDate, premium, registered, regTime, age, level, pasangan } = user

  let pp = 'https://a.top4top.io/p_37802zcmd1.png'
  try { pp = await conn.profilePictureUrl(who, 'image') } catch (e) {}

  let about = ''
  try {
    let status = await conn.fetchStatus(who)
    about = status.status || ''
  } catch {}

  let username = conn.getName(who)
  let number = who.split('@')[0]

  const roleList = [
    [2, 'Newbie 🌱'], [4, 'Beginner I 🌿'], [6, 'Beginner II 🌿'], [8, 'Beginner III 🌿'],
    [10, 'Beginner IV 🌿'], [20, 'Private I ⚔️'], [30, 'Private II ⚔️'], [40, 'Private III ⚔️'],
    [50, 'Private IV ⚔️'], [60, 'Private V ⚔️'], [70, 'Corporal I 🛡️'], [80, 'Corporal II 🛡️'],
    [90, 'Corporal III 🛡️'], [100, 'Corporal IV 🛡️'], [110, 'Corporal V 🛡️'],
    [120, 'Sergeant I 🌟'], [130, 'Sergeant II 🌟'], [140, 'Sergeant III 🌟'],
    [150, 'Sergeant IV 🌟'], [160, 'Sergeant V 🌟'], [200, 'Staff ⭐'], [250, 'Sgt. Major 💫'],
    [300, '2nd Lt. 🔥'], [350, '1st Lt. 🔥'], [400, 'Major 💥'], [450, 'Colonel 👑'],
    [500, 'Brigadier 💎'], [600, 'Legendary 🏆'], [800, 'Super Legendary 🏆'],
    [1000, 'Ultra Legendary 🏆'], [Infinity, 'Master Legendary 🌸']
  ]
  let role = roleList.find(([lvl]) => level <= lvl)?.[1] || 'Master Legendary 🌸'

  let { min, xp, max } = levelling.xpRange(level, global.multiplier)
  let sn = createHash('md5').update(who).digest('hex')

  let str = `╭━━━━━━━━━━━━━━━━━━━━━╮
┃  🌸 *V y n a a M D* 🌸
╰━━━━━━━━━━━━━━━━━━━━━╯

╭─「 👤 *PROFIL* 」
│ 📛 Nama     : ${username}${registered ? ` (${name})` : ''}
│ @${number}
│ 📝 Bio      : ${about || 'Tidak ada bio'}
│ ❤️ Pasangan : ${pasangan ? '@' + pasangan.split('@')[0] : 'Jomblo 💔'}
│ 📞 Nomor    : ${PhoneNumber('+' + number).getNumber('international')}
│ 🔢 Serial   : ${sn.slice(0, 12)}...
│ 🎂 Umur     : ${registered ? age + ' tahun' : '-'}
╰──────────────────────

╭─「 🎮 *RPG INFO* 」
│ 📊 Level    : ${level}
│ 🔰 Role     : ${role}
│ ✨ XP       : ${exp} (${exp - min}/${xp})
│ ${max - exp <= 0 ? '✅ Siap *levelup*!' : `⚡ Butuh ${max - exp} XP lagi`}
│ 💰 Money    : ${money}
│ 💎 Limit    : ${limit}
╰──────────────────────

╭─「 📌 *STATUS* 」
│ ✅ Daftar   : ${registered ? 'Ya' : 'Belum'}
│ ⭐ Premium  : ${premium ? 'Aktif' : 'Tidak'}
│ ⏳ Exp Prem : ${premium && premiumDate ? msToDate(premiumDate - Date.now()) : '-'}
│ 🕐 Klaim    : ${lastclaim > 0 ? new Date(lastclaim).toLocaleString('id-ID') : '-'}
╰──────────────────────

> _© VynaaMD by VynaaValerie_`.trim()

  let mentionedJid = [who]
  if (pasangan) mentionedJid.push(pasangan)

  await conn.sendFile(m.chat, pp, 'profile.jpg', str, m, false, {
    contextInfo: { mentionedJid }
  })
}

handler.help = ['profile', 'profil [@user]']
handler.tags = ['info']
handler.command = /^profile?|profil$/i

module.exports = handler

function msToDate(ms) {
  if (!ms || ms < 0) return 'Permanent'
  let days = Math.floor(ms / 86400000)
  let hours = Math.floor((ms % 86400000) / 3600000)
  let minutes = Math.floor((ms % 3600000) / 60000)
  return `${days} hari ${hours} jam ${minutes} menit`
}
