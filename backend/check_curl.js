const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('curl -I http://localhost:4005/api/v1/master/shops');
}).then(res => {
  console.log("Localhost curl:\n", res.stdout, res.stderr);
  return ssh.execCommand('curl -I https://demo.bloomix.io/atsolar/api/v1/master/shops');
}).then(res => {
  console.log("Public curl:\n", res.stdout, res.stderr);
  ssh.dispose();
});
