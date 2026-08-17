fetch('https://demo.bloomix.io/atsolar/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'tso@advancetelecom.com', password: 'password123' })
})
.then(res => res.json().then(data => ({ status: res.status, data })))
.then(console.log)
.catch(console.error);
