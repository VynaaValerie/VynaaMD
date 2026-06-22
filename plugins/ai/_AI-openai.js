let axios = require('axios');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*Example:* ${usedPrefix + command} hai`;
    conn.vynaa = conn.vynaa ? conn.vynaa : {};
    if (!conn.vynaa[m.sender]) {
        conn.vynaa[m.sender] = {
            pesan: []
        };
        conn.vynaa[m.sender].timeout = setTimeout(() => {
            delete conn.vynaa[m.sender];
        }, 300000);

        m.reply(`Halo \`${m.name}\`👋, Saya siap membantu anda!`);
    } else {
        clearTimeout(conn.vynaa[m.sender].timeout);
        conn.vynaa[m.sender].timeout = setTimeout(() => {
            delete conn.vynaa[m.sender];
        }, 300000);
    }

    const previousMessages = conn.vynaa[m.sender].pesan;
  
  
  /**
 * @description Ubah prompt ini sesuai dengan keinginanmu.
 * @note Usahakan memberikan logika yang masuk akal dan mudah dipahami!
 */

    const messages = [
        { role: "system", content: "kamu adalah VynaaBot, Seorang Asisten pribadi yang di buat oleh VynaaValerie yang siap membantu kapan pun!" },
        { role: "assistant", content: `Saya VynaaBot, asisten pribadi yang siap membantu kamu kapan pun! Apa yang bisa saya bantu hari ini?` },
        ...previousMessages.map((msg, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: msg })),
        { role: "user", content: text }
    ];
    try {
        const chat = async function(message) {
            return new Promise(async (resolve, reject) => {
                try {
                    const params = {
                        message: message,
                        apikey: vtech
                    };
                    const { data } = await axios.post('https://api.vtech.biz.id/api/search/openai-custom-v2', params);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            });
        };

        let res = await chat(messages);
        if (res && res.result) {
            await m.reply(res.result);
            conn.vynaa[m.sender].pesan = [
                ...conn.vynaa[m.sender].pesan,
                text,
                res.result
            ];
        } else {
            throw "Kesalahan dalam mengambil data";
        }
    } catch (e) {
        throw eror
    }
};

handler.command = handler.help = ['ai','openai','chatgpt'];
handler.tags = ['ai'];
handler.premium = false
handler.limit = true;
module.exports = handler;
