import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class AnalyticsService {
  final AuthService _authService = AuthService();

  Future<Map<String, String>> _getHeaders() async {
    final token = await _authService.getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<String> _getBaseUrl() async {
    // getBaseUrl() returns '$url/auth', we need to strip '/auth'
    final authUrl = await _authService.getBaseUrl();
    return authUrl.replaceAll('/auth', '/analytics');
  }

  Future<Map<String, dynamic>> fetchDashboardStats() async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/dashboard'), headers: headers).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data['data'];
        }
      }
      return {};
    } catch (e) {
      print('Error fetching dashboard stats: $e');
      return {};
    }
  }

  Future<Map<String, dynamic>> fetchDashboardCharts() async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('$baseUrl/dashboard/charts'), headers: headers).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data['data'];
        }
      }
      return {};
    } catch (e) {
      print('Error fetching dashboard charts: $e');
      return {};
    }
  }

  Future<List<dynamic>> fetchReportData(String reportType, Map<String, String> filters) async {
    try {
      final baseUrl = await _getBaseUrl();
      final headers = await _getHeaders();
      
      final queryParams = Uri(queryParameters: filters).query;
      final response = await http.get(Uri.parse('$baseUrl/reports/$reportType?$queryParams'), headers: headers).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          return data['data'];
        }
      }
      return [];
    } catch (e) {
      print('Error fetching report data: $e');
      return [];
    }
  }
}
