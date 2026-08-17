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
  conn.exec(`node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    async function check() {
      console.log('Regions:', await prisma.region.count());
      console.log('Cities:', await prisma.city.count());
      console.log('Territories:', await prisma.territory.count());
      console.log('Areas:', await prisma.area.count());
    }
    check().finally(() => { prisma['$disconnect']() });
  "`, { cwd: '/applications/atsolar_backend' }, (err, stream) => {
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
