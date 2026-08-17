import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/sync_engine.dart';
import '../theme/glassmorphism.dart';
import 'settings_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final AuthService _authService = AuthService();
  final SyncEngine _syncEngine = SyncEngine();
  bool _isLoading = false;

  void _login() async {
    setState(() => _isLoading = true);
    try {
      final success = await _authService.login(
        _emailController.text.trim(),
        _passwordController.text,
      );
      if (success != null) {
        await _syncEngine.syncAll();
      }
      setState(() => _isLoading = false);

      if (success != null) {
        if (!mounted) return;
        final role = success.role.toLowerCase();
        if (role == 'admin' || role == 'management' || role == 'bdm') {
          Navigator.pushReplacementNamed(context, '/exec_dashboard');
        } else {
          Navigator.pushReplacementNamed(context, '/dashboard');
        }
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceAll('Exception: ', ''))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [],
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo placeholder
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0047B3).withOpacity(0.2),
                      blurRadius: 30,
                      spreadRadius: -10,
                    )
                  ]
                ),
                child: ClipOval(child: Image.asset('assets/logo.png', fit: BoxFit.cover)),
              ),
              const SizedBox(height: 32),
              const Text(
                'Advance Telecom',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A),
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Field Survey System',
                style: TextStyle(fontSize: 16, color: Color(0xFF0047B3)),
              ),
              const SizedBox(height: 48),

              GlassContainer(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: Text('Sign In', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    ),
                    const SizedBox(height: 24),
                    GlassTextField(
                      controller: _emailController,
                      hintText: 'Email Address',
                      prefixIcon: Icons.email,
                    ),
                    const SizedBox(height: 16),
                    GlassTextField(
                      controller: _passwordController,
                      hintText: 'Password',
                      prefixIcon: Icons.lock,
                      obscureText: true,
                    ),
                    const SizedBox(height: 32),
                    SizedBox(
                      width: double.infinity,
                      child: GlassButton(
                        text: 'LOGIN',
                        onPressed: _login,
                        isLoading: _isLoading,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
