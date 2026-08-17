import 'package:flutter/material.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/executive/executive_shell.dart';
import 'screens/analytics_reports_screen.dart';
import 'screens/troubleshooting_screen.dart';
import 'screens/troubleshoot_log_screen.dart';

void main() {
  runApp(const atsolarApp());
}

class atsolarApp extends StatelessWidget {
  const atsolarApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Advance Telecom TSO',
      theme: ThemeData(
        brightness: Brightness.light,
        primaryColor: const Color(0xFF0047B3),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0047B3)),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        fontFamily: 'Outfit',
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0047B3),
          elevation: 0,
          centerTitle: true,
        ),
      ),
      initialRoute: '/splash',
      routes: {
        '/splash': (context) => const SplashScreen(),
        '/login': (context) => const LoginScreen(),
        '/dashboard': (context) => const DashboardScreen(),
        '/exec_dashboard': (context) => const ExecutiveShell(),
        '/analytics_reports': (context) => const AnalyticsReportsScreen(),
        '/troubleshooting': (context) => const TroubleshootingScreen(),
        '/troubleshoot_log': (context) => const TroubleshootLogScreen(),
      },
    );
  }
}
