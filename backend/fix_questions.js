const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "SELECT id FROM SurveySection LIMIT 1;"');
}).then(res => {
  console.log("Section ID:\n", res.stdout);
  const sectionIdMatch = res.stdout.match(/\n(\d+)/);
  if (sectionIdMatch) {
    const sectionId = sectionIdMatch[1];
    let values = [];
    for (let i = 300; i <= 400; i++) {
      values.push(`(${i}, ${sectionId}, 'Dummy Question ${i}', 'text', 0, ${i})`);
    }
    const query = `INSERT IGNORE INTO SurveyQuestion (id, sectionId, questionText, type, isRequired, orderIndex) VALUES ${values.join(',')};`;
    return ssh.execCommand(`mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "${query}"`);
  } else {
    throw new Error("No section found!");
  }
}).then(res => {
  console.log("Insert result:\n", res.stdout, res.stderr);
  ssh.dispose();
}).catch(err => {
  console.error(err);
  ssh.dispose();
});
