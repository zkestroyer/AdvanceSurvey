const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

async function run() {
  try {
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722
    });

    console.log('Connected!');
    
    // Find backend dir
    let result = await ssh.execCommand('ls -la /applications/atsolar_backend || ls -la ~/applications/atsolar_backend || ls -la /');
    console.log('BACKEND DIR TEST:\n' + result.stdout);

    // Find frontend dir
    result = await ssh.execCommand('ls -la /applications/demo.bloomix.io/public_html/atsolar || ls -la ~/demo.bloomix.io/atsolar || ls -la /demo.bloomix.io/atsolar');
    console.log('FRONTEND DIR TEST:\n' + result.stdout);

    ssh.dispose();
  } catch (err) {
    console.error(err);
  }
}

run();
