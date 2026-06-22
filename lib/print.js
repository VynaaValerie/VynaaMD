let WAMessageStubType = null

let urlRegex = require('url-regex-safe')({ strict: false })
let PhoneNumber = require('awesome-phonenumber')
let terminalImage = global.opts['img'] ? require('terminal-image') : null
let chalk = require('chalk')
let fs = require('fs')

const W = 52

function line(char = '─', len = W) { return char.repeat(len) }

function formatSize(n) {
  if (!n) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(n) / Math.log(1024))
  return (n / Math.pow(1024, i)).toFixed(1) + ' ' + (units[i] || 'B')
}

function pad(str, max = W - 4) {
  if (!str) return ''
  return String(str).length > max ? String(str).slice(0, max - 1) + '…' : String(str)
}

function row(label, value, labelColor, valueColor) {
  const l = labelColor(label.padEnd(6))
  const v = valueColor(pad(value))
  return `${chalk.dim('│')} ${l} ${chalk.dim('·')} ${v}`
}

module.exports = async function (m, conn = { user: {} }) {
  if (!WAMessageStubType) {
    const { loadBaileys } = await import('../baileys-loader.mjs')
    const baileys = await loadBaileys()
    WAMessageStubType = baileys.WAMessageStubType || baileys.default?.WAMessageStubType || baileys.proto?.MessageStubType || {}
  }

  let _name = await conn.getName(m.sender)
  let senderNum = PhoneNumber('+' + m.sender.replace('@s.whatsapp.net', '').replace('@lid', '')).getNumber('international') || m.sender
  let sender = senderNum + (_name ? chalk.dim(' ~') + _name : '')
  let chat = await conn.getName(m.chat)
  let chatDisplay = m.chat + (chat ? chalk.dim(' ~') + chat : '')

  let img
  try {
    if (global.opts['img'] && terminalImage)
      img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false
  } catch (e) {}

  let filesize = (m.msg ?
    m.msg.vcard ? m.msg.vcard.length :
    m.msg.fileLength ? m.msg.fileLength.low || m.msg.fileLength :
    m.msg.axolotlSenderKeyDistributionMessage ? m.msg.axolotlSenderKeyDistributionMessage.length :
    m.text ? m.text.length : 0
  : m.text ? m.text.length : 0) || 0

  let user = global.DATABASE?.data?.users[m.sender]
  let meNum = PhoneNumber('+' + (conn.user?.jid || '').replace('@s.whatsapp.net', '')).getNumber('international')
  let meName = conn.user?.name || ''

  let timeStr = new Date(1000 * (m.messageTimestamp?.low || m.messageTimestamp || Date.now() / 1000))
    .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

  let msgType = m.mtype
    ? m.mtype.replace(/message$/i, '').replace('audio', m.msg?.ptt ? 'PTT' : 'Audio').replace(/^./, v => v.toUpperCase())
    : 'Unknown'

  let stubType = m.messageStubType ? WAMessageStubType[m.messageStubType] || '' : ''

  let statStr = user
    ? `exp ${chalk.cyan(user.exp ?? 0)}  lv ${chalk.yellow(user.level ?? 0)}  limit ${chalk.green(user.limit ?? 0)}`
    : ''

  const top    = chalk.dim('╭' + line() + '╮')
  const bottom = chalk.dim('╰' + line() + '╯')
  const divider = chalk.dim('├' + line('─', W) + '┤')

  const headerLeft  = chalk.bold.cyan(pad(meNum, 22))
  const headerRight = chalk.bold.white(pad(meName, 20))
  const timeLabel   = chalk.dim.yellow(timeStr)
  const headerGap   = W - 2 - String(meNum).length - String(meName).length - String(timeStr).length
  const headerPad   = ' '.repeat(Math.max(0, headerGap))

  const headerLine = `${chalk.dim('│')} ${headerLeft} ${chalk.dim('~')} ${headerRight}${headerPad}${timeLabel} ${chalk.dim('│')}`

  const fromLine = `${chalk.dim('│')} ${chalk.green.bold('FROM')}  ${chalk.dim('·')} ${chalk.greenBright(pad(sender, W - 10))} ${chalk.dim('│')}`
  const chatLine = `${chalk.dim('│')} ${chalk.blue.bold('CHAT')}  ${chalk.dim('·')} ${chalk.blueBright(pad(chatDisplay, W - 10))} ${chalk.dim('│')}`
  const typeLine = `${chalk.dim('│')} ${chalk.magenta.bold('TYPE')}  ${chalk.dim('·')} ${chalk.magentaBright(msgType + (stubType ? ' · ' + stubType : ''))} ${chalk.dim('│')}`
  const sizeLine = `${chalk.dim('│')} ${chalk.yellow.bold('SIZE')}  ${chalk.dim('·')} ${chalk.yellowBright(formatSize(filesize))} ${chalk.dim('│')}`
  const statLine = statStr ? `${chalk.dim('│')} ${chalk.dim('STAT ')}  ${chalk.dim('·')} ${statStr} ${chalk.dim('│')}` : null

  const lines = [top, headerLine, divider, fromLine, chatLine, typeLine, sizeLine]
  if (statLine) lines.push(statLine)
  lines.push(bottom)

  console.log(lines.join('\n'))

  if (img) console.log(img.trimEnd())

  if (typeof m.text === 'string' && m.text) {
    let log = m.text.replace(/\u200e+/g, '')
    let mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~])(.+?)\1|```((?:.||[\n\r])+?)```)(?=\S?(?:[\s\n]|$))/g
    let mdFormat = (depth = 4) => (_, type, text, monospace) => {
      let types = { _: 'italic', '*': 'bold', '~': 'strikethrough' }
      text = text || monospace
      return !types[type] || depth < 1 ? text : chalk[types[type]](text.replace(mdRegex, mdFormat(depth - 1)))
    }
    if (log.length < 4096)
      log = log.replace(urlRegex, (url, i, text) => {
        let end = url.length + i
        return i === 0 || end === text.length || (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1])) ? chalk.blueBright(url) : url
      })
    log = log.replace(mdRegex, mdFormat(4))
    if (m.mentionedJid) for (let user of m.mentionedJid)
      log = log.replace('@' + user.split`@`[0], chalk.blueBright('@' + await conn.getName(user)))
    console.log(' ' + (m.error != null ? chalk.red(log) : m.isCommand ? chalk.yellow.bold('❯ ' + log) : chalk.white(log)))
  }

  if (m.messageStubParameters) console.log(m.messageStubParameters.map(jid => {
    jid = conn.decodeJid(jid)
    let name = conn.getName(jid)
    return chalk.dim('  ' + (PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international') || jid) + (name ? ' ~' + name : ''))
  }).join(', '))

  if (/document/i.test(m.mtype)) console.log(chalk.dim(`  📄 ${m.msg.filename || m.msg.displayName || 'Document'}`))
  else if (/ContactsArray/i.test(m.mtype)) console.log(chalk.dim(`  👨‍👩‍👧‍👦`))
  else if (/contact/i.test(m.mtype)) console.log(chalk.dim(`  👤 ${m.msg.displayName || ''}`))
  else if (/audio/i.test(m.mtype)) {
    let s = m.msg.seconds || 0
    console.log(chalk.dim(`  ${m.msg.ptt ? '🎤 PTT' : '🎵 Audio'} ${Math.floor(s / 60).toString().padStart(2, 0)}:${(s % 60).toString().padStart(2, 0)}`))
  }

  console.log()
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("Update 'lib/print.js'"))
  delete require.cache[file]
  require(file)
})
