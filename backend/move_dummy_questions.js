const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "INSERT IGNORE INTO Survey (id, title) VALUES (9999, \'Dummy\'); INSERT IGNORE INTO SurveySection (id, surveyId, title) VALUES (9999, 9999, \'Dummy\'); UPDATE SurveyQuestion SET sectionId = 9999 WHERE id >= 300 AND id <= 400;"');
}).then(res => {
  console.log("Move result:\n", res.stdout, res.stderr);
  ssh.dispose();
});
