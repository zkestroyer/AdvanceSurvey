import 'package:flutter/material.dart';
import '../../services/executive_service.dart';

class PriceHistoryScreen extends StatefulWidget {
  final int productId;
  const PriceHistoryScreen({Key? key, required this.productId}) : super(key: key);

  @override
  _PriceHistoryScreenState createState() => _PriceHistoryScreenState();
}

class _PriceHistoryScreenState extends State<PriceHistoryScreen> {
  final ExecutiveService _service = ExecutiveService();
  List<dynamic> _history = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final history = await _service.getPriceHistory(widget.productId);
    setState(() {
      _history = history;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Price History')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _history.isEmpty
              ? const Center(child: Text('No history found'))
              : ListView.builder(
                  itemCount: _history.length,
                  itemBuilder: (context, index) {
                    final record = _history[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: ListTile(
                        title: Text('Date: ${record['updatedAt']?.split('T')[0]}'),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Old Price: ${record['oldPrice']}'),
                            Text('New Price: ${record['newPrice']}'),
                          ],
                        ),
                        trailing: const Icon(Icons.trending_up),
                      ),
                    );
                  },
                ),
    );
  }
}
