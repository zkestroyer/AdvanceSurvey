const { Client } = require('ssh2');
const c = new Client();
c.on('ready', () => {
  console.log('Connected.');
  c.exec('cd /applications/atsolar_backend && npx tsc && pm2 restart atsolar_backend', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('RESTART DONE');
      c.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '172.104.130.208',
  port: 2722,
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH'
});
