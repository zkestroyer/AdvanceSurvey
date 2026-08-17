const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

ssh.connect({
  host: '172.104.130.208',
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH',
  port: 2722
}).then(() => {
  return ssh.execCommand('node -e "const { PrismaClient } = require(\'@prisma/client\'); const prisma = new PrismaClient(); prisma.surveyTemplate.findFirst({where:{isActive:true}, include:{sections:{include:{questions:true}}}}).then(t => console.log(JSON.stringify(t))).catch(console.error).finally(()=>prisma.$disconnect());"', { cwd: '/home/master-94099776/htdocs/demo.bloomix.io/atsolar/api' });
}).then(res => {
  console.log("Prisma:\n", res.stdout.substring(0, 5000));
  if (res.stderr) console.error("ERR:", res.stderr);
  ssh.dispose();
});
