const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const surveys = await prisma.survey.findMany();
  for (const s of surveys) {
    console.log('--- Survey ID:', s.id, 'Title:', s.title, '---');
    console.log(JSON.stringify(s.config, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
