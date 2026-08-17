const { NodeSSH } = require('node-ssh');
const path = require('path');
const ssh = new NodeSSH();

async function main() {
  try {
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
    });
    
    console.log('Connected! Uploading backend directory...');
    const localPath = path.resolve(__dirname);
    const remotePath = '/applications/atsolar_backend';
    
    const failed = [];
    const successful = [];
    await ssh.putDirectory(localPath, remotePath, {
      recursive: true,
      concurrency: 10,
      tick: (local, remote, error) => {
        if (error) failed.push(local);
        else successful.push(local);
      },
      validate: (itemPath) => {
        const basename = path.basename(itemPath);
        return basename !== 'node_modules' && basename !== '.env' && basename !== 'dev.db';
      }
    });
    
    console.log(`Uploaded ${successful.length} files. Failed: ${failed.length}`);
    
    const pushResult = await ssh.execCommand('cd /applications/atsolar_backend && npm install && pm2 restart atsolar_api');
    console.log('RESTART:\n', pushResult.stdout);
    if (pushResult.stderr) console.error('RESTART ERR:\n', pushResult.stderr);
    
  } catch (error) {
    console.error('SSH Error:', error);
  } finally {
    ssh.dispose();
  }
}
main();
