const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('pm2 logs atsolar_api --out --lines 50 --nostream', { cwd: '/applications/atsolar_backend' });
}).then(res => {
  console.log("Logs:\n", res.stdout.substring(0, 5000));
  if (res.stderr) console.error("ERR:", res.stderr);
  ssh.dispose();
});
