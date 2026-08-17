const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const jwt = require('jsonwebtoken');

const token = jwt.sign({userId: 1, roleId: 1}, 'demo_secret_key_123');

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand(`curl -s http://localhost:4005/api/v1/surveys/active -H "Authorization: Bearer ${token}"`);
}).then(res => {
  console.log("Active Surveys:\n", res.stdout);
  ssh.dispose();
});
