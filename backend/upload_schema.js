const fs = require('fs');

async function main() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch('https://demo.bloomix.io/atsolar/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'tso@advancetelecom.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    console.log('Token acquired:', token.substring(0, 15) + '...');

    // 2. Read Schema
    const schema = JSON.parse(fs.readFileSync('survey_schema.json', 'utf-8'));
    console.log(`Loaded ${schema.length} elements from schema`);

    // 3. Update Survey Template 9
    console.log('Updating Survey Template ID 9...');
    const updateRes = await fetch('https://demo.bloomix.io/atsolar/api/v1/surveys/config/9', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Market Visit Survey (Updated)',
        schema
      })
    });
    const updateData = await updateRes.json();
    console.log('Update success:', updateData);
  } catch (error) {
    console.error('Error:', error);
  }
}
main();
