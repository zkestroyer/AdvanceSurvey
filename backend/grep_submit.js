const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('grep "/submit" /applications/.pm2/logs/atsolar-api-out.log | tail -n 20');
}).then(res => {
  console.log("GREP SUBMIT:\n", res.stdout);
  ssh.dispose();
});
