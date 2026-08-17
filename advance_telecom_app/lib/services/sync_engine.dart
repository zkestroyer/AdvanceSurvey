import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../database/database_helper.dart';
import 'auth_service.dart';
import 'background_sync_service.dart';

class SyncEngine {
  final AuthService _authService = AuthService();
  final DatabaseHelper _dbHelper = DatabaseHelper();
  
  Future<String> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('apiBaseUrl') ?? 'https://demo.bloomix.io/atsolar/api/v1';
  }

  Future<bool> syncAll() async {
    try {
      final token = await _authService.getToken();
      if (token == null) return false;
      final baseUrl = await getBaseUrl();

      final headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };

      // 0. Push any pending surveys FIRST
      final bgSync = BackgroundSyncService();
      await bgSync.pushPendingData();

      // 1. Fetch Shops
      final shopsRes = await http.get(Uri.parse('$baseUrl/master/shops'), headers: headers);
      if (shopsRes.statusCode == 200) {
        final data = jsonDecode(shopsRes.body);
        if (data['success']) {
          await _dbHelper.insertShops(data['data']);
        }
      }

      // 2. Fetch Products
      final productsRes = await http.get(Uri.parse('$baseUrl/master/products'), headers: headers);
      if (productsRes.statusCode == 200) {
        final data = jsonDecode(productsRes.body);
        if (data['success']) {
          await _dbHelper.insertProducts(data['data']);
        }
      }

      // 2.5 Fetch Mappings
      final mappingsRes = await http.get(Uri.parse('$baseUrl/master/mappings/brands'), headers: headers);
      if (mappingsRes.statusCode == 200) {
        final data = jsonDecode(mappingsRes.body);
        if (data['success']) {
          await _dbHelper.insertMappings(data['data']);
        }
      }

      // 3. Fetch Active Surveys
      final surveysRes = await http.get(Uri.parse('$baseUrl/surveys/active'), headers: headers);
      if (surveysRes.statusCode == 200) {
        final data = jsonDecode(surveysRes.body);
        if (data['success'] && data['data'] != null) {
          final dynamic surveysData = data['data'];
          dynamic survey;
          if (surveysData is List && surveysData.isNotEmpty) {
            survey = surveysData.first;
          } else if (surveysData is Map) {
            survey = surveysData;
          }
          
          if (survey != null) {
            final surveysToInsert = [{
              'id': survey['id'],
              'title': survey['title'],
              'schemaJson': jsonEncode(survey) // Save entire object as JSON
            }];
            await _dbHelper.insertSurveys(surveysToInsert);
          }
        }
      }

      // 4. Fetch History
      final historyRes = await http.get(Uri.parse('$baseUrl/surveys/my-history'), headers: headers);
      if (historyRes.statusCode == 200) {
        final data = jsonDecode(historyRes.body);
        if (data['success']) {
          await _dbHelper.insertCompletedSurveys(data['data']);
        }
      }

      return true;
    } catch (e) {
      print('Sync Error: $e');
      return false;
    }
  }
}
