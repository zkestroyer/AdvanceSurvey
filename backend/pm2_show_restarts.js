const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('pm2 show atsolar_api');
}).then(res => {
  console.log("PM2:\n", res.stdout);
  ssh.dispose();
});
