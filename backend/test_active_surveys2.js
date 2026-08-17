const https = require('https');
https.get('https://demo.bloomix.io/atsolar/api/v1/surveys/active', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log("Response:", data));
});
