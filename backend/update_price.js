const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const sections = await prisma.surveySection.findMany({ include: { questions: true } });
  for (let s of sections) {
    if ([1,2,3,4,5].includes(s.orderIndex)) {
      const kf = s.questions.find(q => q.questionText && q.questionText.includes('Key Features'));
      if (kf) {
        const hasPrice = s.questions.find(q => q.questionText === 'Price');
        if (!hasPrice) {
          await prisma.surveyQuestion.create({
            data: { sectionId: s.id, questionText: 'Price', type: 'number', isRequired: false, orderIndex: kf.orderIndex + 1 }
          });
          console.log('Added Price to section', s.title);
        }
      }
    }
  }
}
main().catch(console.error).finally(()=>prisma.$disconnect());
