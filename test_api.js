const https = require('https');
const baseUrl = 'https://demo.bloomix.io/atsolar/api/v1';

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const loginRes = await request('POST', '/auth/login', { email: 'admin@advancetelecom.com', password: 'admin123' });
  const activeRes = await request('GET', '/surveys/active', null, loginRes.data.token);
  console.log(JSON.stringify(activeRes.data.sections[0].questions, null, 2));
}
main();
