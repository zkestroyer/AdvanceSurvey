const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('mysql -u master-94099776 -p"cJjuiLp3NFMXiJh0xqeOe" atsolar_db -e "SELECT id, name, ownerName, contactNo FROM Shop WHERE name = \'Imran Electronics\';"');
}).then(res => {
  console.log("SHOPS:\n", res.stdout);
  ssh.dispose();
});
