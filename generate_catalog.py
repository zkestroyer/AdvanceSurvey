import json

lines = [line.strip() for line in open('catalog_dump.txt').read().splitlines() if line.strip()]

catalog = {
    'solar_panels': {},
    'inverters': {},
    'lithium_batteries': {},
    'all_in_one_ess': {},
    'c_and_i_ess': {}
}

current_category = None
current_brand = None

def get_category(line):
    line_upper = line.upper()
    if 'SOLAR PANELS' in line_upper: return 'solar_panels'
    if line_upper == 'INVERTER': return 'inverters'
    if 'LITHIUM BATTERIES' in line_upper: return 'lithium_batteries'
    if line_upper == 'ALL IN ONE ESS': return 'all_in_one_ess'
    if 'C&I ESS' in line_upper: return 'c_and_i_ess'
    return None

known_brands = [
    "Longi", "Canadian", "JA Solar", "Jinko", "Trina",
    "Itel Energy", "Fronus", "Solax", "Ziewnic", "Inverex", "Solis", "Goodwe", "Knox", "ASW", "XEROX", "Fox Ess", "Sungrow", "Huawei", "Crown",
    "Dyness", "Soluna", "Pylontech", "FoxEss", "Fronus/Solax", "Luminay/Sunwooda", "Coretech/Sunwooda", "Sunwooda", "INVT", "EVE", "Dongjin", "Narada", "Nova",
    "Livoltek", "Vaults PowerOX", "Fox ESS", "SAJ"
]

for line in lines:
    if line == 'Survey App changes points': continue
    if line.startswith('Note:'): break
    
    cat = get_category(line)
    if cat:
        current_category = cat
        current_brand = None
        continue
        
    if current_category:
        # Check if this line is a brand
        is_brand = False
        if line in known_brands:
            is_brand = True
        elif line == "ASW 5000-T": # Handle ASW manually because of formatting
            current_brand = "ASW"
            catalog[current_category][current_brand] = [line]
            continue
        elif line == "XEROX G4 10KW":
            current_brand = "XEROX"
            catalog[current_category][current_brand] = [line]
            continue
            
        if is_brand:
            current_brand = line
            if current_brand not in catalog[current_category]:
                catalog[current_category][current_brand] = []
        else:
            if current_brand:
                # Append model
                catalog[current_category][current_brand].append(line)

print("const Map<String, Map<String, List<String>>> productCatalog = {")
for cat, brands in catalog.items():
    print(f"  '{cat}': {{")
    for brand, models in brands.items():
        models_str = ", ".join([f"'{m}'" for m in models])
        print(f"    '{brand}': [{models_str}],")
    print("  },")
print("};")
