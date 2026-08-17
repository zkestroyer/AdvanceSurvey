const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function checkHistory() {
  try {
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
      readyTimeout: 20000
    });
    
    let res = await ssh.execCommand('history | tail -n 50');
    console.log(res.stdout);
    
    res = await ssh.execCommand('find / -name "atsolar" -type d 2>/dev/null');
    console.log('\nAll atsolar dirs:', res.stdout);
    
    ssh.dispose();
  } catch (e) {
    console.error(e);
    if(ssh) ssh.dispose();
  }
}
checkHistory();
