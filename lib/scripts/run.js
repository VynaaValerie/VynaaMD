const cp = require('child_process');
process.env.TZ = 'Asia/Jakarta';
const bsp = cp.spawn('bash', [], {
  stdio: ['inherit', 'inherit', 'inherit', 'ipc']
});
