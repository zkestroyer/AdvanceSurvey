const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function main() {
  await ssh.connect({
    host: '172.104.130.208',
    username: 'master-94099776',
    password: 'j0PhbaxkNl0ORIH',
    port: 2722,
  });
  
  await ssh.putFile('query_db.js', '/applications/atsolar_backend/query_db.js');
  const res = await ssh.execCommand('node query_db.js', { cwd: '/applications/atsolar_backend' });
  console.log(res.stdout || res.stderr);
  ssh.dispose();
}
main();
