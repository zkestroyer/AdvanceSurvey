const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('pm2 logs atsolar_api --lines 100 --nostream');
}).then(res => {
  console.log("PM2 Logs:\n", res.stdout, res.stderr);
  ssh.dispose();
});
