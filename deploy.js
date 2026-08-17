const Client = require('ssh2').Client;
const SftpClient = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

const config = {
  host: '172.104.130.208',
  port: 2722,
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  readyTimeout: 99999
};

async function uploadFrontend() {
  const sftp = new SftpClient();
  try {
    console.log('Connecting to SFTP for frontend upload...');
    await sftp.connect(config);
    const localDir = path.join(__dirname, 'frontend', 'dist');
    const remoteDir = '/applications/demo.bloomix.io/public_html/atsolar';
    
    // Check if dist exists
    if (!fs.existsSync(localDir)) {
      throw new Error(`Local dir ${localDir} does not exist`);
    }

    console.log(`Uploading ${localDir} to ${remoteDir}...`);
    // Clear the remote directory before uploading to ensure clean deployment? 
    // Usually it's better to just uploadDir which overwrites.
    await sftp.uploadDir(localDir, remoteDir);
    console.log('Frontend uploaded successfully!');
  } catch (err) {
    console.error('Error uploading frontend:', err);
  } finally {
    sftp.end();
  }
}

async function uploadBackendAndRestart() {
  const sftp = new SftpClient();
  try {
    console.log('Connecting to SFTP for backend upload...');
    await sftp.connect(config);
    const localFile = path.join(__dirname, 'backend', 'src', 'routes', 'master.routes.ts');
    const remoteFile = '/applications/atsolar_backend/src/routes/master.routes.ts';
    
    console.log(`Uploading ${localFile} to ${remoteFile}...`);
    await sftp.put(localFile, remoteFile);

    const localSurveyFile = path.join(__dirname, 'backend', 'src', 'routes', 'survey.routes.ts');
    const remoteSurveyFile = '/applications/atsolar_backend/src/routes/survey.routes.ts';
    console.log(`Uploading ${localSurveyFile} to ${remoteSurveyFile}...`);
    await sftp.put(localSurveyFile, remoteSurveyFile);

    const localSchema = path.join(__dirname, 'backend', 'prisma', 'schema.prisma');
    const remoteSchema = '/applications/atsolar_backend/prisma/schema.prisma';
    console.log(`Uploading ${localSchema} to ${remoteSchema}...`);
    await sftp.put(localSchema, remoteSchema);

    const localAnalytics = path.join(__dirname, 'backend', 'src', 'routes', 'analytics.routes.ts');
    const remoteAnalytics = '/applications/atsolar_backend/src/routes/analytics.routes.ts';
    console.log(`Uploading ${localAnalytics} to ${remoteAnalytics}...`);
    await sftp.put(localAnalytics, remoteAnalytics);

    const localExecutive = path.join(__dirname, 'backend', 'src', 'routes', 'executive.routes.ts');
    const remoteExecutive = '/applications/atsolar_backend/src/routes/executive.routes.ts';
    console.log(`Uploading ${localExecutive} to ${remoteExecutive}...`);
    await sftp.put(localExecutive, remoteExecutive);

    const localIndex = path.join(__dirname, 'backend', 'src', 'index.ts');
    const remoteIndex = '/applications/atsolar_backend/src/index.ts';
    console.log(`Uploading ${localIndex} to ${remoteIndex}...`);
    await sftp.put(localIndex, remoteIndex);

    const localAuth = path.join(__dirname, 'backend', 'src', 'middlewares', 'auth.middleware.ts');
    const remoteAuth = '/applications/atsolar_backend/src/middlewares/auth.middleware.ts';
    console.log(`Uploading ${localAuth} to ${remoteAuth}...`);
    await sftp.put(localAuth, remoteAuth);
    
    const localSeed = path.join(__dirname, 'backend', 'seed.js');
    const remoteSeed = '/applications/atsolar_backend/seed.js';
    console.log(`Uploading ${localSeed} to ${remoteSeed}...`);
    await sftp.put(localSeed, remoteSeed);

    console.log('Backend files uploaded successfully!');
  } catch (err) {
    console.error('Error uploading backend:', err);
  } finally {
    sftp.end();
  }

  console.log('Executing backend restart commands via SSH...');
  const conn = new Client();
  conn.on('ready', () => {
    console.log('SSH Connection ready. Executing commands...');
    const cmd = 'cd /applications/atsolar_backend && npx prisma db push --accept-data-loss && npx prisma generate && node seed.js && npx tsc && pm2 restart atsolar_api';
    conn.exec(cmd, (err, stream) => {
      if (err) throw err;
      stream.on('close', (code, signal) => {
        console.log(`Stream :: close :: code: ${code}, signal: ${signal}`);
        conn.end();
      }).on('data', (data) => {
        console.log(`STDOUT: ${data}`);
      }).stderr.on('data', (data) => {
        console.error(`STDERR: ${data}`);
      });
    });
  }).on('error', (err) => {
    console.error('SSH Connection error:', err);
  }).connect(config);
}

async function deploy() {
  await uploadFrontend();
  await uploadBackendAndRestart();
}

deploy();
