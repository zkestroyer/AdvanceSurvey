const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "UPDATE Shop SET ownerName = \'Imran\' WHERE id = 8;"');
}).then(res => {
  console.log("Update result:\n", res.stdout, res.stderr);
  ssh.dispose();
});
