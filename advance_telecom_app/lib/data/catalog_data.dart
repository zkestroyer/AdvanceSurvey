Map<String, Map<String, List<String>>> productCatalog = {};

List<String>? getModelsForBrand(String selectedBrand, String sectionTitle) {
  final brandQuery = selectedBrand.toLowerCase().trim();
  final sectionQuery = sectionTitle.toLowerCase().trim();
  
  Map<String, List<String>>? categoryMap;
  if (sectionQuery.contains('solar')) {
    categoryMap = productCatalog['solar_panels'];
  } else if (sectionQuery.contains('inverter')) {
    categoryMap = productCatalog['inverters'];
  } else if (sectionQuery.contains('lithium') || sectionQuery.contains('batter')) {
    categoryMap = productCatalog['lithium_batteries'];
  } else if (sectionQuery.contains('all in one') || sectionQuery.contains('all-in-one') || sectionQuery == 'all-in-one ess') {
    categoryMap = productCatalog['all_in_one_ess'];
  } else if (sectionQuery.contains('c&i')) {
    categoryMap = productCatalog['c_and_i_ess'];
  }

  if (categoryMap != null) {
    for (final entry in categoryMap.entries) {
      if (entry.key.toLowerCase() == brandQuery || entry.key.toLowerCase().contains(brandQuery) || brandQuery.contains(entry.key.toLowerCase())) {
        return List<String>.from(entry.value);
      }
    }
  }
  return null;
}

List<String>? getBrandsForSection(String sectionTitle) {
  final sectionQuery = sectionTitle.toLowerCase().trim();
  
  Map<String, List<String>>? categoryMap;
  if (sectionQuery.contains('solar')) {
    categoryMap = productCatalog['solar_panels'];
  } else if (sectionQuery.contains('inverter')) {
    categoryMap = productCatalog['inverters'];
  } else if (sectionQuery.contains('lithium') || sectionQuery.contains('batter')) {
    categoryMap = productCatalog['lithium_batteries'];
  } else if (sectionQuery.contains('all in one') || sectionQuery.contains('all-in-one') || sectionQuery == 'all-in-one ess') {
    categoryMap = productCatalog['all_in_one_ess'];
  } else if (sectionQuery.contains('c&i')) {
    categoryMap = productCatalog['c_and_i_ess'];
  }

  if (categoryMap != null) {
    return categoryMap.keys.toList();
  }
  return null;
}

Future<void> loadCatalogFromDb(dynamic dbHelper) async {
  productCatalog.clear();
  productCatalog['solar_panels'] = {};
  productCatalog['inverters'] = {};
  productCatalog['lithium_batteries'] = {};
  productCatalog['all_in_one_ess'] = {};
  productCatalog['c_and_i_ess'] = {};

  final brands = await dbHelper.getBrands();
  for (String brand in brands) {
    final products = await dbHelper.getProductsForBrand(brand);
    // Put them in solar_panels by default, or you can categorize them if the backend has categories linked in productMappings
    // For now, let's just populate all categories with the brands so they show up everywhere,
    // or if the app's backend maps them specifically, we would use that.
    // Assuming backend returns all products for a brand without category distinction in productMappings,
    // we just put the brand in all categories in the catalog so getModelsForBrand can find it.
    for (String category in productCatalog.keys) {
      productCatalog[category]![brand] = products;
    }
  }
}
