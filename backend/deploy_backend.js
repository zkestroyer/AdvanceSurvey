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
    console.log('Connected to server for deployment!');

    console.log('Uploading backend route...');
    await ssh.putFile(
      'C:/Users/HP/.gemini/antigravity/scratch/AdvanceTelecom/Zainab_Handover/backend/src/routes/master.routes.ts',
      '/applications/atsolar_backend/src/routes/master.routes.ts'
    );

    console.log('Rebuilding backend...');
    let res = await ssh.execCommand('npx tsc', { cwd: '/applications/atsolar_backend' });
    console.log('Backend Build: ', res.stdout || res.stderr);

    console.log('Restarting PM2 for Backend...');
    res = await ssh.execCommand('pm2 restart atsolar_backend', { cwd: '/applications/atsolar_backend' });
    console.log('Backend Restart:', res.stdout);

    console.log('Done Deploying!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    ssh.dispose();
  }
}
main();
