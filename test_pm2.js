
const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('pm2 jlist', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      const list = JSON.parse(data.toString());
      console.log(list.map(p => ({ name: p.name, pwd: p.pm2_env.pm_cwd })));
    }).stderr.on('data', (data) => {
      console.error(data.toString());
    });
  });
}).connect({
  host: '172.104.130.208',
  port: 2722,
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH'
});

