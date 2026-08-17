const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "DELETE FROM SurveyResponse WHERE shopId IN (4, 5, 6, 7, 9, 10); DELETE FROM CheckIn WHERE shopId IN (4, 5, 6, 7, 9, 10); DELETE FROM Shop WHERE id IN (4, 5, 6, 7, 9, 10);"');
}).then(res => {
  console.log("Delete result:\n", res.stdout, res.stderr);
  ssh.dispose();
});
