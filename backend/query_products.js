const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const brands = await p.product.findMany({
    select: { brand: true, category: true, model: true },
    distinct: ['brand'],
    orderBy: { brand: 'asc' }
  });
  console.log('=== DB PRODUCT BRANDS & CATEGORIES ===');
  brands.forEach(b => console.log(`${b.brand} | cat: ${b.category} | model: ${b.model}`));

  const allProducts = await p.product.findMany({
    select: { name: true, brand: true, category: true, model: true },
    orderBy: [{ brand: 'asc' }, { model: 'asc' }]
  });
  console.log('\n=== ALL PRODUCTS (' + allProducts.length + ') ===');
  allProducts.forEach(pr => console.log(`  ${pr.brand} | ${pr.model} | ${pr.name} | cat: ${pr.category}`));

  const maps = await p.brandMapping.findMany({ select: { name: true }, distinct: ['name'] });
  console.log('\n=== BRAND MAPPINGS ===');
  maps.forEach(m => console.log(m.name));
  
  await p['$disconnect']();
}
main();
