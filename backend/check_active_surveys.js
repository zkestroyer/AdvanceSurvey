const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('curl -s http://localhost:4005/api/v1/surveys/active -H "Authorization: Bearer $(node -e \\"const jwt=require(\'jsonwebtoken\');console.log(jwt.sign({userId:1,roleId:1},\'demo_secret_key_123\'))\\")"');
}).then(res => {
  console.log("Active Surveys:\n", res.stdout, res.stderr);
  ssh.dispose();
});
