const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('node -e "const { PrismaClient } = require(\'@prisma/client\'); const prisma = new PrismaClient(); prisma.surveyTemplate.findMany({ include: { sections: { include: { questions: true } } } }).then(res => console.log(JSON.stringify(res, null, 2))).catch(e => console.log(e)).finally(() => prisma.$disconnect());"', { cwd: '/home/master-94099776/htdocs/demo.bloomix.io/atsolar/api' });
}).then(res => {
  console.log("Prisma:\n", res.stdout.substring(0, 1500));
  ssh.dispose();
});
