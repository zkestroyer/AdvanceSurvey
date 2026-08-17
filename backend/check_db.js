const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function main() {
  try {
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
    });
    console.log('Connected!');

    const res = await ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "SELECT id, title, isActive, createdAt FROM SurveyTemplate;"');
    console.log(res.stdout);
    
  } catch (error) {
    console.error('SSH Error:', error);
  } finally {
    ssh.dispose();
  }
}
main();
