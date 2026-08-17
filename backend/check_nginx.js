const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function checkNginx() {
  try {
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
      readyTimeout: 20000
    });
    
    console.log('Checking nginx...');
    let res = await ssh.execCommand('cat /etc/nginx/sites-available/demo.bloomix.io || cat /etc/apache2/sites-available/demo.bloomix.io.conf');
    console.log(res.stdout);
    
    // Check if atsolar folder is somewhere else
    res = await ssh.execCommand('find /applications -name "atsolar" -type d -maxdepth 3');
    console.log('Found atsolar dirs:', res.stdout);
    
    ssh.dispose();
  } catch (e) {
    console.error(e);
    if(ssh) ssh.dispose();
  }
}
checkNginx();
