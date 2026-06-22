# Anonymous Chat — by Zeyora.id

## Overview

Anonymous Chat adalah bot WhatsApp anonymous random chat by Zeyora.id. Pengguna bisa terhubung dengan orang asing secara anonim, pilih gender, dan khusus pengguna Premium bisa filter gender pasangan. Premium berbasis durasi hari dengan auto-expiry. Database berbasis JSON, hanya private chat.

## User Preferences
Preferred communication style: Simple, everyday language.

## Alur Bot

### Pengguna Baru
1. Kirim pesan apapun → Muncul **Welcome + pilih gender** (tombol 👨 Pria / 👩 Wanita)
2. Setelah pilih gender → **Menu Utama** muncul

### Menu Utama
- 🔍 **Cari Chat Baru** — masuk antrian, auto-cocok dengan user lain
- 📋 **Profil Saya** — lihat info akun
- 👑 **Info Premium** — info upgrade
- ⚙️ **Filter Gender** *(khusus Premium)* — pilih gender pasangan

### Saat Chat
- Semua pesan (teks, foto, video, audio, stiker) di-relay anonim
- Ketik `/stop` atau klik tombol **⛔ Stop Chat** untuk keluar
- Ketik `/next` untuk langsung cari pasangan baru

## Perintah User
| Perintah | Fungsi |
|----------|--------|
| `/menu` | Tampilkan menu utama |
| `/stop` | Akhiri chat / batal cari |
| `/next` | Cari pasangan baru |
| `/profil` | Lihat profil |

## Perintah Owner
| Perintah | Fungsi |
|----------|--------|
| `/menuowner` | Tampilkan menu owner |
| `/addprem [nomor] [hari]` | Jadikan user Premium (dengan durasi) |
| `/delprem [nomor]` | Hapus Premium user |
| `/listprem` | Daftar semua user Premium + expiry |
| `/ban [nomor]` | Ban user |
| `/unban [nomor]` | Unban user |
| `/stats` | Statistik bot |
| `/listuser` | Daftar 20 user |
| `/bc [pesan]` | Broadcast ke semua user |

## Fitur Premium
- Filter pasangan berdasarkan gender (pria/wanita/random)
- Prioritas antrian
- Berbasis durasi hari (auto-expiry)
- Notifikasi H-1 sebelum expired
- Auto-notifikasi saat expired

## Pricelist Premium
| Durasi | Harga |
|--------|-------|
| 1 hari | Rp 2.000 |
| 4 hari | Rp 5.000 |
| 7 hari | Rp 7.000 |
| 15 hari | Rp 10.000 |
| 30 hari | Rp 25.000 |

## System Architecture

### Stack
- **Runtime**: Node.js ESM
- **WhatsApp**: @whiskeysockets/baileys v7.0.0-rc.9
- **Button**: Interactive nativeFlowMessage (format terbaru 2026)
- **Database**: JSON file (`database.json`)

### File Structure
```
├── index.js        # Koneksi WA, event handler
├── case.js         # Logic anonymous chat, matching, menu
├── config.js       # Owner config, DB init
├── database.json   # Data users, sessions, queue
└── VynaaSesi/      # Session auth WhatsApp
```

### Database Structure
```json
{
  "users": {
    "628xxx@s.whatsapp.net": {
      "jid": "...", "name": "...", "gender": "pria/wanita",
      "premium": false, "genderFilter": null,
      "registered": true, "banned": false,
      "joinedAt": "...", "totalChats": 0
    }
  },
  "sessions": { "userA": "userB", "userB": "userA" },
  "queue": ["628xxx@s.whatsapp.net"],
  "settings": { "autoread": true, "totalChats": 0 }
}
```
