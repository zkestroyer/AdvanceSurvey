// One-time script to normalize duplicate brand names in the database
// Run on the server: node normalize_brands.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Brand normalization map: lowercase key -> canonical name
const BRAND_NORMALIZE = {
  'fox ess': 'Fox ESS',
  'foxess': 'Fox ESS',
  'fox-ess': 'Fox ESS',
  'fronus/solax': 'Fronus/Solax',
  'fronus / solax': 'Fronus/Solax',
  'luminay/sunwooda': 'Luminay/Sunwooda',
  'coretech/sunwooda': 'Coretech/Sunwooda',
};

async function main() {
  console.log('=== Brand Normalization Script ===\n');
  
  // 1. Get all products with brands
  const products = await prisma.product.findMany({ select: { id: true, brand: true } });
  console.log(`Found ${products.length} products\n`);
  
  let updateCount = 0;
  for (const p of products) {
    if (!p.brand) continue;
    const key = p.brand.trim().toLowerCase();
    if (BRAND_NORMALIZE[key] && p.brand.trim() !== BRAND_NORMALIZE[key]) {
      console.log(`  Product ${p.id}: "${p.brand}" -> "${BRAND_NORMALIZE[key]}"`);
      await prisma.product.update({ where: { id: p.id }, data: { brand: BRAND_NORMALIZE[key] } });
      updateCount++;
    }
  }
  console.log(`\nUpdated ${updateCount} products\n`);
  
  // 2. Normalize BrandMapping names too
  const mappings = await prisma.brandMapping.findMany({ select: { id: true, name: true } });
  let mapCount = 0;
  for (const m of mappings) {
    if (!m.name) continue;
    const key = m.name.trim().toLowerCase();
    if (BRAND_NORMALIZE[key] && m.name.trim() !== BRAND_NORMALIZE[key]) {
      console.log(`  Mapping ${m.id}: "${m.name}" -> "${BRAND_NORMALIZE[key]}"`);
      await prisma.brandMapping.update({ where: { id: m.id }, data: { name: BRAND_NORMALIZE[key] } });
      mapCount++;
    }
  }
  console.log(`Updated ${mapCount} brand mappings\n`);
  
  console.log('=== Done ===');
  await prisma['$disconnect']();
}

main().catch(e => { console.error(e); process.exit(1); });
