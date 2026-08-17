import 'package:flutter/material.dart';
import '../../services/executive_service.dart';

class TerritoryPerformanceScreen extends StatefulWidget {
  const TerritoryPerformanceScreen({Key? key}) : super(key: key);

  @override
  _TerritoryPerformanceScreenState createState() => _TerritoryPerformanceScreenState();
}

class _TerritoryPerformanceScreenState extends State<TerritoryPerformanceScreen> {
  final ExecutiveService _service = ExecutiveService();
  List<dynamic> _territories = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final territories = await _service.getTerritories();
    setState(() {
      _territories = territories;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Territory Performance')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _territories.length,
              itemBuilder: (context, index) {
                final territory = _territories[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    title: Text(territory['name'] ?? 'Unknown Territory'),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Shops Count: ${territory['shopCount']}'),
                        Text('Surveys Count: ${territory['surveyCount']}'),
                      ],
                    ),
                    trailing: const Icon(Icons.map),
                  ),
                );
              },
            ),
    );
  }
}
