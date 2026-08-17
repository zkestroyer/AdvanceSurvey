const fs = require('fs');
const Client = require('ssh2').Client;
const sftpConfig = { host: '172.104.130.208', port: 2722, username: 'master-94099776', password: 'j0PhbaxkNl0ORIH' };

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const localFile = 'c:/Users/HP/.gemini/antigravity/scratch/AdvanceTelecom/Zainab_Handover/seed_regions.js';
    const remoteFile = '/applications/atsolar_backend/seed_regions.js';
    
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) throw err;
      console.log('Seed script uploaded successfully!');
      
      conn.exec('cd /applications/atsolar_backend && node seed_regions.js', (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
          console.log('Seeding Done!');
          conn.end();
        }).on('data', (data) => {
          console.log(data.toString());
        }).stderr.on('data', (data) => {
          console.error(data.toString());
        });
      });
    });
  });
}).connect(sftpConfig);
