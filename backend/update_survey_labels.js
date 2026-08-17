const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const surveys = await prisma.survey.findMany();
  for (const s of surveys) {
    if (s.config) {
      let configStr = JSON.stringify(s.config);
      // We will do a regex replace to ensure we catch variations in casing, but match exactly the phrase
      configStr = configStr.replace(/Service warranty/g, 'Performance warranty only Solar panels');
      configStr = configStr.replace(/Service Warranty/g, 'Performance warranty only Solar panels');
      configStr = configStr.replace(/service warranty/g, 'Performance warranty only Solar panels');
      
      configStr = configStr.replace(/Purchase price/g, 'Buying price');
      configStr = configStr.replace(/Purchase Price/g, 'Buying price');
      configStr = configStr.replace(/purchase price/g, 'Buying price');
      
      const newConfig = JSON.parse(configStr);
      
      await prisma.survey.update({
        where: { id: s.id },
        data: { config: newConfig }
      });
      console.log(`Updated survey ${s.id} successfully.`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
