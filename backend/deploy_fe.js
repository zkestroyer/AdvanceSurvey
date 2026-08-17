const { NodeSSH } = require('node-ssh');
const path = require('path');
const ssh = new NodeSSH();

async function deployFrontend() {
  try {
    console.log('Connecting...');
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
      readyTimeout: 20000
    });
    console.log('Connected!');

    const fePath = '/applications/demo.bloomix.io/public_html/atsolar';
    console.log('Creating Frontend Path:', fePath);
    await ssh.execCommand(`mkdir -p ${fePath}`);

    console.log('Uploading Frontend dist...');
    await ssh.putDirectory(
      path.resolve(__dirname, '../frontend/dist'),
      fePath,
      {
        recursive: true,
        concurrency: 10
      }
    );
    console.log('Frontend Deploy Complete!');

    ssh.dispose();
  } catch (e) {
    console.error('Deployment Failed:', e);
    if(ssh) ssh.dispose();
  }
}
deployFrontend();
