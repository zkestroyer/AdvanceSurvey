const { NodeSSH } = require('node-ssh');
const path = require('path');
const ssh = new NodeSSH();

async function deployFrontendZip() {
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

    const fePath = '/applications/demo.bloomix.io/public_html';
    console.log('Uploading ZIP...');
    await ssh.putFile(
      path.resolve(__dirname, '../frontend/Web_Dashboard_Build_New.zip'),
      fePath + '/atsolar.zip'
    );

    console.log('Extracting ZIP...');
    // We remove the old atsolar symlink and extract the zip
    const cmd = await ssh.execCommand(`cd ${fePath} && rm -rf atsolar && unzip -o atsolar.zip -d atsolar && rm atsolar.zip`);
    console.log(cmd.stdout);
    if(cmd.stderr) console.error(cmd.stderr);
    
    console.log('Frontend Deploy Complete!');
    ssh.dispose();
  } catch (e) {
    console.error('Deployment Failed:', e);
    if(ssh) ssh.dispose();
  }
}
deployFrontendZip();
