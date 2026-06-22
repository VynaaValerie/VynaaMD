let handler = async (m, { isPrems, conn, text, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender];
  const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[@ .+-]/g, '').replace(/^\+/, '').replace(/-/g, '') + '@s.whatsapp.net' : m.sender;

  // Jika user belum melamar pekerjaan
  if (user.job === '-') {
    throw 'Kamu belum melamar kerja. Silahkan melamar kerja terlebih dahulu untuk memulai job. Contoh: .lamarkerja _gojek_';
  }

  // Pastikan jobexp terdefinisi
  if (user.jobexp === undefined) {
    user.jobexp = 0;
  }

  let job = `${user.job}`;
  let kapital = capitalizeFirstLetter(job);

  if (user.jail === true) {
    throw '*Kamu tidak bisa melakukan aktivitas karena masih dalam penjara!*';
  }

  let jobs = {
    'gojek': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '*.ngojek*'
    },
    'kurir': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '-'
    },
    'sopir': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '-'
    },
    'karyawan indomaret': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '-'
    },
    'kantoran': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '-'
    },
    'dokter': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '*.healing*'
    },
    'frontend developer': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '-'
    },
    'web developer': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '-'
    },
    'backend developer': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '-'
    },
    'fullstack developer': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '-'
    },
    'game developer': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '-'
    },
    'pemain sepak bola': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '-'
    },
    'trader': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '-'
    },
    'hunter': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '*.berburu*'
    },
    'polisi': {
      thumb: 'https://a.top4top.io/p_37802zcmd1.png',
      special: '*.penjara*'
    }
  };

  let jobInfo = jobs[user.job];
  if (jobInfo) {
    let caption = `*JOB INFO*
 Pekerjaan : ${kapital}
 Tingkat Kerja Keras : ${user.jobexp}% / 500%

Tingkat kerja keras akan meningkat setiap 1% melalui perintah *.jobkerja*. Dan command spesial kamu adalah ${jobInfo.special}
`.trim();

    await conn.sendFile(m.chat, jobInfo.thumb, `${user.job}.jpg`, caption, m);
  } else {
    throw 'Pekerjaan tidak ditemukan atau tidak valid!';
  }
};

handler.help = ['job'];
handler.tags = ['rpg'];
handler.command = /^(job)$/i;
handler.rpg = true
module.exports = handler;

function capitalizeFirstLetter(str) {
  let words = str.split(" ");
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
  }
  return words.join(" ");
}