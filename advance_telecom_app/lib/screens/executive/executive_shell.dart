import 'package:flutter/material.dart';
import '../profile_screen.dart';
// Placeholders for future screens
import 'exec_dashboard_v2.dart';
import 'survey_reports_screen.dart';
import 'comparison_reports_screen.dart';
import 'notifications_screen.dart';

class ExecutiveShell extends StatefulWidget {
  const ExecutiveShell({Key? key}) : super(key: key);

  @override
  _ExecutiveShellState createState() => _ExecutiveShellState();
}

class _ExecutiveShellState extends State<ExecutiveShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const ExecDashboardV2(), // ExecDashboardV2
    const SurveyReportsScreen(), // SurveyReportsScreen
    const ComparisonReportsScreen(), // ComparisonReportsScreen
    const NotificationsScreen(), // NotificationsScreen
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).primaryColor,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.analytics),
            label: 'Reports',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.compare_arrows),
            label: 'Comparison',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.notifications),
            label: 'Alerts',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
