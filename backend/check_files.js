const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('ls -l /home/master-94099776/htdocs/demo.bloomix.io/atsolar/api/controllers');
}).then(res => {
  console.log("Files:\n", res.stdout, res.stderr);
  ssh.dispose();
});
