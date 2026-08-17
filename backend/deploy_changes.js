const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.putFile('src/routes/survey.routes.ts', '/applications/atsolar_backend/src/routes/survey.routes.ts');
}).then(() => {
  return ssh.putFile('prisma/schema.prisma', '/applications/atsolar_backend/prisma/schema.prisma');
}).then(() => {
  console.log('Files uploaded successfully. Pushing DB schema...');
  return ssh.execCommand('npx prisma db push', { cwd: '/applications/atsolar_backend' });
}).then(res => {
  console.log('DB Push:\\n', res.stdout, res.stderr);
  return ssh.execCommand('npm run build', { cwd: '/applications/atsolar_backend' });
}).then(res => {
  console.log('Build:\\n', res.stdout, res.stderr);
  return ssh.execCommand('pm2 restart atsolar_api');
}).then(res => {
  console.log('PM2:\\n', res.stdout, res.stderr);
  ssh.dispose();
}).catch(err => {
  console.error('Error:', err);
  ssh.dispose();
});