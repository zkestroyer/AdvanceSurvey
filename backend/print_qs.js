const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const questions = await prisma.surveyQuestion.findMany();
  questions.forEach(q => console.log(`[${q.id}] ${q.questionText}`));
}

main().finally(() => prisma.$disconnect());
