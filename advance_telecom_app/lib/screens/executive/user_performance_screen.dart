import 'package:flutter/material.dart';
import '../../services/executive_service.dart';

class UserPerformanceScreen extends StatefulWidget {
  const UserPerformanceScreen({Key? key}) : super(key: key);

  @override
  _UserPerformanceScreenState createState() => _UserPerformanceScreenState();
}

class _UserPerformanceScreenState extends State<UserPerformanceScreen> {
  final ExecutiveService _service = ExecutiveService();
  List<dynamic> _users = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final users = await _service.getUsers();
    setState(() {
      _users = users;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('User Performance')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _users.length,
              itemBuilder: (context, index) {
                final user = _users[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    title: Text(user['name'] ?? 'Unknown User'),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Territory: ${user['territory']}'),
                        Text('Total Surveys: ${user['totalSurveys']}'),
                        Text('Shops Added: ${user['shopsAdded']}'),
                        Text('Status: ${user['status']}'),
                      ],
                    ),
                    trailing: const Icon(Icons.person_outline),
                  ),
                );
              },
            ),
    );
  }
}
