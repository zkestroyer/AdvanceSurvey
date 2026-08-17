import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';

class AuthService {
  Future<String> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    String url = prefs.getString('apiBaseUrl') ?? 'https://demo.bloomix.io/atsolar/api/v1';
    return '$url/auth';
  }

  Future<User?> login(String email, String password) async {
    try {
      final baseUrl = await getBaseUrl();
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          final String token = data['data']['token'];
          final User user = User.fromJson(data['data']['user']);

          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('jwt_token_v2', token);
          await prefs.setString('user_data_v2', jsonEncode(user.toJson()));
          await prefs.setInt('login_time_v2', DateTime.now().millisecondsSinceEpoch);

          return user;
        } else {
          throw Exception(data['message'] ?? 'Invalid credentials.');
        }
      } else {
        throw Exception('Server error: ${response.statusCode}');
      }
    } catch (e) {
      print('Login error: $e');
      if (e.toString().contains('TimeoutException')) {
        throw Exception('Connection timed out. Server unreachable.');
      } else if (e.toString().contains('SocketException') || e.toString().contains('Failed host lookup')) {
        throw Exception('Could not connect to the server.');
      }
      rethrow;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('jwt_token_v2');
    await prefs.remove('user_data_v2');
    await prefs.remove('login_time_v2');
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    final loginTime = prefs.getInt('login_time_v2');
    
    // 12 hours expiry
    if (loginTime != null) {
      final now = DateTime.now().millisecondsSinceEpoch;
      if (now - loginTime > 12 * 60 * 60 * 1000) {
        await logout();
        return null;
      }
    }
    
    return prefs.getString('jwt_token_v2');
  }

  Future<User?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data_v2');
    if (userData != null) {
      return User.fromJson(jsonDecode(userData));
    }
    return null;
  }
}
