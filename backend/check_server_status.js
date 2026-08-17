const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function checkServer() {
  try {
    console.log('Connecting to remote server...');
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
      readyTimeout: 20000
    });
    
    console.log('Connected. Checking PM2 status...');
    let res = await ssh.execCommand('pm2 status');
    console.log(res.stdout);

    console.log('\nChecking disk space...');
    res = await ssh.execCommand('df -h');
    console.log(res.stdout);

    console.log('\nChecking recent pm2 logs...');
    res = await ssh.execCommand('pm2 logs --lines 20 --nostream');
    console.log(res.stdout);
    
    ssh.dispose();
  } catch (e) {
    console.error('Connection failed:', e);
    if(ssh) ssh.dispose();
  }
}
checkServer();
