const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shops = await prisma.shop.findMany();
  let lat = 24.8607;
  let lng = 67.0011;
  
  for (const shop of shops) {
    await prisma.shop.update({
      where: { id: shop.id },
      data: { latitude: lat, longitude: lng }
    });
    lat += 0.01;
    lng += 0.01;
  }
  console.log('Shops updated with Lat/Lng!');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
