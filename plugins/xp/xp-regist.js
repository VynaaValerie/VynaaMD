const { createHash } = require('crypto')
let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { text, usedPrefix }) {
  let user = global.db.data.users[m.sender]
  if (user.registered === true) throw `✅ Kamu sudah terdaftar!\n\nMau daftar ulang? Ketik:\n*${usedPrefix}unreg <Serial Number>*`
  if (!Reg.test(text)) throw `❌ Format salah!\n\nGunakan: *${usedPrefix}daftar nama.umur*\nContoh: *${usedPrefix}daftar Valerie.18*`
  let [_, name, splitter, age] = text.match(Reg)
  if (!name) throw '❌ Nama tidak boleh kosong!'
  if (!age) throw '❌ Umur tidak boleh kosong (isi dengan angka)!'
  age = parseInt(age)
  if (age > 120) throw '❌ Umur terlalu besar!'
  if (age < 5) throw '❌ Umur terlalu kecil!'
  user.name = name.trim()
  user.age = age
  user.regTime = +new Date
  user.registered = true
  let sn = createHash('md5').update(m.sender).digest('hex')
  m.reply(`✅ *Pendaftaran Berhasil!*

╭─────────────────────
│ 👤 *Info Akun*
│─────────────────────
│ 📛 Nama  : ${name}
│ 🎂 Umur  : ${age} tahun
│─────────────────────
│ 🔑 *Serial Number:*
│ ${sn}
╰─────────────────────

> _Simpan Serial Number kamu!_
> _© VynaaMD by VynaaValerie_`.trim())
}

handler.help = ['daftar', 'reg', 'register'].map(v => v + ' <nama>.<umur>')
handler.tags = ['xp']
handler.command = /^(daftar|reg(ister)?)$/i

module.exports = handler
