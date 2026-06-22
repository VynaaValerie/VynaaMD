const fetch = require('node-fetch');

let handler = async (m, { conn, command }) => {
    try { 
        let anu = `─────〔 *${command}* 〕─────\n`;

        if (command === 'bucin') {
            const res = await (await fetch(`https://api.vtech.biz.id/api/random/katabucin?apikey=${vtech}`)).json();
            anu += res.bucin;
        } else if (command === 'fiersa') {
            const res = await (await fetch(`https://api.vtech.biz.id/api/random/fiersa?apikey=${vtech}`)).json();
            anu += res.fiersa;
        } else if (command === 'fakta') {
            const res = await (await fetch(`https://api.vtech.biz.id/api/random/fakta?apikey=${vtech}`)).json();
            anu += res.result;
        } else if (command === 'nyindir') {
            const res = await (await fetch(`https://api.vtech.biz.id/api/random/nyindir?apikey=${vtech}`)).json();
            anu += res.hasl;
        } else if (command === 'ngawur') {
            const res = await (await fetch(`https://api.vtech.biz.id/api/random/ngawur?apikey=${vtech}`)).json();
            anu += res.hasl;
        } else if (command === 'jawa') {
            const res = await (await fetch(`https://api.vtech.biz.id/api/random/quotesjawa?apikey=${vtech}`)).json();
            anu += res.quotes;
        } else if (command === 'quotes') {
            const res = await (await fetch(`https://api.vtech.biz.id/api/random/quotes?apikey=${vtech}`)).json();
            anu += res.quotes;
        } else if (command === 'sunda') {
            const res = await (await fetch(`https://api.vtech.biz.id/api/random/sunda?apikey=${vtech}`)).json();
            anu += res.hasl;
        } else if (command === 'batak') {
            const res = await (await fetch(`https://api.vtech.biz.id/api/random/batak?apikey=${vtech}`)).json();
            anu += res.hasl;
        } else if (command === 'aceh') {
            const res = await (await fetch(`https://api.vtech.biz.id/api/random/aceh?apikey=${vtech}`)).json();
            anu += res.hasl;
        } else if (command === 'cina') {
            const res = await (await fetch(`https://api.vtech.biz.id/api/random/china?apikey=${vtech}`)).json();
            anu += res.hasl;
        } else if (command === 'minangkabau') {
            const res = await (await fetch(`https://api.vtech.biz.id/api/random/minangkabau?apikey=${vtech}`)).json();
            anu += res.hasl;
        } else if (command === 'ilham') {
            const res = await (await fetch(`https://api.vtech.biz.id/api/random/katailham?apikey=${vtech}`)).json();
            anu += res.hasil;
        } else if (command === 'dilan') {
            const res = await (await fetch(`https://api.vtech.biz.id/api/random/katadilan?apikey=${vtech}`)).json();
            anu += res.dilan;
        }

        m.reply(anu);
    } catch (e) {
        throw eror;
    }
};

handler.help = ['bucin', 'ilham', 'dilan', 'fiersa', 'fakta', 'nyindir', 'ngawur', 'jawa', 'quotes', 'sunda', 'batak', 'aceh', 'cina', 'minangkabau'];
handler.tags = ['quotes'];
handler.command = /^(bucin|ilham|dilan|fiersa|fakta|nyindir|ngawur|jawa|quotes|sunda|batak|aceh|cina|minangkabau)$/i;
handler.owner = false;
handler.mods = false;
handler.premium = false;
handler.group = false;
handler.private = false;
handler.register = false;
handler.admin = false;
handler.botAdmin = false;
handler.fail = null;

module.exports = handler;
