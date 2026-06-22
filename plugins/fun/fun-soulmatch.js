const moment = require('moment-timezone');

let handler = async (m, { text, conn }) => {
    if (!text) {
        return m.reply(`╭═══❯ *BELAHAN JIWA* ❮═══
│
│ ❌ Masukkan 2 nama untuk dianalisis!
│ 
│ 📝 *Format:*
│ .enc nama1|nama2
│
│ 📌 *Contoh:*
│ .enc Raiden|Mei
│
╰════════════════════`);
    }

    try {
        const [nama1, nama2] = text.split("|").map(name => name.trim());

        if (!nama2) {
            return m.reply("❌ Format salah! Gunakan tanda '|' untuk memisahkan nama\nContoh: .enc Raiden|Mei");
        }

        const generateSoulData = (name, previousElement) => {
            const numerologyValue = name.toLowerCase().split('')
                .map(char => char.charCodeAt(0) - 96)
                .reduce((a, b) => a + b, 0) % 9 + 1;

            const elements = ['Api 🔥', 'Air 💧', 'Tanah 🌍', 'Angin 🌪️', 'Petir ⚡', 'Es ❄️', 'Cahaya ✨', 'Bayangan 🌑'];


            let element;
            do {
                element = elements[Math.floor(Math.random() * elements.length)];
            } while (element === previousElement); 

            const zodiacSigns = ['♈ Aries', '♉ Taurus', '♊ Gemini', '♋ Cancer', '♌ Leo', '♍ Virgo', 
                                 '♎ Libra', '♏ Scorpio', '♐ Sagittarius', '♑ Capricorn', '♒ Aquarius', '♓ Pisces'];
            const zodiac = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)]; 

            return { numerologyValue, element, zodiac };
        };

        let previousElement = null; 
        const soul1 = generateSoulData(nama1, previousElement);
        previousElement = soul1.element; 

        const soul2 = generateSoulData(nama2, previousElement);

        const calculateCompatibility = () => Math.floor(Math.random() * 100) + 1;

        const compatibility = calculateCompatibility();

    
        const soulTypes = [
            "Pemimpin Yang Berani", "Penyeimbang Bijaksana", "Kreator Ekspresif", "Pembangun Solid", 
            "Petualang Bebas", "Pelindung Setia", "Pemikir Mistis", "Penakluk Kuat", "Humanitarian Murni"
        ];

        const getRandomSoulType = () => soulTypes[Math.floor(Math.random() * soulTypes.length)];

        const getMatchDescription = (score) => {
            if (score >= 90) return "💫 Takdir Sejati";
            if (score >= 80) return "✨ Harmoni Sempurna";
            if (score >= 70) return "🌟 Koneksi Kuat";
            if (score >= 60) return "⭐ Potensi Bagus";
            if (score >= 50) return "🌙 Perlu Perjuangan";
            return "🌑 Tantangan Berat";
        };

        const generateSoulReading = (compatibility) => {
            const readings = [
                compatibility >= 90 ? [
                    "│ ✨ Jiwa kalian memiliki koneksi yang sangat",
                    "│    istimewa dan langka",
                    "│ 🌟 Takdir telah merencanakan pertemuan ini",
                    "│ 💫 Resonansi jiwa kalian menciptakan",
                    "│    harmoni sempurna"
                ] : compatibility >= 80 ? [
                    "│ 🌟 Ada chemistry yang sangat kuat di antara",
                    "│    kalian",
                    "│ ✨ Jiwa kalian saling melengkapi dengan",
                    "│    cara yang unik",
                    "│ 💫 Pertemuan kalian membawa energi positif"
                ] : compatibility >= 70 ? [
                    "│ 🌙 Potensi hubungan yang dalam dan berarti",
                    "│ ✨ Perbedaan kalian justru menciptakan",
                    "│    harmoni",
                    "│ 💫 Ada pelajaran berharga dalam pertemuan",
                    "│    ini"
                ] : compatibility >= 60 ? [
                    "│ 🌟 Butuh waktu untuk saling memahami",
                    "│ 💫 Setiap tantangan akan memperkuat ikatan",
                    "│ ✨ Fokus pada hal positif dari perbedaan",
                    "│    kalian"
                ] : compatibility >= 50 ? [
                    "│ 🌙 Perlu usaha ekstra untuk harmonisasi",
                    "│ ✨ Tantangan akan menguji kesungguhan",
                    "│ 💫 Komunikasi jadi kunci utama hubungan"
                ] : [
                    "│ 🌑 Perbedaan yang signifikan dalam energi",
                    "│    jiwa",
                    "│ ✨ Butuh banyak adaptasi dan pengertian",
                    "│ 💫 Setiap hubungan punya maksud tersendiri"
                ]
            ];

            return readings[0].join('\n');
        };

        const caption = `╭═══❯ *BELAHAN JIWA* ❮═══
│
│ 👤 *${nama1}*
│ ├ 🔮 Soul Type: ${getRandomSoulType()}
│ ├ 🌟 Element: ${soul1.element}
│ └ 🎯 Zodiac: ${soul1.zodiac}
│
│ 👤 *${nama2}*
│ ├ 🔮 Soul Type: ${getRandomSoulType()}
│ ├ 🌟 Element: ${soul2.element}
│ └ 🎯 Zodiac: ${soul2.zodiac}
│
│ 💫 *COMPATIBILITY*
│ ├ 📊 Score: ${compatibility}%
│ └ 🎭 Status: ${getMatchDescription(compatibility)}
│
│ 🔮 *Soul Reading*
${generateSoulReading(compatibility)}
│
╰════════════════════

📅 *Analysis Date:* ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')}`;

        return m.reply(caption);

    } catch (error) {
        console.error('Error in soulmatch command:', error);
        return m.reply(`╭══════════════════════
│ ❌ *Terjadi Kesalahan*
│ Mohon coba beberapa saat lagi
╰═════════════════════`);
    }
};

handler.help = ['soulmatch'];
handler.tags = ['fun'];
handler.command = /^soulmatch$/i;
handler.group = true;
handler.limit = 1;

module.exports = handler;


//base by DEVOLUTION-MD1
//recode by danaputra133
