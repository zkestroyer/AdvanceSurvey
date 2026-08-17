const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('tail -n 100 /applications/.pm2/logs/atsolar-api-out.log');
}).then(res => {
  console.log("TAIL OUT:\n", res.stdout);
  return ssh.execCommand('tail -n 100 /applications/.pm2/logs/atsolar-api-error.log');
}).then(res => {
  console.log("TAIL ERR:\n", res.stdout);
  ssh.dispose();
});
