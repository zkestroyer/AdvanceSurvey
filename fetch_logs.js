const Client = require('ssh2').Client;

const config = {
  host: '172.104.130.208',
  port: 2722,
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  readyTimeout: 99999
};

const conn = new Client();
conn.on('ready', () => {
  conn.exec('pm2 logs atsolar_api --lines 100 --nostream', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.end();
    }).on('data', (data) => {
      console.log(`STDOUT: ${data}`);
    }).stderr.on('data', (data) => {
      console.error(`STDERR: ${data}`);
    });
  });
}).on('error', (err) => {
  console.error('SSH error:', err);
}).connect(config);
