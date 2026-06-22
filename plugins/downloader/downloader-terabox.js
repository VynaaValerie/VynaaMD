/**
let fetch = require('node-fetch')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*🚩 Example:* ${usedPrefix}${command} https://terabox.com/s/1aD9T7_Xe0oroBwlfzyWXUA`
    await m.reply(wait)
    try {
        let data = await (await fetch(`https://api.vtech.biz.id/api/download/terabox?url=${text}&apikey=${vtech}`)).json()
        
        if (!data.result || data.result.length === 0) {
            throw 'No files found in the response'
        }

        let msg = `乂 *T E R A B O X   D O W N L O A D E R*\n\n`
        msg += `Found ${data.result.length} file(s):\n\n`
        
        for (let file of data.result) {
            if (!file.files || !file.files[0]) continue
            let fdata = file.files[0]
            msg += ` ◦ *Name :* ${file.name}\n`
            msg += ` ◦ *Size :* ${formatSize(fdata.size)}\n`
            msg += ` ◦ *Created :* ${formatDate(file.created)}\n\n`
        }
       
        await conn.sendMessage(m.chat, {
            text: msg,
            contextInfo: {
                externalAdReply: {
                    title: 'Terabox Downloader',
                    body: `Processing ${data.result.length} file(s)`,
                    thumbnailUrl: 'https://files.catbox.moe/22ycus.jpg',
                    sourceUrl: null,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        })

        const total = data.result.length
        for (let i = 0; i < data.result.length; i++) {
            const file = data.result[i]
            if (!file.files || !file.files[0]) continue
            
            let fdata = file.files[0]
            try {
                let response = await fetch(fdata.url)
                let buffer = await response.buffer()
               
                let queue = `*Antrian:* ${i + 1}-${total}\n`               
                await conn.sendFile(m.chat, buffer, file.name, queue, m)
                
                if (i === data.result.length - 1) {
                    await conn.reply(m.chat, '*DONE*', m)
                }
                
                if (i < data.result.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 5000))
                }
            } catch (eror) {
                await conn.reply(m.chat, `Failed to process file: ${file.name}`, m)
            }
        }
    } catch (error) {
        throw eror
    }
}

handler.help = ['teraboxdl'].map(v => v + ' <url>')
handler.tags = ['downloader']
handler.command = /^(teraboxdl|terabox)$/i
handler.limit = true
handler.premium = true

module.exports = handler

function formatSize(size) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let i = 0
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024
        i++
    }
    return `${size.toFixed(2)} ${units[i]}`
}

function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
**/
// New Line
/**
let fetch = require('node-fetch')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*🚩 Example:* ${usedPrefix}${command} https://terabox.com/s/1Yj2okPgdFu2amhVdXNl_8g`
    await m.reply(wait)
    try {
        let data = await (await fetch(`https://api.vtech.biz.id/api/download/terabox?url=${text}&apikey=${vtech}`)).json()
        
        if (!data.result || !data.result.result || !data.result.result.all_files || data.result.result.all_files.length === 0) {
            throw 'No files found in the response'
        }

        let files = data.result.result.all_files
        let msg = `乂 *T E R A B O X   D O W N L O A D E R*\n\n`
        msg += `Found ${files.length} file(s):\n\n`
        
        for (let file of files) {
            msg += ` ◦ *Name:* ${file.file_name}\n`
            msg += ` ◦ *Size:* ${file.size}\n\n`
        }
       
        await conn.sendMessage(m.chat, {
            text: msg,
            contextInfo: {
                externalAdReply: {
                    title: 'Terabox Downloader',
                    body: `Processing ${files.length} file(s)`,
                    thumbnailUrl: 'https://files.catbox.moe/22ycus.jpg',
                    sourceUrl: null,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        })

        const total = files.length
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            try {
                let queue = `*Antrian:* ${i + 1}-${total}\n`
                await conn.sendFile(m.chat, file.download_url, file.file_name, queue, m)
                
                if (i === files.length - 1) {
                    await conn.reply(m.chat, '*DONE*', m)
                }
                
                if (i < files.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 5000))
                }
            } catch (error) {
                await conn.reply(m.chat, `Failed to process file: ${file.file_name}`, m)
            }
        }
    } catch (error) {
        throw eror
    }
}

handler.help = ['teraboxdl'].map(v => v + ' <url>')
handler.tags = ['downloader']
handler.command = /^(teraboxdl|terabox)$/i
handler.limit = true
handler.premium = true

module.exports = handler

**/
