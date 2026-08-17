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
    
    console.log('Connected! Pushing DB and restarting...');
    
    // First let's check what's in the .env file
    const envResult = await ssh.execCommand('cat /applications/atsolar_backend/.env');
    console.log('ENV:\n', envResult.stdout);
    
    // Let's modify the .env to use the provided DB credentials if needed, then db push
    const pushResult = await ssh.execCommand('cd /applications/atsolar_backend && npx prisma db push --accept-data-loss && pm2 restart atsolar_api');
    console.log('PUSH:\n', pushResult.stdout);
    if (pushResult.stderr) console.error('PUSH ERR:\n', pushResult.stderr);
    
  } catch (error) {
    console.error('SSH Error:', error);
  } finally {
    ssh.dispose();
  }
}
main();
