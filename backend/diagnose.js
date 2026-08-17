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

    // 1. Check NGINX / Apache config for atsolar proxy
    console.log('\n=== Checking .htaccess ===');
    const htaccess = await ssh.execCommand('cat /applications/demo.bloomix.io/public_html/atsolar/.htaccess');
    console.log(htaccess.stdout);

    // 2. Check NGINX config
    console.log('\n=== Checking NGINX config ===');
    const nginx = await ssh.execCommand('cat /etc/nginx/sites-enabled/demo.bloomix.io 2>/dev/null || cat /etc/nginx/conf.d/demo.bloomix.io.conf 2>/dev/null || grep -r "demo.bloomix" /etc/nginx/ 2>/dev/null | head -20');
    console.log(nginx.stdout);

    // 3. Test the full URL chain from inside the server
    console.log('\n=== Testing submit endpoint locally ===');
    const loginRes = await ssh.execCommand('curl -s -X POST -H "Content-Type: application/json" -d \'{"email":"tso@advancetelecom.com", "password":"password123"}\' http://localhost:4005/api/v1/auth/login');
    const loginData = JSON.parse(loginRes.stdout);
    const token = loginData.data.token;
    console.log('Got token:', token.substring(0, 30) + '...');

    // 4. Test survey history
    console.log('\n=== Testing /surveys/my-history ===');
    const historyRes = await ssh.execCommand(`curl -s -H "Authorization: Bearer ${token}" http://localhost:4005/api/v1/surveys/my-history`);
    console.log('HISTORY:', historyRes.stdout);

    // 5. Test active survey
    console.log('\n=== Testing /surveys/active ===');
    const activeRes = await ssh.execCommand(`curl -s -H "Authorization: Bearer ${token}" http://localhost:4005/api/v1/surveys/active`);
    console.log('ACTIVE:', activeRes.stdout);

    // 6. Check survey responses in DB
    console.log('\n=== Checking SurveyResponse table ===');
    const dbRes = await ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "SELECT id, templateId, shopId, userId, status, startedAt, completedAt FROM SurveyResponse ORDER BY id DESC LIMIT 10;"');
    console.log(dbRes.stdout);

    // 7. Check SurveyTemplate table
    console.log('\n=== Checking SurveyTemplate table ===');
    const tmplRes = await ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "SELECT id, title, isActive FROM SurveyTemplate;"');
    console.log(tmplRes.stdout);

    // 8. Check PM2 error logs (recent)
    console.log('\n=== Recent error logs ===');
    const errLogs = await ssh.execCommand('pm2 logs atsolar_api --err --lines 20 --nostream');
    console.log(errLogs.stdout);

  } catch (error) {
    console.error('SSH Error:', error);
  } finally {
    ssh.dispose();
  }
}
main();
