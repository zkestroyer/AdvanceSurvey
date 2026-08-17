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
  const token = loginRes.data.token;
  const activeRes = await request('GET', '/surveys/active', null, token);
  const activeTemplate = activeRes.data;
  
  const fakeResponses = {};
  if (activeTemplate && activeTemplate.sections) {
    let qCount = 0;
    for (const sec of activeTemplate.sections) {
      for (const q of sec.questions) {
        if (q.type === 'text' || q.type === 'date') {
          fakeResponses[q.id.toString()] = "Fake Answer " + qCount++;
        }
      }
    }
  }

  // Submit fake response
  const submitRes = await request('POST', '/surveys/submit', {
    surveyId: activeTemplate.id,
    shopId: 1,
    responses: fakeResponses
  }, token);
  console.log('Submit:', submitRes);

  // Get history
  const historyRes = await request('GET', '/surveys/my-history', null, token);
  console.log('History:', JSON.stringify(historyRes.data.slice(0, 2), null, 2));
}
main();
