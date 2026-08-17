const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.putFile('src/routes/survey.routes.ts', '/applications/atsolar_backend/src/routes/survey.routes.ts');
}).then(() => {
  return ssh.putFile('src/routes/checkin.routes.ts', '/applications/atsolar_backend/src/routes/checkin.routes.ts');
}).then(() => {
  console.log("Files uploaded successfully.");
  return ssh.execCommand('npm run build', { cwd: '/applications/atsolar_backend' });
}).then(res => {
  console.log("Build:\n", res.stdout, res.stderr);
  return ssh.execCommand('pm2 restart atsolar_api');
}).then(res => {
  console.log("PM2:\n", res.stdout, res.stderr);
  ssh.dispose();
}).catch(err => {
  console.error("Error:", err);
  ssh.dispose();
});
