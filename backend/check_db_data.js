const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "SELECT id, title FROM SurveyTemplate WHERE isActive = 1;"');
}).then(res => {
  console.log("Template:\n", res.stdout);
  return ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "SELECT id, title FROM SurveySection WHERE templateId = 9;"');
}).then(res => {
  console.log("Sections:\n", res.stdout);
  return ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "SELECT id, questionText FROM SurveyQuestion WHERE sectionId = 137;"');
}).then(res => {
  console.log("Questions in Section 137:\n", res.stdout);
  ssh.dispose();
}).catch(err => {
  console.error("Error:", err);
  ssh.dispose();
});
