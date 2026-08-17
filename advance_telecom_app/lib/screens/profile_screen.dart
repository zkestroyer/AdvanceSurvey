import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../models/user.dart';
import '../theme/glassmorphism.dart';
import 'settings_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final AuthService _authService = AuthService();
  User? _currentUser;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final user = await _authService.getCurrentUser();
    setState(() {
      _currentUser = user;
    });
  }

  void _logout() async {
    await _authService.logout();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircleAvatar(
                radius: 50,
                backgroundColor: Colors.cyan,
                child: Icon(Icons.person, size: 50, color: Colors.white),
              ),
              const SizedBox(height: 20),
              Text(
                _currentUser?.name ?? 'Unknown',
                style: const TextStyle(color: Color(0xFF0F172A), fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                _currentUser?.email ?? 'Unknown',
                style: const TextStyle(color: Color(0xFF475569), fontSize: 16),
              ),
              const SizedBox(height: 8),
              Text(
                'Role: ${_currentUser?.role ?? 'N/A'}',
                style: const TextStyle(color: Color(0xFF475569), fontSize: 16),
              ),
              const SizedBox(height: 8),
              Text(
                'Territory: ${_currentUser?.territory ?? 'N/A'}',
                style: const TextStyle(color: Color(0xFF475569), fontSize: 16),
              ),
              const SizedBox(height: 40),
              GlassButton(
                text: 'Troubleshooting & Support',
                icon: Icons.support_agent,
                onPressed: () {
                  Navigator.pushNamed(context, '/troubleshooting');
                },
              ),
              const SizedBox(height: 16),
              GlassButton(
                text: 'Settings',
                icon: Icons.settings,
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => const SettingsScreen()));
                },
              ),
              const SizedBox(height: 16),
              GlassButton(
                text: 'Logout',
                onPressed: _logout,
                backgroundColor: Colors.redAccent,
              )
            ],
          ),
        ),
      ),
    );
  }
}
