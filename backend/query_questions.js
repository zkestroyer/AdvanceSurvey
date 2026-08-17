const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('cat /applications/atsolar_backend/prisma/schema.prisma'); // Just kidding, I need to query the database.
}).then(() => {
  return ssh.execCommand('mysql -u atsolar_user -p"atsolar_password" atsolar_db -e "SELECT id, questionText, type, sectionId FROM SurveyQuestion WHERE questionText LIKE \'%Contact%\';"');
}).then(res => {
  console.log("QUESTIONS:\n", res.stdout);
  ssh.dispose();
});
