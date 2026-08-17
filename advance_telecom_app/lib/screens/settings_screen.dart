import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../theme/glassmorphism.dart';
import '../services/auth_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({Key? key}) : super(key: key);

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final TextEditingController _oldPasswordController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  bool _isLoading = false;
  final AuthService _authService = AuthService();

  Future<void> _changePassword() async {
    final oldPassword = _oldPasswordController.text.trim();
    final newPassword = _newPasswordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    if (oldPassword.isEmpty || newPassword.isEmpty || confirmPassword.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields', style: TextStyle(color: Colors.white)), backgroundColor: Colors.red));
      return;
    }

    if (newPassword != confirmPassword) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('New passwords do not match', style: TextStyle(color: Colors.white)), backgroundColor: Colors.red));
      return;
    }

    setState(() => _isLoading = true);

    try {
      final user = await _authService.getCurrentUser();
      if (user == null) {
        throw Exception("You must be logged in to change your password.");
      }

      final baseUrl = await _authService.getBaseUrl();
      final response = await http.post(
        Uri.parse('$baseUrl/change-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': user.id,
          'oldPassword': oldPassword,
          'newPassword': newPassword,
        }),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Password changed successfully!', style: TextStyle(color: Colors.white)), backgroundColor: Colors.green));
        Navigator.pop(context);
      } else {
        throw Exception(data['message'] ?? 'Failed to change password');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString().replaceAll('Exception: ', ''), style: const TextStyle(color: Colors.white)), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Settings', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0047B3),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Change Password', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            const SizedBox(height: 8),
            const Text('Update your account password securely.', style: TextStyle(color: Color(0xFF475569))),
            const SizedBox(height: 24),
            
            const Text('Current Password', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            const SizedBox(height: 8),
            GlassTextField(
              controller: _oldPasswordController,
              hintText: 'Enter current password',
              prefixIcon: Icons.lock_outline,
              obscureText: true,
            ),
            const SizedBox(height: 16),
            
            const Text('New Password', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            const SizedBox(height: 8),
            GlassTextField(
              controller: _newPasswordController,
              hintText: 'Enter new password',
              prefixIcon: Icons.lock,
              obscureText: true,
            ),
            const SizedBox(height: 16),

            const Text('Confirm New Password', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
            const SizedBox(height: 8),
            GlassTextField(
              controller: _confirmPasswordController,
              hintText: 'Confirm new password',
              prefixIcon: Icons.lock,
              obscureText: true,
            ),
            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF0047B3)))
                : GlassButton(
                    text: 'Change Password',
                    onPressed: _changePassword,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}
