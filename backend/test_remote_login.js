const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
async function main() {
  try {
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
    });
    console.log('Connected!');
    const res = await ssh.execCommand('curl -X POST -H "Content-Type: application/json" -d \'{"email":"tso@advancetelecom.com", "password":"password123"}\' http://localhost:4005/api/v1/auth/login');
    console.log('LOGIN:', res.stdout);
    if(res.stderr) console.error(res.stderr);
  } catch(e) {
    console.error(e);
  } finally {
    ssh.dispose();
  }
}
main();
