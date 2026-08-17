const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('cat /applications/atsolar_backend/src/routes/survey.routes.ts');
}).then(res => {
  console.log("SURVEY ROUTES:\n", res.stdout);
  ssh.dispose();
});
