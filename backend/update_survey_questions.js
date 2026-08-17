const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const questions = await prisma.surveyQuestion.findMany();
  let count = 0;
  for (const q of questions) {
    let newText = q.questionText;
    let changed = false;
    
    if (newText.toLowerCase().trim() === 'service warranty') {
      newText = 'Performance warranty only Solar panels';
      changed = true;
    }
    
    if (newText.toLowerCase().trim() === 'purchase price') {
      newText = 'Buying price';
      changed = true;
    }
    
    if (changed) {
      await prisma.surveyQuestion.update({
        where: { id: q.id },
        data: { questionText: newText }
      });
      console.log(`Updated question ${q.id} to '${newText}'`);
      count++;
    }
  }
  console.log(`Finished checking. Updated ${count} questions.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
