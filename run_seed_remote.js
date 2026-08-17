const Client = require('ssh2').Client;
const fs = require('fs');
const path = require('path');

const config = {
  host: '172.104.130.208',
  port: 2722,
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  readyTimeout: 99999
};

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const localPath = path.join(__dirname, 'backend', 'seed_geo.js');
    const remotePath = '/applications/atsolar_backend/seed_geo.js';
    
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) throw err;
      console.log('Uploaded seed_geo.js');
      
      conn.exec('cd /applications/atsolar_backend && node seed_geo.js', (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
          conn.end();
        }).on('data', (data) => {
          console.log(`STDOUT: ${data}`);
        }).stderr.on('data', (data) => {
          console.error(`STDERR: ${data}`);
        });
      });
    });
  });
}).on('error', (err) => {
  console.error('SSH error:', err);
}).connect(config);
