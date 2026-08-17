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

    // 1. Check how PM2 actually starts the app (script path)
    console.log('\n=== PM2 config ===');
    const pm2Desc = await ssh.execCommand('pm2 describe atsolar_api | grep "exec mode\\|script\\|interpreter\\|exec cwd\\|node.js\\|script id"');
    console.log(pm2Desc.stdout);

    // 2. Check the old compiled survey.routes.js to see if it has /submit and /my-history
    console.log('\n=== Check old compiled survey.routes.js for submit/my-history ===');
    const grepSubmit = await ssh.execCommand('grep -n "submit\\|my-history" /applications/atsolar_backend/src/routes/survey.routes.js');
    console.log(grepSubmit.stdout || '(NOT FOUND in compiled JS!)');

    // 3. Check current TS file for submit/my-history
    console.log('\n=== Check current survey.routes.ts for submit/my-history ===');
    const grepTS = await ssh.execCommand('grep -n "submit\\|my-history" /applications/atsolar_backend/src/routes/survey.routes.ts');
    console.log(grepTS.stdout);

    // 4. Check if PM2 ecosystem file exists
    console.log('\n=== PM2 ecosystem ===');
    const ecosystem = await ssh.execCommand('cat /applications/atsolar_backend/ecosystem.config.js 2>/dev/null || echo "No ecosystem file"');
    console.log(ecosystem.stdout);

    // 5. Check what pm2 startup script is
    console.log('\n=== PM2 startup script check ===');
    const pm2Script = await ssh.execCommand('pm2 prettylist | grep -A5 "atsolar"');
    console.log(pm2Script.stdout);

  } catch (error) {
    console.error('SSH Error:', error);
  } finally {
    ssh.dispose();
  }
}
main();
