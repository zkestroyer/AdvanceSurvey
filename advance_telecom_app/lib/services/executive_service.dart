import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/executive_models.dart';

class ExecutiveService {
  Future<String> _getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('apiBaseUrl') ?? 'https://demo.bloomix.io/atsolar/api/v1';
  }

  Future<Map<String, String>> _getHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('jwt_token_v2') ?? '';
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<DashboardSummary?> getDashboard() async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/executive/dashboard'), headers: headers);
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body)['data'];
        return DashboardSummary.fromJson(data);
      }
    } catch (e) {
      print('Error fetching executive dashboard: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> getDashboardCharts() async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/executive/dashboard/charts'), headers: headers);
      
      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      }
    } catch (e) {
      print('Error fetching executive charts: $e');
    }
    return null;
  }

  Future<List<dynamic>> getSurveys() async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/executive/surveys'), headers: headers);
      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      }
    } catch (e) {
      print('Error fetching surveys: $e');
    }
    return [];
  }

  Future<Map<String, dynamic>?> getSurveyDetail(int id) async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/executive/surveys/$id'), headers: headers);
      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      }
    } catch (e) {
      print('Error fetching survey detail: $e');
    }
    return null;
  }

  Future<List<dynamic>> getShops() async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/executive/shops'), headers: headers);
      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      }
    } catch (e) {
      print('Error fetching shops: $e');
    }
    return [];
  }

  Future<Map<String, dynamic>?> getShopDetail(int id) async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/executive/shops/$id'), headers: headers);
      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      }
    } catch (e) {
      print('Error fetching shop detail: $e');
    }
    return null;
  }

  Future<List<dynamic>> getUsers() async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/executive/users'), headers: headers);
      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      }
    } catch (e) {
      print('Error fetching users: $e');
    }
    return [];
  }

  Future<List<dynamic>> getTerritories() async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/executive/territories'), headers: headers);
      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      }
    } catch (e) {
      print('Error fetching territories: $e');
    }
    return [];
  }

  Future<List<dynamic>> getPrices() async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/executive/prices'), headers: headers);
      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      }
    } catch (e) {
      print('Error fetching prices: $e');
    }
    return [];
  }

  Future<List<dynamic>> getPriceHistory(int productId) async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/executive/prices/$productId/history'), headers: headers);
      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      }
    } catch (e) {
      print('Error fetching price history: $e');
    }
    return [];
  }

  Future<Map<String, dynamic>?> getComparison(Map<String, dynamic> query) async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse('$baseUrl/executive/comparison'),
        headers: headers,
        body: json.encode(query)
      );
      if (response.statusCode == 200) {
        return json.decode(response.body)['data'];
      }
    } catch (e) {
      print('Error fetching comparison: $e');
    }
    return null;
  }

  Future<List<ExecutiveNotification>> getNotifications() async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/executive/notifications'), headers: headers);
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body)['data'];
        return data.map((n) => ExecutiveNotification.fromJson(n)).toList();
      }
    } catch (e) {
      print('Error fetching notifications: $e');
    }
    return [];
  }

  Future<bool> markNotificationRead(int id) async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.put(Uri.parse('$baseUrl/executive/notifications/$id/read'), headers: headers);
      return response.statusCode == 200;
    } catch (e) {
      print('Error marking notification read: $e');
    }
    return false;
  }
}
