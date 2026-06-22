const moment = require('moment-timezone');

let handler = async (m, { text, conn, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(`╭═══❯ *DREAM EXPLORER* ❮═══
│
│ 🌙 Jelajahi Dunia Mimpimu!
│ 
│ 📝 *Format:*
│ ${usedPrefix}${command} [nama/kata kunci]
│
│ 📌 *Contoh:*
│ ${usedPrefix}${command} Raiden
│ ${usedPrefix}${command} Laut
│
╰═════════════════════`);
        }

        await m.reply("🌙 *Memasuki alam mimpi...*");
        await new Promise(resolve => setTimeout(resolve, 1500));
        await m.reply("✨ *Mengumpulkan esensi mimpi...*");
        await new Promise(resolve => setTimeout(resolve, 1500));

        const dreamData = generateDreamWorld(text);
        const dreamInterpretation = interpretDream(dreamData);

        const caption = `╭═══❯ *DREAM WORLD* ❮═══
│
│ 👤 *Explorer:* ${text}
│ 🌙 *Dream Level:* ${dreamData.level}
│ 🎭 *Dream Core:*
│ ${dreamData.core}
│ 🌈 *Dream Elements:*
│ ${dreamData.elements.join('\n│ ')}
│ 🎪 *Dream Events:*
│ ${dreamData.events.join('\n│ ')}
│ 🌟 *Special Encounters:*
│ ${dreamData.encounters.join('\n│ ')}
│ 💫 *Dream Powers:*
│ ${dreamData.powers.join('\n│ ')}
│ 🔮 *Dream Message:*
│ ${dreamData.message}
│ 📝 *Dream Interpretation:*
│ ${dreamInterpretation}
│
╰═════════════════════

🎯 *Dream Quality:* ${dreamData.quality}
⏰ *Dream Time:* ${moment().tz('Asia/Jakarta').format('HH:mm:ss')}`;

        return m.reply(caption);

    } catch (error) {
        console.error('Error in dreamworld command:', error);
        return m.reply(`╭══════════════════════
│ ❌ *Terjadi Kesalahan*
│ Mohon coba beberapa saat lagi
╰══════════════════════`);
    }
};

