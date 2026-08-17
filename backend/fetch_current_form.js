const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.surveyTemplate.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1,
    include: {
      sections: {
        include: { questions: { orderBy: { orderIndex: 'asc' } } }
      }
    }
  });
  
  if (templates.length === 0) return console.log('No templates found.');
  const t = templates[0];
  console.log('Template ID:', t.id);
  
  for (const s of t.sections) {
    console.log('\n--- Section:', s.title);
    for (const q of s.questions) {
      console.log([]  ());
    }
  }
}

main().finally(() => prisma.$disconnect());