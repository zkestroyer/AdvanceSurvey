const { NodeSSH } = require('node-ssh');
const path = require('path');

const ssh = new NodeSSH();

async function deploy() {
  try {
    console.log('Connecting...');
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
      readyTimeout: 20000
    });
    console.log('Connected!');

    // 1. Upload Backend Files
    console.log('Uploading Backend changes...');
    await ssh.putFile(
      path.resolve(__dirname, 'src/routes/master.routes.ts'),
      '/applications/atsolar_backend/src/routes/master.routes.ts'
    );
    await ssh.putFile(
      path.resolve(__dirname, 'src/routes/analytics.routes.ts'),
      '/applications/atsolar_backend/src/routes/analytics.routes.ts'
    );
    await ssh.putFile(
      path.resolve(__dirname, 'src/routes/survey.routes.ts'),
      '/applications/atsolar_backend/src/routes/survey.routes.ts'
    );
    await ssh.putFile(
      path.resolve(__dirname, 'prisma/schema.prisma'),
      '/applications/atsolar_backend/prisma/schema.prisma'
    );

    // 2. Restart & Migrate Backend
    console.log('Running Backend migrations and restart...');
    const beCmd = await ssh.execCommand(
      'cd /applications/atsolar_backend && npx prisma generate && npm run build && npx prisma db push --accept-data-loss && pm2 restart all'
    );
    console.log('Backend Build & Deploy:', beCmd.stdout, beCmd.stderr);

    // 3. Find frontend path
    const getFePath = await ssh.execCommand('ls -d /applications/demo.bloomix.io/public_html/atsolar || ls -d ~/demo.bloomix.io/atsolar || ls -d /demo.bloomix.io/atsolar');
    const fePath = getFePath.stdout.trim().split('\\n')[0];
    console.log('Target Frontend Path:', fePath);

    if (fePath && !fePath.includes('No such file')) {
      console.log('Uploading Frontend dist...');
      await ssh.putDirectory(
        path.resolve(__dirname, '../frontend/dist'),
        fePath,
        {
          recursive: true,
          concurrency: 10
        }
      );
      console.log('Frontend Deploy Complete!');
    } else {
      console.error('Could not determine frontend path!', getFePath.stderr);
    }

    ssh.dispose();
  } catch (e) {
    console.error('Deployment Failed:', e);
    if(ssh) ssh.dispose();
  }
}

deploy();
