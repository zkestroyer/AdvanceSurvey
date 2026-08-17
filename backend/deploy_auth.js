const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(async () => {
  console.log("Connected to server.");
  const backupCmd = 'cp /applications/atsolar_backend/src/routes/auth.routes.ts /applications/atsolar_backend/src/routes/auth.routes.ts.bak.' + new Date().toISOString().replace(/[:.]/g, '-');
  console.log("Running backup:", backupCmd);
  let res = await ssh.execCommand(backupCmd);
  console.log("Backup stdout:", res.stdout);
  
  const checkCmd = 'ls -la /applications/atsolar_backend/src/routes/auth.routes.ts.bak.*';
  res = await ssh.execCommand(checkCmd);
  console.log("Check backup:", res.stdout);

  console.log("Uploading src/routes/auth.routes.ts...");
  await ssh.putFile('src/routes/auth.routes.ts', '/applications/atsolar_backend/src/routes/auth.routes.ts');
  console.log("File uploaded successfully.");
  
  console.log("Running npm run build...");
  res = await ssh.execCommand('npm run build', { cwd: '/applications/atsolar_backend' });
  console.log("Build stdout:", res.stdout);
  
  console.log("Restarting pm2...");
  res = await ssh.execCommand('pm2 restart atsolar_api');
  console.log("PM2 stdout:", res.stdout);
  
  ssh.dispose();
}).catch(err => {
  console.error("Error:", err);
  ssh.dispose();
});
