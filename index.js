const cluster = require('cluster');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const express = require('express');
const figlet = require('figlet');
const chalk = require('chalk');
const app = express();

require('./config');

const bot_ku = 'VynaaMD';

function figletAsync(text, opts) {
  return new Promise((resolve, reject) => {
    figlet(text, opts, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

async function tampilkanHeader() {
  const nameown = global.nameowner || 'VTech';
  const judulAscii = await figletAsync(bot_ku, {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: false
  });

  console.clear();
  console.log(chalk.hex('#FFD700')(judulAscii));
  console.log(chalk.magenta.bold(`\n   ${bot_ku} — WhatsApp Bot by VynaaValerie 🌸`));
  console.log(chalk.gray(`   ${'-'.repeat(45)}`));
  console.log(chalk.white(`   Owner: ${chalk.bold(nameown)} | © VynaaMD | V1.0.0`));
  console.log(chalk.gray(`   ${'-'.repeat(45)}\n`));
}

// Express.js 
const ports = [5000, 4000, 3000, 8000, 8080, 4444];
let availablePortIndex = 0;

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, '0.0.0.0', () => {
      server.close();
      resolve(true);
    });
    server.on('error', reject);
  });
}

async function startServer() {
  const port = ports[availablePortIndex];

  app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const data = {
      status: 'online',
      bot: 'VynaaMD',
      message: '🌸 VynaaMD Bot Aktif!',
      author: 'VynaaValerie',
      version: '1.0.0'
    };
    res.send(JSON.stringify({ response: data }, null, 2));
  });

  return new Promise((resolve, reject) => {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log('\x1b[33m%s\x1b[0m', `🌐 Server berjalan di port ${port}`);
      resolve(server);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} sedang digunakan. Mencoba port lain...`);
        availablePortIndex++;
        if (availablePortIndex >= ports.length) {
          console.log('Tidak ada port yang tersedia. Keluar...');
          process.exit(1);
        }
        resolve(startServer());
      } else {
        reject(err);
      }
    });
  });
}

let isRunning = false;

function start(file) {
  if (isRunning) return;
  isRunning = true;

  const args = [path.join(__dirname, file), ...process.argv.slice(2)];
  const p = spawn(process.argv[0], args, {
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  });

  p.on("message", (data) => {
    console.log('\x1b[36m%s\x1b[0m', `🟢 RECEIVED ${data}`);
    switch (data) {
      case "reset":
        p.kill();
        isRunning = false;
        start.apply(this, arguments);
        break;
      case "uptime":
        p.send(process.uptime());
        break;
    }
  });

  p.on("exit", (code) => {
    isRunning = false;
    console.error('\x1b[31m%s\x1b[0m', `Exited with code: ${code}`);
    start('main.js');

    if (code === 0) return;

    fs.watchFile(args[0], () => {
      fs.unwatchFile(args[0]);
      console.error('\x1b[31m%s\x1b[0m', `File ${args[0]} has been modified. Script will restart...`);
      start("main.js");
    });
  });

  p.on("error", (err) => {
    console.error('\x1b[31m%s\x1b[0m', `Error: ${err}`);
    p.kill();
    isRunning = false;
    console.error('\x1b[31m%s\x1b[0m', `Error occurred. Script will restart...`);
    start("main.js");
  });

  const pluginsFolder = path.join(__dirname, "plugins");

  fs.readdir(pluginsFolder, (err, files) => {
    if (err) {
      console.error('\x1b[31m%s\x1b[0m', `Error reading plugins folder: ${err}`);
      return;
    }
    console.log('\x1b[33m%s\x1b[0m', `🟡 Found ${files.length} plugins in folder ${pluginsFolder}`);
    try {
      require.resolve('@adiwajshing/baileys');
      console.log('\x1b[33m%s\x1b[0m', `🟡 Baileys library version ${require('@adiwajshing/baileys/package.json').version} is installed`);
    } catch (e) {
      console.error('\x1b[31m%s\x1b[0m', `❌ Baileys library is not installed`);
    }
  });

  console.log(`🖥️ \x1b[33m${os.type()}\x1b[0m, \x1b[33m${os.release()}\x1b[0m - \x1b[33m${os.arch()}\x1b[0m`);
  const ramInGB = os.totalmem() / (1024 * 1024 * 1024);
  console.log(`💾 \x1b[33mTotal RAM: ${ramInGB.toFixed(2)} GB\x1b[0m`);
  const freeRamInGB = os.freemem() / (1024 * 1024 * 1024);
  console.log(`💽 \x1b[33mFree RAM: ${freeRamInGB.toFixed(2)} GB\x1b[0m`);
  console.log('\x1b[35m%s\x1b[0m', `🌸 VynaaMD — Bot by VynaaValerie`);
  console.log('\x1b[35m%s\x1b[0m', `📸 Instagram: https://instagram.com/VynaaValerie`);

  setInterval(() => {}, 1000);
}

const tmpDir = './tmp';
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
  console.log('\x1b[33m%s\x1b[0m', `📁 Created directory ${tmpDir}`);
}

process.on('unhandledRejection', (reason) => {
  console.error('\x1b[31m%s\x1b[0m', `Unhandled promise rejection: ${reason}`);
  console.error('\x1b[31m%s\x1b[0m', 'Unhandled promise rejection. Script will restart...');
  start('main.js');
});

process.on('exit', (code) => {
  console.error(`Exited with code: ${code}`);
  console.error('Script will restart...');
  start('main.js');
});

(async () => {
  await tampilkanHeader();
  await startServer();
  start("main.js");
})();
