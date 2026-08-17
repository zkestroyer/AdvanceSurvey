const { Client } = require('ssh2');
const c = new Client();
c.on('ready', () => {
  c.exec('cd /applications/atsolar_backend && cat << \\EOF > update_price.js\nconst { PrismaClient } = require(\'@prisma/client\');\nconst prisma = new PrismaClient();\nasync function main() {\n  const sections = await prisma.surveySection.findMany({ include: { questions: true } });\n  for (let s of sections) {\n    if ([1,2,3,4,5].includes(s.orderIndex)) {\n      const kf = s.questions.find(q => q.questionText && q.questionText.includes(\'Key Features\'));\n      if (kf) {\n        const hasPrice = s.questions.find(q => q.questionText === \'Price\');\n        if (!hasPrice) {\n          await prisma.surveyQuestion.create({\n            data: { sectionId: s.id, questionText: \'Price\', type: \'number\', isRequired: false, orderIndex: kf.orderIndex + 1 }\n          });\n          console.log(\'Added Price to section\', s.title);\n        }\n      }\n    }\n  }\n}\nmain().catch(console.error).finally(()=>prisma.$disconnect());\nEOF\nnode update_price.js', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      c.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '172.104.130.208',
  port: 2722,
  username: 'master-94099776',
  password: 'j0PhbaxkNl0ORIH'
});
