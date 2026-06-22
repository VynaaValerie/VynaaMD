require("dotenv").config();

global.owner = ["6282389924037"]; // wajib di isi tidak boleh kosong
global.mods = ["6282389924037"]; // wajib di isi tidak boleh kosong
global.prems = ["6282389924037"]; // wajib di isi tidak boleh kosong
global.nameowner = "VynaaValerie"; // wajib di isi tidak boleh kosong
global.numberowner = "6282389924037"; // wajib di isi tidak boleh kosong
global.mail = "support@vtech.biz.id"; // wajib di isi tidak boleh kosong
global.gc = "https://chat.whatsapp.com/IweqL2NAVve5ZKcoagMizs"; // wajib di isi tidak boleh kosong
global.instagram = "https://instagram.com/VynaaValerie"; // wajib di isi tidak boleh kosong
global.wm = "© VynaaMD by VynaaValerie"; // isi nama bot atau nama kalian
global.wait = "⏳ _*Tunggu sebentar, sedang diproses...*_"; // ini pesan simulasi loading
global.eror = "❌ _*Terjadi kesalahan, coba lagi nanti!*_"; // ini pesan saat terjadi kesalahan
global.stiker_wait = "🌸 *Stiker sedang dibuat, tunggu ya...*"; // ini pesan simulasi saat loading pembuatan sticker
global.packname = "🌸 VynaaMD"; // watermark stikcker packname
global.author = "VynaaValerie"; // watermark stikcker author
global.maxwarn = "5"; // Peringatan maksimum Warn

global.autobio = false; // Set true/false untuk mengaktifkan atau mematikan autobio (default: false)
global.antiporn = false; // Set true/false untuk Auto delete pesan porno (bot harus admin) (default: false)
global.spam = false; // Set true/false untuk anti spam (default: false)
global.gcspam = false; // Set true/false untuk menutup grup ketika spam (default: false)

// APIKEY INI WAJIB DI ISI! //
global.vtech = "apikeymu";
// global.vtech = process.env.API_KEY_VTECH;
// aktifkan akses .env di atas jika kamu ingin menaruh key api di .env
// Daftar terlebih dahulu https://api.vtech.biz.id

// Tidak boleh diganti atau di ubah
global.APIs = {
  vtech: "https://api.vtech.biz.id",
};

//Tidak boleh diganti atau di ubah
global.APIKeys = {
  "https://api.vtech.biz.id": global.vtech,
};

let fs = require("fs");
let chalk = require("chalk");
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright("Update 'config.js'"));
  delete require.cache[file];
  require(file);
});
