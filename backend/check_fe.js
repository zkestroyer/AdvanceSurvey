const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function checkFrontend() {
  try {
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
      readyTimeout: 20000
    });
    
    console.log('Checking public_html...');
    let res = await ssh.execCommand('ls -la /applications/demo.bloomix.io/public_html');
    console.log(res.stdout);
    
    console.log('\nChecking atsolar frontend...');
    res = await ssh.execCommand('ls -la /applications/demo.bloomix.io/public_html/atsolar');
    console.log(res.stdout);
    
    ssh.dispose();
  } catch (e) {
    console.error(e);
    if(ssh) ssh.dispose();
  }
}
checkFrontend();
