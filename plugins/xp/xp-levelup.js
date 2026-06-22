let levelling = require('../../lib/levelling')

let handler = m => {
  let user = global.db.data.users[m.sender]
  if (!levelling.canLevelUp(user.level, user.exp, global.multiplier)) {
    let { min, xp, max } = levelling.xpRange(user.level, global.multiplier)
    throw `⚠️ Belum bisa naik level!\n\n📊 Level *${user.level}* (${user.exp - min}/${xp} XP)\n⭐ Kurang *${max - user.exp} XP* lagi!`.trim()
  }
  let before = user.level * 1
  while (levelling.canLevelUp(user.level, user.exp, global.multiplier)) user.level++
  if (before !== user.level) {
    m.reply(`🎉 *Level Up!*\n\n📈 ${before} ➜ *${user.level}*\n\n> Ketik *.profile* untuk melihat profil kamu!\n> _© VynaaMD_`.trim())
  }
}

handler.help = ['levelup']
handler.tags = ['xp']
handler.command = /^level(|up)$/i

module.exports = handler
