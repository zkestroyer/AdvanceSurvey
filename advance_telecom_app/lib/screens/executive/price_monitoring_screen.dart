import 'package:flutter/material.dart';
import '../../services/executive_service.dart';
import 'price_history_screen.dart';

class PriceMonitoringScreen extends StatefulWidget {
  const PriceMonitoringScreen({Key? key}) : super(key: key);

  @override
  _PriceMonitoringScreenState createState() => _PriceMonitoringScreenState();
}

class _PriceMonitoringScreenState extends State<PriceMonitoringScreen> {
  final ExecutiveService _service = ExecutiveService();
  List<dynamic> _prices = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final prices = await _service.getPrices();
    setState(() {
      _prices = prices;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Price Monitoring')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _prices.length,
              itemBuilder: (context, index) {
                final item = _prices[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    title: Text(item['name'] ?? 'Unknown Product'),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Category: ${item['category']} - Brand: ${item['brand']}'),
                        Text('Purchase: ${item['purchasePrice']}'),
                        Text('Selling: ${item['sellingPrice']}'),
                      ],
                    ),
                    trailing: const Icon(Icons.history),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => PriceHistoryScreen(productId: item['id']),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
    );
  }
}
