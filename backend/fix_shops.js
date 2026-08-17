const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "INSERT IGNORE INTO Shop (id, name, city, area, territoryId) VALUES (4, \'Restored Shop 4\', \'Karachi\', \'Area 1\', 13), (5, \'Restored Shop 5\', \'Karachi\', \'Area 1\', 13), (6, \'Restored Shop 6\', \'Karachi\', \'Area 1\', 13), (7, \'Restored Shop 7\', \'Karachi\', \'Area 1\', 13), (8, \'Imran Electronics\', \'Karachi\', \'Bahadurabad\', 13), (9, \'Restored Shop 9\', \'Karachi\', \'Area 1\', 13), (10, \'Restored Shop 10\', \'Karachi\', \'Area 1\', 13);"');
}).then(res => {
  console.log("Insert result:\n", res.stdout, res.stderr);
  return ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "SELECT id, name, territoryId FROM Shop;"');
}).then(res => {
  console.log("Shops:\n", res.stdout);
  ssh.dispose();
});
