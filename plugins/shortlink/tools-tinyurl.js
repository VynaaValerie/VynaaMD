let fetch = require('node-fetch')
let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `Masukan url/link!\n ${usedPrefix + command} https://google.com`
  let res = await fetch(`https://api.vtech.biz.id/api/linkshort/tinyurl?link=${text}&apikey=${vtech}`)
  let json = await res.json()
  if (json.status) m.reply(json.result)
  else throw 'Link Invalid!\nPeriksa url anda'
}
handler.help = ['tinyurl'].map(v => v + ' <link>')
handler.tags = ['shortlink']
handler.command = /^tinyurl$/i

module.exports = handler
