const http = require('http');
const data = JSON.stringify({
  title: 'Test Notification 4',
  message: 'This is a test notification from the backend to verify the fix.',
  audience: 'TSO',
  type: 'info'
});
const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/v1/master/notifications',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};
const req = http.request(options, res => {
  console.log('statusCode:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
});
req.on('error', error => console.error(error));
req.write(data);
req.end();
