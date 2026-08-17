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

    // 1. Check how PM2 is running the app
    console.log('\n=== PM2 process details ===');
    const pm2Info = await ssh.execCommand('pm2 show atsolar_api');
    console.log(pm2Info.stdout);

    // 2. Check package.json scripts
    console.log('\n=== package.json scripts ===');
    const pkgJson = await ssh.execCommand('cat /applications/atsolar_backend/package.json');
    console.log(pkgJson.stdout);

    // 3. Check if ts-node is available
    console.log('\n=== ts-node check ===');
    const tsNode = await ssh.execCommand('cd /applications/atsolar_backend && npx ts-node --version 2>&1');
    console.log(tsNode.stdout);

    // 4. Check node version
    console.log('\n=== Node version ===');
    const nodeVer = await ssh.execCommand('node --version');
    console.log(nodeVer.stdout);

    // 5. List the src/routes directory
    console.log('\n=== Routes directory ===');
    const routeFiles = await ssh.execCommand('ls -la /applications/atsolar_backend/src/routes/');
    console.log(routeFiles.stdout);

    // 6. Check if there's a dist/build directory
    console.log('\n=== Check dist/build directories ===');
    const distCheck = await ssh.execCommand('ls -la /applications/atsolar_backend/dist/ 2>/dev/null; ls -la /applications/atsolar_backend/build/ 2>/dev/null; ls /applications/atsolar_backend/*.js 2>/dev/null');
    console.log(distCheck.stdout);

  } catch (error) {
    console.error('SSH Error:', error);
  } finally {
    ssh.dispose();
  }
}
main();
