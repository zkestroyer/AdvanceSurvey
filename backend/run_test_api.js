const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
async function main() {
  await ssh.connect({
    host: '172.104.130.208',
    username: 'master-94099776',
    password: 'j0PhbaxkNl0ORIH',
    port: 2722,
  });
  await ssh.putFile('test_api.js', '/applications/atsolar_backend/test_api.js');
  const res = await ssh.execCommand('node test_api.js', { cwd: '/applications/atsolar_backend' });
  console.log(res.stdout || res.stderr);
  ssh.dispose();
}
main();
