const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function checkPerms() {
  try {
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
      readyTimeout: 20000
    });
    
    console.log('Checking permissions...');
    let res = await ssh.execCommand('ls -la /applications/demo.bloomix.io/public_html/atsolar');
    console.log(res.stdout);
    
    ssh.dispose();
  } catch (e) {
    console.error(e);
    if(ssh) ssh.dispose();
  }
}
checkPerms();
