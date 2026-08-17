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
    const res = await ssh.execCommand('node -e "const http = require(\'http\'); const req = http.request({host: \'localhost\', port: 3000, path: \'/api/v1/auth/login\', method: \'POST\', headers: {\'Content-Type\': \'application/json\'}}, (res) => { let d = \'\'; res.on(\'data\', c => d += c); res.on(\'end\', () => { const token = JSON.parse(d).data.token; http.get({host: \'localhost\', port: 3000, path: \'/api/v1/surveys/active\', headers: {\'Authorization\': \'Bearer \' + token}}, (r2) => { let d2 = \'\'; r2.on(\'data\', c => d2 += c); r2.on(\'end\', () => console.log(d2)); }); }); }); req.write(JSON.stringify({email:\'tso@advancetelecom.com\', password:\'password123\'})); req.end();"');
    console.log('API:', res.stdout.substring(0, 5000));
  } catch(e) {
    console.error(e);
  } finally {
    ssh.dispose();
  }
}
main();
