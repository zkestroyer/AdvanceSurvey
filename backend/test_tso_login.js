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
    // Find tso@advancetelecom.com in DB to see if password works
    const res = await ssh.execCommand('node -e "const { PrismaClient } = require(\'@prisma/client\'); const prisma = new PrismaClient(); prisma.user.findFirst({where:{email:\'tso@advancetelecom.com\'}}).then(u => console.log(\'TSO:\', u)).catch(console.error).finally(()=>prisma.$disconnect());"', { cwd: '/home/master-94099776/htdocs/demo.bloomix.io/atsolar/api' });
    console.log('API:', res.stdout.substring(0, 5000));
    if (res.stderr) console.error('ERR:', res.stderr);
  } catch(e) {
    console.error(e);
  } finally {
    ssh.dispose();
  }
}
main();
