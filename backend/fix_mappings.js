const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Merge duplicate Fox ESS brands ===\n');
  
  // Find all Fox ESS variant brands
  const allBrands = await prisma.productBrand.findMany({ select: { id: true, name: true } });
  const foxVariants = allBrands.filter(b => b.name.trim().toLowerCase().replace(/\s+/g, '') === 'foxess');
  console.log('Fox ESS variants found:', foxVariants.map(b => `${b.id}: "${b.name}"`).join(', '));
  
  if (foxVariants.length <= 1) {
    console.log('No duplicates to merge.');
    await prisma['$disconnect']();
    return;
  }
  
  // Pick the canonical one (the one named "Fox ESS" or first one)
  const canonical = foxVariants.find(b => b.name === 'Fox ESS') || foxVariants[0];
  const dupes = foxVariants.filter(b => b.id !== canonical.id);
  
  console.log('Canonical brand:', canonical.id, canonical.name);
  console.log('Duplicates to merge:', dupes.map(b => `${b.id}: "${b.name}"`).join(', '));
  
  // Move all productMappings from dupe brands to canonical
  for (const dupe of dupes) {
    const mappings = await prisma.productMapping.findMany({ where: { brandId: dupe.id } });
    console.log(`\n  Brand "${dupe.name}" (${dupe.id}) has ${mappings.length} product mappings`);
    
    for (const m of mappings) {
      // Check if canonical already has this product mapping
      const existing = await prisma.productMapping.findFirst({
        where: { brandId: canonical.id, productId: m.productId }
      });
      if (existing) {
        console.log(`    Mapping to product ${m.productId} already exists in canonical, deleting dupe`);
        await prisma.productMapping.delete({ where: { id: m.id } });
      } else {
        console.log(`    Moving mapping to product ${m.productId} to canonical brand`);
        await prisma.productMapping.update({ where: { id: m.id }, data: { brandId: canonical.id } });
      }
    }
    
    // Now delete the duplicate brand
    try {
      await prisma.productBrand.delete({ where: { id: dupe.id } });
      console.log(`  Deleted duplicate brand "${dupe.name}" (${dupe.id})`);
    } catch (e) {
      console.log(`  Could not delete brand ${dupe.id}: ${e.message}`);
    }
  }
  
  console.log('\n=== Done ===');
  await prisma['$disconnect']();
}

main().catch(e => { console.error(e); process.exit(1); });
