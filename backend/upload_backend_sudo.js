const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.putFile('src/routes/survey.routes.ts', '/tmp/survey.routes.ts');
}).then(() => {
  console.log("File uploaded to /tmp successfully.");
  return ssh.execCommand('echo j0PhbaxkNl0ORIH | sudo -S cp /tmp/survey.routes.ts /home/master-94099776/htdocs/demo.bloomix.io/atsolar/api/src/routes/survey.routes.ts');
}).then(res => {
  console.log("Copy:\n", res.stdout, res.stderr);
  return ssh.execCommand('npm run build', { cwd: '/home/master-94099776/htdocs/demo.bloomix.io/atsolar/api' });
}).then(res => {
  console.log("Build:\n", res.stdout, res.stderr);
  return ssh.execCommand('pm2 restart atsolar-api');
}).then(res => {
  console.log("PM2:\n", res.stdout, res.stderr);
  ssh.dispose();
}).catch(err => {
  console.error("Error:", err);
  ssh.dispose();
});
