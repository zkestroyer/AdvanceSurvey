import 'package:flutter/material.dart';
import 'dart:async';
import '../services/auth_service.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  final AuthService _authService = AuthService();

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );

    _animationController.forward();

    _navigateToNextScreen();
  }

  Future<void> _navigateToNextScreen() async {
    // 1. Wait for 2.5 seconds to show the splash screen
    await Future.delayed(const Duration(milliseconds: 2500));

    // 2. Check if user is already logged in
    final token = await _authService.getToken();

    if (!mounted) return;

    if (token != null) {
      final user = await _authService.getCurrentUser();
      if (user != null) {
        final role = user.role.toLowerCase();
        if (role == 'admin' || role == 'management' || role == 'bdm') {
          Navigator.pushReplacementNamed(context, '/exec_dashboard');
        } else {
          Navigator.pushReplacementNamed(context, '/dashboard');
        }
      }
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0047B3), // Primary Blue
      body: Center(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo
              Container(
                width: 150,
                height: 150,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Image.asset(
                    'assets/advance_telecom_logo.png',
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) => const Icon(
                      Icons.solar_power,
                      size: 80,
                      color: Color(0xFF0047B3),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 32),
              
              // Brand Text
              const Text(
                'Advance Telecom',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Survey System',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.8),
                  fontSize: 16,
                  letterSpacing: 2.0,
                ),
              ),
              
              const SizedBox(height: 64),
              
              // Loading Indicator
              const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                strokeWidth: 3,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
