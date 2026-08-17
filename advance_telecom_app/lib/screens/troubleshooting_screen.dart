import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import '../services/auth_service.dart';

class TroubleshootingScreen extends StatefulWidget {
  const TroubleshootingScreen({Key? key}) : super(key: key);

  @override
  State<TroubleshootingScreen> createState() => _TroubleshootingScreenState();
}

class _TroubleshootingScreenState extends State<TroubleshootingScreen> {
  final AuthService _authService = AuthService();
  bool _isSubmitting = false;
  final ImagePicker _picker = ImagePicker();

  Future<void> _reportIssue(String issueTitle) async {
    final TextEditingController descController = TextEditingController();
    File? attachedPhoto;
    
    bool? shouldSubmit = await showDialog<bool>(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Report Issue'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: descController,
                      decoration: const InputDecoration(labelText: 'Description (optional)'),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 10),
                    if (attachedPhoto != null)
                      Image.file(attachedPhoto!, height: 100),
                    TextButton.icon(
                      icon: const Icon(Icons.camera_alt),
                      label: const Text('Attach Photo'),
                      onPressed: () async {
                        final XFile? photo = await _picker.pickImage(source: ImageSource.camera, imageQuality: 50);
                        if (photo != null) {
                          setState(() { attachedPhoto = File(photo.path); });
                        }
                      },
                    )
                  ],
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Submit'))
              ],
            );
          }
        );
      }
    );

    if (shouldSubmit != true) return;

    setState(() => _isSubmitting = true);
    try {
      final authUrl = await _authService.getBaseUrl();
      final masterUrl = authUrl.replaceAll('/auth', '/master');
      final user = await _authService.getCurrentUser();
      final token = await _authService.getToken();
      
      String? photoBase64;
      if (attachedPhoto != null) {
        photoBase64 = base64Encode(await attachedPhoto!.readAsBytes());
      }

      final response = await http.post(
        Uri.parse('$masterUrl/tickets'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token'
        },
        body: jsonEncode({
          'subject': 'App Issue: $issueTitle',
          'message': descController.text.isNotEmpty ? descController.text : 'User reported facing this issue from the mobile app.',
          'photo': photoBase64,
          'name': user?.name ?? 'Unknown User',
          'email': user?.email ?? 'Unknown Email',
          'priority': 'High'
        })
      ).timeout(const Duration(seconds: 15));

      if (!mounted) return;
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Issue reported to backend team successfully!'), backgroundColor: Colors.green)
        );
      } else {
        throw Exception('Failed to report issue');
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error reporting issue: $e'), backgroundColor: Colors.red)
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Widget _buildIssueCard(String title, List<String> instructions, IconData icon) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ExpansionTile(
        leading: Icon(icon, color: const Color(0xFF0047B3)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Try these steps first:', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                ...instructions.map((step) => Padding(
                  padding: const EdgeInsets.only(bottom: 6.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('• ', style: TextStyle(fontWeight: FontWeight.bold)),
                      Expanded(child: Text(step, style: const TextStyle(color: Color(0xFF475569)))),
                    ],
                  ),
                )),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.redAccent,
                      side: const BorderSide(color: Colors.redAccent),
                      padding: const EdgeInsets.symmetric(vertical: 12)
                    ),
                    icon: const Icon(Icons.report_problem),
                    label: const Text('Still facing issues? Report to Backend'),
                    onPressed: _isSubmitting ? null : () => _reportIssue(title),
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Troubleshooting', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0047B3),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            tooltip: 'My Trouble Log',
            onPressed: () {
              Navigator.pushNamed(context, '/troubleshoot_log');
            },
          )
        ],
      ),
      body: _isSubmitting 
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.only(top: 16, bottom: 40),
            children: [
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: Text('Common Issues', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              ),
              _buildIssueCard(
                'GPS Not Working',
                ['Enable Location Services in your phone settings.', 'Restart your GPS / Location toggle.'],
                Icons.gps_off
              ),
              _buildIssueCard(
                'Cannot Sync Data',
                ['Check your internet connection.', 'Tap the massive "Sync All Data to Server" button on your dashboard.'],
                Icons.sync_problem
              ),
              _buildIssueCard(
                'Login Issue',
                ['Verify your User ID and Password are correct.', 'Contact your Administrator if you are locked out.'],
                Icons.login
              ),
              const SizedBox(height: 24),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0047B3),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.history, size: 24),
                  label: const Text('View My Troubleshoot Log', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  onPressed: () {
                    Navigator.pushNamed(context, '/troubleshoot_log');
                  },
                ),
              ),
            ],
          ),
    );
  }
}
