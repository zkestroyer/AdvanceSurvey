const Client = require('ssh2').Client;
const SftpClient = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

const config = {
  host: '172.104.130.208',
  port: 2722,
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  readyTimeout: 99999
};

const dateStr = new Date().toISOString().replace(/[:.]/g, '-');

async function uploadWipeScript() {
  const sftp = new SftpClient();
  try {
    console.log('Connecting to SFTP...');
    await sftp.connect(config);
    const localFile = path.join(__dirname, 'wipe_script.js');
    const remoteFile = '/applications/atsolar_backend/wipe_script.js';
    
    console.log(`Uploading wipe_script.js...`);
    await sftp.put(localFile, remoteFile);
    console.log('Script uploaded.');
  } catch (err) {
    console.error('Error uploading:', err);
    throw err;
  } finally {
    sftp.end();
  }
}

async function runWipe() {
  await uploadWipeScript();

  console.log('Executing wipe script via SSH...');
  const conn = new Client();
  conn.on('ready', () => {
    console.log('SSH Connection ready. Executing commands...');
    
    // Backup the DB first just in case
    const backupCmd = `
      DB_URL=$(cat /applications/atsolar_backend/.env | grep DATABASE_URL | cut -d'=' -f2- | tr -d '"')
      DB_USER=$(echo $DB_URL | sed -e 's/^mysql:\\/\\/\\([^:]*\\).*$/\\1/')
      DB_PASS=$(echo $DB_URL | sed -e 's/^mysql:\\/\\/[^:]*:\\([^@]*\\).*$/\\1/')
      DB_HOST=$(echo $DB_URL | sed -e 's/^.*@\\([^:]*\\).*$/\\1/')
      DB_NAME=$(echo $DB_URL | sed -e 's/^.*\\/\\([^?]*\\).*$/\\1/')
      mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME > /applications/atsolar_backend/atsolar_db_backup_${dateStr}.sql
      echo "Database backed up to atsolar_db_backup_${dateStr}.sql"
    `;

    const cmd = `${backupCmd} \n cd /applications/atsolar_backend && node wipe_script.js && rm wipe_script.js`;
    
    conn.exec(cmd, (err, stream) => {
      if (err) throw err;
      stream.on('close', (code, signal) => {
        console.log('Execution finished with code ' + code);
        conn.end();
      }).on('data', (data) => {
        console.log('STDOUT: ' + data);
      }).stderr.on('data', (data) => {
        console.error('STDERR: ' + data);
      });
    });
  }).on('error', (err) => {
    console.error('SSH Connection error:', err);
  }).connect(config);
}

runWipe().catch(console.error);
