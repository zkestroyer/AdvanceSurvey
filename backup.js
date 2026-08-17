const Client = require('ssh2').Client;
const fs = require('fs');

const config = {
  host: '172.104.130.208',
  port: 2722,
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  readyTimeout: 99999
};

const dateStr = new Date().toISOString().replace(/[:.]/g, '-');

const backupCommands = `
echo "Starting Backup Process..."

# 1. Backup Frontend Directory
cp -r /applications/demo.bloomix.io/public_html/atsolar /applications/demo.bloomix.io/public_html/atsolar_bak_${dateStr} || true
echo "Frontend backed up to atsolar_bak_${dateStr}"

# 2. Backup Backend Source
cp -r /applications/atsolar_backend/src /applications/atsolar_backend/src_bak_${dateStr} || true
cp /applications/atsolar_backend/prisma/schema.prisma /applications/atsolar_backend/prisma/schema.prisma.bak_${dateStr} || true
echo "Backend files backed up"

# 3. Backup Database
DB_URL=$(cat /applications/atsolar_backend/.env | grep DATABASE_URL | cut -d'=' -f2- | tr -d '"')
# DB_URL format: mysql://user:password@host:port/database
# Extract components
DB_USER=$(echo $DB_URL | sed -e 's/^mysql:\\/\\/\\([^:]*\\).*$/\\1/')
DB_PASS=$(echo $DB_URL | sed -e 's/^mysql:\\/\\/[^:]*:\\([^@]*\\).*$/\\1/')
DB_HOST=$(echo $DB_URL | sed -e 's/^.*@\\([^:]*\\).*$/\\1/')
DB_NAME=$(echo $DB_URL | sed -e 's/^.*\\/\\([^?]*\\).*$/\\1/')

echo "Exporting database $DB_NAME..."
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME > /applications/atsolar_backend/atsolar_db_backup_${dateStr}.sql

echo "Database backed up to atsolar_db_backup_${dateStr}.sql"
echo "Backup Completed Successfully!"
`;

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connection ready. Executing backup commands...');
  conn.exec(backupCommands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log(`Backup process finished with code ${code}`);
      conn.end();
    }).on('data', (data) => {
      console.log(`STDOUT: ${data}`);
    }).stderr.on('data', (data) => {
      console.error(`STDERR: ${data}`);
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection error:', err);
}).connect(config);
