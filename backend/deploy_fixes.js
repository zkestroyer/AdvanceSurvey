const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const ssh = new NodeSSH();

async function main() {
  try {
    await ssh.connect({
      host: '172.104.130.208',
      username: 'master-94099776',
      password: 'j0PhbaxkNl0ORIH',
      port: 2722,
    });
    console.log('Connected to server for deployment!');

    // 1. Upload Backend Route
    console.log('Uploading backend route...');
    await ssh.putFile(
      'C:/Users/HP/.gemini/antigravity/scratch/AdvanceTelecom/Zainab_Handover/backend/src/routes/survey.routes.ts',
      '/applications/atsolar_backend/src/routes/survey.routes.ts'
    );
    await ssh.putFile(
      'C:/Users/HP/.gemini/antigravity/scratch/AdvanceTelecom/Zainab_Handover/backend/src/routes/master.routes.ts',
      '/applications/atsolar_backend/src/routes/master.routes.ts'
    );

    // 2. Upload Frontend Pages
    console.log('Uploading frontend pages...');
    await ssh.putFile(
      'C:/Users/HP/.gemini/antigravity/scratch/AdvanceTelecom/Zainab_Handover/frontend/src/pages/SurveyBuilder.tsx',
      '/applications/atsolar_frontend/src/pages/SurveyBuilder.tsx'
    );
    await ssh.putFile(
      'C:/Users/HP/.gemini/antigravity/scratch/AdvanceTelecom/Zainab_Handover/frontend/src/pages/SurveyManagement.tsx',
      '/applications/atsolar_frontend/src/pages/SurveyManagement.tsx'
    );
    await ssh.putFile(
      'C:/Users/HP/.gemini/antigravity/scratch/AdvanceTelecom/Zainab_Handover/frontend/src/pages/MasterData.tsx',
      '/applications/atsolar_frontend/src/pages/MasterData.tsx'
    );
    await ssh.putFile(
      'C:/Users/HP/.gemini/antigravity/scratch/AdvanceTelecom/Zainab_Handover/frontend/src/pages/AnalyticsReports.tsx',
      '/applications/atsolar_frontend/src/pages/AnalyticsReports.tsx'
    );
    await ssh.putFile(
      'C:/Users/HP/.gemini/antigravity/scratch/AdvanceTelecom/Zainab_Handover/frontend/src/pages/UserManagement.tsx',
      '/applications/atsolar_frontend/src/pages/UserManagement.tsx'
    );

    // 3. Rebuild and Restart Backend
    console.log('Rebuilding backend...');
    const backendBuild = await ssh.execCommand('cd /applications/atsolar_backend && npx tsc');
    console.log('Backend Build:', backendBuild.stdout, backendBuild.stderr);
    
    console.log('Restarting PM2 for Backend...');
    const backendRestart = await ssh.execCommand('pm2 restart atsolar_api');
    console.log('Backend Restart:', backendRestart.stdout);

    // 4. Rebuild Frontend
    console.log('Rebuilding frontend...');
    const frontendBuild = await ssh.execCommand('cd /applications/atsolar_frontend && npm run build');
    console.log('Frontend Build:', frontendBuild.stdout, frontendBuild.stderr);
    
    console.log('Checking frontend build output to copy to public_html if necessary...');
    const lsFrontend = await ssh.execCommand('ls -la /applications/atsolar_frontend/dist');
    console.log('Frontend dist:', lsFrontend.stdout);
    
    console.log('If NGINX serves from /demo.bloomix.io/public_html, we might need to copy it...');
    // Sometimes people copy `dist/*` to public_html
    const cpFrontend = await ssh.execCommand('cp -r /applications/atsolar_frontend/dist/* /demo.bloomix.io/public_html/ || true');
    console.log('Copy to public_html (ignore errors if it does not exist):', cpFrontend.stdout, cpFrontend.stderr);

    console.log('Done Deploying!');
  } catch (error) {
    console.error('Deployment Error:', error);
  } finally {
    ssh.dispose();
  }
}
main();
