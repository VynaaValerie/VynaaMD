let handler = async (m, { conn, command }) => {
  await conn.reply(m.chat, wait, m)
  try {
    if (command == 'gay') {
      const res = `https://api.vtech.biz.id/api/nsfw/gay?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'ahegao') {
      const res = `https://api.vtech.biz.id/api/nsfw/ahegao?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'ass') {
      const res = `https://api.vtech.biz.id/api/nsfw/ass?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'bdsm') {
      const res = `https://api.vtech.biz.id/api/nsfw/bdsm?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'blowjob') {
      const res = `https://api.vtech.biz.id/api/nsfw/blowjob?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
     if (command == 'cuckold') {
      const res = `https://api.vtech.biz.id/api/nsfw/cuckold?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'cum') {
      const res = `https://api.vtech.biz.id/api/nsfw/cum?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'ero') {
      const res = `https://api.vtech.biz.id/api/nsfw/ero?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'femdom') {
      const res = `https://api.vtech.biz.id/api/nsfw/femdom?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'foot') {
      const res = `https://api.vtech.biz.id/api/nsfw/foot?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'gangbang') {
      const res = `https://api.vtech.biz.id/api/nsfw/gangbang?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'glasses') {
      const res = `https://api.vtech.biz.id/api/nsfw/glasses?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'hentai') {
      const res = `https://api.vtech.biz.id/api/nsfw/hentai?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'gifs') {
      const res = `https://api.vtech.biz.id/api/nsfw/gifs?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, null, '', m);
    }
    if (command == 'jahy') {
      const res = `https://api.vtech.biz.id/api/nsfw/jahy?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'manga') {
      const res = `https://api.vtech.biz.id/api/nsfw/manga?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'masturbation') {
      const res = `https://api.vtech.biz.id/api/nsfw/masturbation?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'neko') {
      const res = `https://api.vtech.biz.id/api/nsfw/neko?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'neko2') {
      const res = `https://api.vtech.biz.id/api/nsfw/neko2?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'orgy') {
      const res = `https://api.vtech.biz.id/api/nsfw/orgy?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'panties') {
      const res = `https://api.vtech.biz.id/api/nsfw/panties?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'pussy') {
      const res = `https://api.vtech.biz.id/api/nsfw/pussy?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'tentacles') {
      const res = `https://api.vtech.biz.id/api/nsfw/tentacles?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'yuri2') {
      const res = `https://api.vtech.biz.id/api/nsfw/yuri?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'thighs') {
      const res = `https://api.vtech.biz.id/api/nsfw/thighs?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
    if (command == 'zettai') {
      const res = `https://api.vtech.biz.id/api/nsfw/zettai?apikey=${vtech}`;
      await conn.sendFile(m.chat, res, 'nsfw.jpg', '', m);
    }
   } catch (err) {
  console.error(err)
  throw "🚩 Terjadi kesalahan"
   };
};
handler.command = handler.help = ['gay','ahegao','ass','bdsm','blowjob','cuckold','cum','ero','femdom','foot','gangbang','glasses','hentai','gifs','jahy','manga','masturbation','neko','neko2','orgy','tentacles','pussy','panties','thighs','yuri2','zettai']
handler.tags = ['nsfw']
handler.limit = true;
handler.premium = true;
handler.nsfw = true;
module.exports = handler;
