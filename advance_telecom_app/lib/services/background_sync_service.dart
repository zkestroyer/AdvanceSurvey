import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../database/database_helper.dart';
import 'auth_service.dart';

class BackgroundSyncService {
  final DatabaseHelper _dbHelper = DatabaseHelper();
  final AuthService _authService = AuthService();
  
  Future<String> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('apiBaseUrl') ?? 'https://demo.bloomix.io/atsolar/api/v1';
  }

  Future<void> pushPendingData() async {
    final token = await _authService.getToken();
    if (token == null) return;
    final baseUrl = await getBaseUrl();

    final headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };

    final pendingResponses = await _dbHelper.getPendingResponses();
    if (pendingResponses.isEmpty) return;

    for (var responseRow in pendingResponses) {
      try {
        final surveyId = responseRow['surveyId'];
        final shopId = responseRow['shopId'];
        final responseData = jsonDecode(responseRow['responseJson']);
        final lat = responseRow['checkinLat'];
        final lng = responseRow['checkinLng'];

        // Push Checkin
        if (lat != null && lng != null) {
          await http.post(
            Uri.parse('$baseUrl/checkin'),
            headers: headers,
            body: jsonEncode({
              'lat': lat,
              'lng': lng,
              'shopId': shopId,
            }),
          );
        }

        // Push Survey Response
        final res = await http.post(
          Uri.parse('$baseUrl/surveys/submit'),
          headers: headers,
          body: jsonEncode({
            'surveyId': surveyId,
            'shopId': shopId,
            'responses': responseData,
          }),
        );

        if (res.statusCode == 200 || res.statusCode == 201) {
          final data = jsonDecode(res.body);
          if (data['success']) {
            // Success, remove from pending and move to local history
            await _dbHelper.movePendingToHistory(responseRow);
          } else {
             print('Server rejected survey: ${data['message']} - moving to history locally');
             await _dbHelper.movePendingToHistory(responseRow);
          }
        } else {
          print('Server error syncing survey: ${res.statusCode} - moving to history locally');
          await _dbHelper.movePendingToHistory(responseRow);
        }
      } catch (e) {
        print('Error pushing pending response: $e - moving to history locally');
        await _dbHelper.movePendingToHistory(responseRow);
      }
    }
  }
}
