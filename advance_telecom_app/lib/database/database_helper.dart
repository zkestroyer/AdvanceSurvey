import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  static Database? _database;
  static const _databaseVersion = 6;

  factory DatabaseHelper() => _instance;

  DatabaseHelper._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDb();
    return _database!;
  }

  Future<Database> _initDb() async {
    String path = join(await getDatabasesPath(), 'advance_telecom.db');
    return await openDatabase(
      path,
      version: _databaseVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      await db.execute('''
        CREATE TABLE completed_surveys(
          id INTEGER PRIMARY KEY,
          surveyId INTEGER,
          shopId INTEGER,
          shopName TEXT,
          surveyTitle TEXT,
          submittedAt TEXT,
          data TEXT
        )
      ''');
    }
    if (oldVersion < 3) {
      try {
        await db.execute('ALTER TABLE shops ADD COLUMN city TEXT');
        await db.execute('ALTER TABLE shops ADD COLUMN area TEXT');
        await db.execute('ALTER TABLE shops ADD COLUMN address TEXT');
      } catch (e) {
        print("Columns might already exist: $e");
      }
    }
    if (oldVersion < 4) {
      try {
        await db.execute('ALTER TABLE shops ADD COLUMN contactNo TEXT');
        await db.execute('ALTER TABLE shops ADD COLUMN type TEXT');
        await db.execute('ALTER TABLE shops ADD COLUMN classification TEXT');
      } catch (e) {
        print("Columns might already exist: $e");
      }
    }
    if (oldVersion < 5) {
      try {
        await db.execute('ALTER TABLE shops ADD COLUMN createdAt TEXT');
      } catch (e) {
        print("Columns might already exist: $e");
      }
    }
    if (oldVersion < 6) {
      try {
        await db.execute('''
          CREATE TABLE product_mappings(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brandName TEXT,
            productName TEXT
          )
        ''');
      } catch (e) {
        print("Table might already exist: $e");
      }
    }
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
        CREATE TABLE shops(
          id INTEGER PRIMARY KEY,
          name TEXT,
          ownerName TEXT,
          territoryId INTEGER,
          lat REAL,
          lng REAL,
          city TEXT,
          area TEXT,
          address TEXT,
          contactNo TEXT,
          type TEXT,
          classification TEXT,
          createdAt TEXT
        )
      ''');

    await db.execute('''
      CREATE TABLE products(
        id INTEGER PRIMARY KEY,
        name TEXT,
        category TEXT,
        price REAL,
        isActive INTEGER
      )
    ''');

    await db.execute('''
      CREATE TABLE surveys(
        id INTEGER PRIMARY KEY,
        title TEXT,
        schemaJson TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE pending_responses(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        surveyId INTEGER,
        shopId INTEGER,
        tsoId INTEGER,
        responseJson TEXT,
        checkinLat REAL,
        checkinLng REAL,
        timestamp TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE completed_surveys(
        id INTEGER PRIMARY KEY,
        surveyId INTEGER,
        shopId INTEGER,
        shopName TEXT,
        surveyTitle TEXT,
        submittedAt TEXT,
        data TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE product_mappings(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brandName TEXT,
        productName TEXT
      )
    ''');
  }

  // --- Helpers ---

  Future<void> clearAll() async {
    final db = await database;
    await db.delete('shops');
    await db.delete('products');
    await db.delete('surveys');
    await db.delete('pending_responses');
    await db.delete('product_mappings');
  }

  Future<void> insertMappings(List<dynamic> brandsData) async {
    final db = await database;
    await db.delete('product_mappings');
    Batch batch = db.batch();
    for (var brand in brandsData) {
      String brandName = brand['name'];
      if (brand['mappings'] != null) {
        for (var mapping in brand['mappings']) {
          batch.insert('product_mappings', {
            'brandName': brandName,
            'productName': mapping['productName']
          });
        }
      }
    }
    await batch.commit(noResult: true);
  }

  Future<List<String>> getBrands() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.rawQuery('SELECT DISTINCT brandName FROM product_mappings ORDER BY brandName');
    return maps.map((e) => e['brandName'] as String).toList();
  }

  Future<List<String>> getProductsForBrand(String brandName) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'product_mappings',
      columns: ['productName'],
      where: 'brandName LIKE ?',
      whereArgs: ['%$brandName%'],
      orderBy: 'productName'
    );
    // Remove brand prefix if exists to return just the model part, or return full.
    // The previous app code expected model names without brand prefix, but our backend stores full names.
    // Let's see what the app actually does in survey_execution_screen.dart
    return maps.map((e) => e['productName'] as String).toList();
  }

  Future<void> insertShops(List<dynamic> shopsData) async {
    final db = await database;
    Batch batch = db.batch();
    for (var shop in shopsData) {
      batch.insert('shops', {
        'id': shop['id'],
        'name': shop['name'],
        'ownerName': shop['ownerName'],
        'territoryId': shop['territoryId'],
        'lat': shop['latitude'] ?? shop['lat'],
        'lng': shop['longitude'] ?? shop['lng'],
        'city': shop['city'],
        'area': shop['area'],
        'address': shop['address'],
        'contactNo': shop['contactNo'],
        'type': shop['type'],
        'classification': shop['classification'],
        'createdAt': shop['createdAt']
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<void> insertSingleShop(Map<String, dynamic> shop) async {
    final db = await database;
    await db.insert('shops', {
      'id': shop['id'],
      'name': shop['name'],
      'ownerName': shop['ownerName'],
      'territoryId': shop['territoryId'],
      'lat': shop['latitude'] ?? shop['lat'],
      'lng': shop['longitude'] ?? shop['lng'],
      'city': shop['city'],
      'area': shop['area'],
      'address': shop['address'],
      'contactNo': shop['contactNo'],
      'type': shop['type'],
      'classification': shop['classification']
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> insertProducts(List<dynamic> productsData) async {
    final db = await database;
    Batch batch = db.batch();
    for (var prod in productsData) {
      batch.insert('products', {
        'id': prod['id'],
        'name': prod['name'],
        'category': prod['category'],
        'price': prod['price'],
        'isActive': prod['isActive'] == true ? 1 : 0
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<void> insertCompletedSurveys(List<dynamic> completedData) async {
    final db = await database;
    Batch batch = db.batch();
    // Removed batch.delete('completed_surveys') to preserve locally synced surveys
    for (var comp in completedData) {
      batch.insert('completed_surveys', {
        'id': comp['id'],
        'surveyId': comp['surveyId'],
        'shopId': comp['shopId'],
        'shopName': comp['shopName'],
        'surveyTitle': comp['surveyTitle'],
        'submittedAt': comp['submittedAt'],
        'data': comp['data'] != null ? jsonEncode(comp['data']) : null
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<void> insertSurveys(List<dynamic> surveysData) async {
    final db = await database;
    Batch batch = db.batch();
    batch.delete('surveys');
    for (var survey in surveysData) {
      batch.insert('surveys', {
        'id': survey['id'],
        'title': survey['title'],
        'schemaJson': survey['schemaJson']
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getShops() async {
    final db = await database;
    return await db.query('shops', orderBy: 'id DESC');
  }

  Future<List<Map<String, dynamic>>> getProducts() async {
    final db = await database;
    return await db.query('products');
  }

  Future<List<Map<String, dynamic>>> getSurveys() async {
    final db = await database;
    return await db.query('surveys');
  }

  Future<List<Map<String, dynamic>>> getCompletedSurveys() async {
    final db = await database;
    return await db.query('completed_surveys', orderBy: 'submittedAt DESC');
  }

  Future<void> insertPendingResponse(Map<String, dynamic> response) async {
    final db = await database;
    await db.insert('pending_responses', response);
  }

  Future<List<Map<String, dynamic>>> getPendingResponses() async {
    final db = await database;
    return await db.query('pending_responses');
  }

  Future<void> deletePendingResponse(int id) async {
    final db = await database;
    await db.delete('pending_responses', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> movePendingToHistory(Map<String, dynamic> pendingRow) async {
    final db = await database;
    
    String shopName = 'Unknown Shop';
    String surveyTitle = 'Survey';
    List<dynamic> formattedData = [];
    
    try {
      // Get shop name
      final shopRes = await db.query('shops', where: 'id = ?', whereArgs: [pendingRow['shopId']]);
      if (shopRes.isNotEmpty && shopRes.first['name'] != null) {
        shopName = shopRes.first['name'].toString();
      }

      // Get survey title and schema
      final surveyRes = await db.query('surveys', where: 'id = ?', whereArgs: [pendingRow['surveyId']]);
      if (surveyRes.isNotEmpty && surveyRes.first['title'] != null) {
        surveyTitle = surveyRes.first['title'].toString();
      }

      Map<String, Map<String, dynamic>> questionMetadata = {};
      if (surveyRes.isNotEmpty && surveyRes.first['schemaJson'] != null) {
        try {
          final schema = jsonDecode(surveyRes.first['schemaJson'].toString());
          final sections = schema['sections'] ?? [];
          for (var section in sections) {
             final secTitle = section['title'] ?? 'Responses';
             final qs = section['questions'] ?? [];
             for (var q in qs) {
                questionMetadata[q['id'].toString()] = {
                  'text': q['questionText'] ?? 'Q ${q['id']}',
                  'section': secTitle
                };
             }
          }
        } catch (e) {
          print('Error parsing survey schema: $e');
        }
      }

      // Construct a dummy data list so it doesn't crash the history screen
      final rawResponses = jsonDecode(pendingRow['responseJson'].toString());
      if (rawResponses is Map) {
        rawResponses.forEach((key, value) {
          if (key == 'photo_proofs') return; // Skip photos
          
          String lookupKey = key.toString();
          if (lookupKey.endsWith('_is_other')) return; // Skip internal UI flags
          
          final meta = questionMetadata[lookupKey] ?? {'text': 'Q $key', 'section': 'Responses'};
          
          formattedData.add({
            'questionId': key,
            'question': {
              'questionText': meta['text'],
              'section': {'title': meta['section']}
            },
            'value': value.toString()
          });
        });
      }
    } catch (e) {
      print('Error formatting local history data: $e');
    }

    try {
      final localId = -(DateTime.now().millisecondsSinceEpoch % 1000000);

      await db.insert('completed_surveys', {
        'id': localId,
        'surveyId': pendingRow['surveyId'],
        'shopId': pendingRow['shopId'],
        'shopName': shopName,
        'surveyTitle': surveyTitle,
        'submittedAt': pendingRow['timestamp'],
        'data': jsonEncode(formattedData)
      }, conflictAlgorithm: ConflictAlgorithm.replace);

      await deletePendingResponse(pendingRow['id'] as int);
    } catch (e) {
      print('Error inserting into completed_surveys: $e');
      // Do not delete pending response if it fails to insert into history!
      // This way it won't disappear completely.
    }
  }

  Future<void> deleteShop(int id) async {
    final db = await database;
    await db.delete('shops', where: 'id = ?', whereArgs: [id]);
  }
}
