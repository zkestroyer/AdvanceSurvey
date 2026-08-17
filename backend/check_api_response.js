const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('curl -s http://localhost:3000/api/v1/surveys/active');
}).then(res => {
  console.log("Active Surveys JSON:\n", res.stdout.substring(0, 1500));
  ssh.dispose();
});
