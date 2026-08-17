const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function main() {
  try {
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
    });
    console.log('Connected!');

    // 1. Check if database tables exist
    console.log('\n=== Checking database tables ===');
    const dbCheck = await ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "SHOW TABLES;"');
    console.log('Tables:', dbCheck.stdout);
    if (dbCheck.stderr) console.error('DB ERR:', dbCheck.stderr);

    // 2. Run prisma db push to create tables
    console.log('\n=== Running prisma db push ===');
    const pushResult = await ssh.execCommand('cd /applications/atsolar_backend && npx prisma db push --accept-data-loss');
    console.log('PUSH:', pushResult.stdout);
    if (pushResult.stderr) console.error('PUSH ERR:', pushResult.stderr);

    // 3. Seed the database
    console.log('\n=== Seeding database ===');
    const seedResult = await ssh.execCommand('cd /applications/atsolar_backend && npx prisma db seed');
    console.log('SEED:', seedResult.stdout);
    if (seedResult.stderr) console.error('SEED ERR:', seedResult.stderr);

    // 4. Restart PM2
    console.log('\n=== Restarting PM2 ===');
    const restartResult = await ssh.execCommand('pm2 restart atsolar_api');
    console.log('RESTART:', restartResult.stdout);

    // 5. Test login
    console.log('\n=== Testing login ===');
    const loginResult = await ssh.execCommand('curl -s -X POST -H "Content-Type: application/json" -d \'{"email":"tso@advancetelecom.com", "password":"password123"}\' http://localhost:4005/api/v1/auth/login');
    console.log('LOGIN:', loginResult.stdout);

    // 6. Check .env PORT
    console.log('\n=== Checking .env ===');
    const envResult = await ssh.execCommand('cat /applications/atsolar_backend/.env');
    console.log('ENV:', envResult.stdout);

  } catch (error) {
    console.error('SSH Error:', error);
  } finally {
    ssh.dispose();
  }
}
main();
