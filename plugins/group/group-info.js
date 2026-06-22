let handler = async (m, { conn, participants, groupMetadata, text }) => {
    const getGroupAdmins = (participants) => {
        let admins = []
        for (let i of participants) {
            if (i.admin) admins.push(i.jid || i.id)
        }
        return admins
    }

    let pp = 'https://a.top4top.io/p_37802zcmd1.png'
    try { pp = await conn.profilePictureUrl(m.chat, 'image') } catch (e) {}

    let { isBanned, welcome, detect, sWelcome, sBye, sPromote, sDemote, antiLink, expired } = global.db.data.chats[m.chat]
    let antidelete = !global.db.data.chats[m.chat].delete

    const groupAdmins = getGroupAdmins(participants)
    let listAdmin = groupAdmins.map((v, i) => `  ${i + 1}. @${(v || '').split('@')[0]}`).join('\n')

    if (text) return m.reply(msToDate(expired - new Date() * 1))

    let caption =
`*ɪɴꜰᴏ ɢʀᴜᴘ* — ᴠʏɴᴀᴀᴍᴅ

ɪᴅ: ${groupMetadata.id}
ɴᴀᴍᴀ: ${groupMetadata.subject}
ᴀɴɢɢᴏᴛᴀ: ${participants.length}
ᴘᴇᴍʙᴜᴀᴛ: @${m.chat.split('-')[0]}

*ᴅᴇsᴋʀɪᴘsɪ*
${groupMetadata.desc || '—'}

*ᴀᴅᴍɪɴ*
${listAdmin || '  —'}

*sᴇᴛᴛɪɴɢ ʙᴏᴛ*
  ᴀɴᴛɪ ʟɪɴᴋ     ${antiLink ? 'ᴏɴ' : 'ᴏꜰꜰ'}
  ᴀɴᴛɪ ᴅᴇʟᴇᴛᴇ   ${antidelete ? 'ᴏɴ' : 'ᴏꜰꜰ'}
  ʙᴀɴɴᴇᴅ        ${isBanned ? 'ʏᴀ' : 'ᴛɪᴅᴀᴋ'}
  ᴅᴇᴛᴇᴄᴛ        ${detect ? 'ᴏɴ' : 'ᴏꜰꜰ'}
  ᴡᴇʟᴄᴏᴍᴇ       ${welcome ? 'ᴏɴ' : 'ᴏꜰꜰ'}

*ᴘᴇsᴀɴ ᴋᴜsᴛᴏᴍ*
  ᴡᴇʟᴄᴏᴍᴇ  ${sWelcome ? 'ᴅɪᴀᴛᴜʀ' : 'ᴅᴇꜰᴀᴜʟᴛ'}
  ʙʏᴇ      ${sBye ? 'ᴅɪᴀᴛᴜʀ' : 'ᴅᴇꜰᴀᴜʟᴛ'}
  ᴘʀᴏᴍᴏᴛᴇ  ${sPromote ? 'ᴅɪᴀᴛᴜʀ' : 'ᴅᴇꜰᴀᴜʟᴛ'}
  ᴅᴇᴍᴏᴛᴇ   ${sDemote ? 'ᴅɪᴀᴛᴜʀ' : 'ᴅᴇꜰᴀᴜʟᴛ'}

> © ᴠʏɴᴀᴀᴍᴅ`.trim()

    let mentionedJid = groupAdmins.concat([`${m.chat.split('-')[0]}@s.whatsapp.net`]).filter(Boolean)
    conn.sendFile(m.key.remoteJid, pp, 'grup.jpg', caption, m, false, { contextInfo: { mentionedJid } })
}

handler.help = ['infogrup']
handler.tags = ['group']
handler.command = /^(gro?upinfo|info(gro?up|gc))$/i
handler.group = true

module.exports = handler

function msToDate(ms) {
    let days = Math.floor(ms / (24 * 60 * 60 * 1000))
    let daysms = ms % (24 * 60 * 60 * 1000)
    let hours = Math.floor(daysms / (60 * 60 * 1000))
    let hoursms = ms % (60 * 60 * 1000)
    let minutes = Math.floor(hoursms / (60 * 1000))
    return `${days} ʜᴀʀɪ ${hours} ᴊᴀᴍ ${minutes} ᴍᴇɴɪᴛ`
}
