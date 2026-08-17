const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function checkApiLogs() {
  try {
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
      readyTimeout: 20000
    });
    
    let res = await ssh.execCommand('pm2 logs atsolar_api --lines 50 --nostream');
    console.log(res.stdout);
    if(res.stderr) console.error(res.stderr);
    
    ssh.dispose();
  } catch (e) {
    console.error(e);
    if(ssh) ssh.dispose();
  }
}
checkApiLogs();
