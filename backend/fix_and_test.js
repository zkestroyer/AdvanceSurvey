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

    // 1. Recompile TypeScript to JavaScript
    console.log('\n=== Compiling TypeScript ===');
    const buildResult = await ssh.execCommand('cd /applications/atsolar_backend && npx tsc');
    console.log('BUILD stdout:', buildResult.stdout);
    if (buildResult.stderr) console.error('BUILD stderr:', buildResult.stderr);

    // 2. Verify the compiled survey.routes.js now has submit and my-history
    console.log('\n=== Verifying compiled survey.routes.js ===');
    const verify = await ssh.execCommand('grep -n "submit\\|my-history" /applications/atsolar_backend/src/routes/survey.routes.js');
    console.log(verify.stdout || '(STILL NOT FOUND - problem!)');

    // 3. Restart PM2
    console.log('\n=== Restarting PM2 ===');
    const restart = await ssh.execCommand('pm2 restart atsolar_api');
    console.log(restart.stdout);

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. Test login
    console.log('\n=== Testing login ===');
    const loginRes = await ssh.execCommand('curl -s -X POST -H "Content-Type: application/json" -d \'{"email":"tso@advancetelecom.com", "password":"password123"}\' http://localhost:4005/api/v1/auth/login');
    const loginData = JSON.parse(loginRes.stdout);
    const token = loginData.data.token;
    console.log('Login OK, got token');

    // 5. Test /surveys/my-history
    console.log('\n=== Testing /surveys/my-history ===');
    const historyRes = await ssh.execCommand(`curl -s -H "Authorization: Bearer ${token}" http://localhost:4005/api/v1/surveys/my-history`);
    console.log('HISTORY:', historyRes.stdout);

    // 6. Test /surveys/submit with a dummy survey
    console.log('\n=== Testing /surveys/submit ===');
    const submitRes = await ssh.execCommand(`curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"surveyId": 9, "shopId": 1, "responses": {"111": "Test Shop", "112": "2026-06-29"}}' http://localhost:4005/api/v1/surveys/submit`);
    console.log('SUBMIT:', submitRes.stdout);

    // 7. Re-check history
    console.log('\n=== Re-checking history after submit ===');
    const historyRes2 = await ssh.execCommand(`curl -s -H "Authorization: Bearer ${token}" http://localhost:4005/api/v1/surveys/my-history`);
    console.log('HISTORY after submit:', historyRes2.stdout);

    // 8. Check PM2 error logs
    console.log('\n=== Recent error logs ===');
    const errLogs = await ssh.execCommand('pm2 logs atsolar_api --err --lines 10 --nostream');
    console.log(errLogs.stdout);

  } catch (error) {
    console.error('SSH Error:', error);
  } finally {
    ssh.dispose();
  }
}
main();
