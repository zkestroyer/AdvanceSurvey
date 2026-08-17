const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

async function main() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch('https://demo.bloomix.io/atsolar/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'tso@advancetelecom.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    console.log('Deleting Survey ID 4...');
    await fetch('https://demo.bloomix.io/atsolar/api/v1/surveys/4', { method: 'DELETE', headers });
    
    console.log('Deleting Survey ID 5...');
    await fetch('https://demo.bloomix.io/atsolar/api/v1/surveys/5', { method: 'DELETE', headers });

    // 2. Rename Survey 9 via SSH directly
    console.log('Renaming Survey ID 9...');
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
    });
    await ssh.execCommand('mysql -u master-94099776 -pcJjuiLp3NFMXiJh0xqeOe atsolar_db -e "UPDATE SurveyTemplate SET title=\'Market Visit Survey\' WHERE id=9;"');
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    ssh.dispose();
  }
}
main();
