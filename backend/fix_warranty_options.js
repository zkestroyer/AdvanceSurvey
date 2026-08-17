const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "UPDATE SurveyQuestion SET options = \\\'[\\\"0\\\",\\\"1 Year\\\",\\\"2 Years \\\",\\\"3 Years \\\",\\\"5 Years \\\",\\\"6 Years \\\",\\\"7 Years \\\",\\\"10 Years \\\"]\\\' WHERE questionText LIKE \'%Product Warranty%\';"');
}).then(res => {
  console.log("Update result:\n", res.stdout, res.stderr);
  ssh.dispose();
});
