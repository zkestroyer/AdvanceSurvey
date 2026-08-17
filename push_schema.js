const fs = require('fs');
const Client = require('ssh2').Client;
const sftpConfig = { host: '172.104.130.208', port: 2722, username: 'master-94099776', password: 'j0PhbaxkNl0ORIH' };

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const localFile = 'c:/Users/HP/.gemini/antigravity/scratch/AdvanceTelecom/Zainab_Handover/backend/prisma/schema.prisma';
    const remoteFile = '/applications/atsolar_backend/prisma/schema.prisma';
    
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) throw err;
      console.log('Schema uploaded successfully!');
      
      conn.exec('cd /applications/atsolar_backend && npx prisma db push --accept-data-loss && pm2 restart atsolar_api', (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
          console.log('Done!');
          conn.end();
        }).on('data', (data) => {
          console.log(data.toString());
        });
      });
    });
  });
}).connect(sftpConfig);
