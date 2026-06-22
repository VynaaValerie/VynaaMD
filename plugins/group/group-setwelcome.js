let handler = async (m, { conn, text, usedPrefix, command, isAdmin, isOwner }) => {
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn)
    throw false
  }

  let chat = global.db.data.chats[m.chat]

  if (command === 'setwelcome') {
    if (!text) {
      return m.reply(`*sᴇᴛ ᴡᴇʟᴄᴏᴍᴇ* — ᴠʏɴᴀᴀᴍᴅ

ɢᴜɴᴀᴋᴀɴ: *${usedPrefix}setwelcome <ᴘᴇsᴀɴ>*

ᴠᴀʀɪᴀʙᴇʟ:
  @user → ᴍᴇɴᴛɪᴏɴ ᴍᴇᴍʙᴇʀ ʙᴀʀᴜ
  @subject → ɴᴀᴍᴀ ɢʀᴜᴘ
  @desc → ᴅᴇsᴋʀɪᴘsɪ ɢʀᴜᴘ

> ᴡᴇʟᴄᴏᴍᴇ sᴀᴀᴛ ɪɴɪ: ${chat.sWelcome || '_(ᴅᴇꜰᴀᴜʟᴛ)_'}`)
    }
    chat.sWelcome = text
    m.reply(`ᴡᴇʟᴄᴏᴍᴇ ʙᴇʀʜᴀsɪʟ ᴅɪᴀᴛᴜʀ.\n\n> ᴀᴋᴛɪꜰᴋᴀɴ: *${usedPrefix}enable welcome*`)

  } else if (command === 'setbye') {
    if (!text) {
      return m.reply(`*sᴇᴛ ʙʏᴇ* — ᴠʏɴᴀᴀᴍᴅ

ɢᴜɴᴀᴋᴀɴ: *${usedPrefix}setbye <ᴘᴇsᴀɴ>*

ᴠᴀʀɪᴀʙᴇʟ:
  @user → ᴍᴇɴᴛɪᴏɴ ᴍᴇᴍʙᴇʀ ᴋᴇʟᴜᴀʀ
  @subject → ɴᴀᴍᴀ ɢʀᴜᴘ

> ʙʏᴇ sᴀᴀᴛ ɪɴɪ: ${chat.sBye || '_(ᴅᴇꜰᴀᴜʟᴛ)_'}`)
    }
    chat.sBye = text
    m.reply(`ʙʏᴇ ʙᴇʀʜᴀsɪʟ ᴅɪᴀᴛᴜʀ.\n\n> ᴀᴋᴛɪꜰᴋᴀɴ: *${usedPrefix}enable welcome*`)

  } else if (command === 'resetwelcome') {
    chat.sWelcome = ''
    m.reply('ᴡᴇʟᴄᴏᴍᴇ ᴅɪʀᴇsᴇᴛ ᴋᴇ ᴅᴇꜰᴀᴜʟᴛ.')

  } else if (command === 'resetbye') {
    chat.sBye = ''
    m.reply('ʙʏᴇ ᴅɪʀᴇsᴇᴛ ᴋᴇ ᴅᴇꜰᴀᴜʟᴛ.')
  }
}

handler.help = ['setwelcome <pesan>', 'setbye <pesan>', 'resetwelcome', 'resetbye']
handler.tags = ['group']
handler.command = /^(setwelcome|setbye|resetwelcome|resetbye)$/i
handler.group = true

module.exports = handler
