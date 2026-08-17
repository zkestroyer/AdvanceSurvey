const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "SELECT id, questionText, options FROM SurveyQuestion WHERE questionText LIKE \'%Warranty%\';"');
}).then(res => {
  console.log("Questions:\n", res.stdout, res.stderr);
  ssh.dispose();
});
