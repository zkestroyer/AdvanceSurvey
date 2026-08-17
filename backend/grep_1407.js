const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('grep -B 5 -A 10 "14:07:46.000Z" /applications/.pm2/logs/atsolar-api-out.log');
}).then(res => {
  console.log("LOG:\n", res.stdout);
  ssh.dispose();
});