function generateDreamWorld(seed) {
    const dreamLevels = ['Lucid ✨', 'Mystic 🌟', 'Ethereal 💫', 'Divine 🌙', 'Legendary 🎇'];
    const dreamQualities = ['Peaceful Dreams 😌', 'Adventure Dreams 🚀', 'Mystical Vision 🔮', 'Prophecy Dreams 📖', 'Epic Journey 🗺️'];

    const elementsList = [
        '🌊 Lautan Kristal Bercahaya',
        '🌈 Pelangi Mengambang',
        '🌺 Taman Melayang',
        '⭐ Konstelasi Hidup',
        '🌙 Bulan Kembar',
        '🎪 Sirkus Dimensi',
        '🏰 Kastil Awan',
        '🌋 Gunung Prisma',
        '🎭 Theater Bayangan',
        '🎪 Portal Waktu'
    ];

    const eventsList = [
        '🦋 Kupu-kupu membawa pesan rahasia',
        '🎭 Topeng menari sendiri',
        '🌊 Hujan bintang jatuh ke laut',
        '🎪 Parade makhluk ajaib',
        '🌺 Bunga bernyanyi lagu kuno',
        '🎨 Lukisan menjadi hidup',
        '🎵 Musik terlihat sebagai warna',
        '⚡ Petir membentuk tangga ke langit',
        '🌈 Pelangi berubah menjadi jembatan',
        '🕰️ Waktu berputar mundur'
    ];

    const encountersList = [
        '🐉 Naga Pelangi Bijaksana',
        '🧙‍♂️ Penyihir Bintang',
        '🦊 Rubah Spirit Sembilan Ekor',
        '🧝‍♀️ Peri Pembawa Mimpi',
        '🦁 Singa Kristal',
        '🐋 Paus Terbang Mistis',
        '🦅 Burung Phoenix Waktu',
        '🐢 Kura-kura Pembawa Dunia',
        '🦄 Unicorn Dimensi',
        '👻 Spirit Pelindung'
    ];

    const powersList = [
        '✨ Mengendalikan Waktu',
        '🌊 Berbicara dengan Elemen',
        '🎭 Shapeshifting',
        '🌈 Manipulasi Realitas',
        '👁️ Penglihatan Masa Depan',
        '🎪 Teleportasi Dimensi',
        '🌙 Penyembuhan Spiritual',
        '⚡ Energi Kosmik',
        '🎨 Kreasi Instant',
        '💫 Telepati Universal'
    ];

    const messagesList = [
        'Perjalananmu akan membawa perubahan besar',
        'Rahasia kuno akan terungkap dalam waktu dekat',
        'Kekuatan tersembunyi akan segera bangkit',
        'Takdir baru menanti di horizon',
        'Koneksi spiritual akan menguat',
        'Transformasi besar akan terjadi',
        'Pencerahan akan datang dari arah tak terduga',
        'Misi penting akan segera dimulai',
        'Pertanda baik dalam perjalanan hidupmu',
        'Kebijaksanaan baru akan ditemukan'
    ];

    // Generate random but consistent results based on seed
    const seedNum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const randomize = (arr) => arr[Math.floor((seedNum * arr.length) / 1000) % arr.length];
    const randomMultiple = (arr, count) => {
        const shuffled = [...arr].sort(() => (seedNum * 0.5) - 0.5);
        return shuffled.slice(0, count);
    };

    return {
        level: randomize(dreamLevels),
        quality: randomize(dreamQualities),
        core: generateDreamCore(seed),
        elements: randomMultiple(elementsList, 3),
        events: randomMultiple(eventsList, 3),
        encounters: randomMultiple(encountersList, 2),
        powers: randomMultiple(powersList, 2),
        message: randomize(messagesList)
    };
}

function generateDreamCore(seed) {
    const cores = [
        '🌌 Dunia Paralel Mistis',
        '🎪 Realm Keajaiban Antara',
        '🌙 Dimensi Cahaya Perak',
        '✨ Negeri Kristal Mengambang',
        '🌈 Alam Pelangi Abadi',
        '🎭 Theater Realitas Mimpi',
        '⚡ Zona Waktu Misteri',
        '🌺 Taman Eden Ajaib',
        '🌊 Samudra Bintang Mistis',
        '🏰 Istana Awan Berkilau'
    ];
    
    return cores[Math.floor((Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0) * cores.length) / 1000) % cores.length];
}

function interpretDream(dreamData) {
    const interpretations = [
        'Mimpi ini menunjukkan potensi kreatif yang luar biasa dalam dirimu',
        'Perjalanan spiritual yang berarti akan segera dimulai',
        'Kekuatan tersembunyi dalam dirimu akan terungkap',
        'Waktu transformasi besar sedang mendekat',
        'Hubungan spesial akan terbentuk dalam waktu dekat',
        'Petualangan baru yang menakjubkan menanti',
        'Kebijaksanaan kuno akan membuka jalan barumu',
        'Takdir istimewa sedang menuju ke arahmu',
        'Misi kehidupan yang penting akan segera terungkap',
        'Pencerahan spiritual akan datang dalam bentuk tak terduga'
    ];

    const seedValue = dreamData.level + dreamData.core;
    return interpretations[Math.floor((Array.from(seedValue).reduce((acc, char) => acc + char.charCodeAt(0), 0) * interpretations.length) / 1000) % interpretations.length];
}

// Metadata command
handler.help = ['dreamworld', 'dream', 'mimpi', 'dreamexp'];
handler.tags = ['fun'];
handler.command = /^dreamworld|dream|mimpi$/i;
handler.group = true;
handler.limit = 1;

module.exports = handler;

//base by DEVOLUTION-MD1
//recode by danaputra133
