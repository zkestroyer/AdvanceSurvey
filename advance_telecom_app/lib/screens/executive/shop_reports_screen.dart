import 'package:flutter/material.dart';
import '../../services/executive_service.dart';
// Note: reusing the existing ShopDetailsScreen which would need a read-only parameter,
// for now, we'll just show the list.
// import '../shop_details_screen.dart';

class ShopReportsScreen extends StatefulWidget {
  const ShopReportsScreen({Key? key}) : super(key: key);

  @override
  _ShopReportsScreenState createState() => _ShopReportsScreenState();
}

class _ShopReportsScreenState extends State<ShopReportsScreen> {
  final ExecutiveService _service = ExecutiveService();
  List<dynamic> _shops = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final shops = await _service.getShops();
    setState(() {
      _shops = shops;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Shop Reports')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: _shops.length,
              itemBuilder: (context, index) {
                final shop = _shops[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    title: Text(shop['name'] ?? 'Unknown Shop'),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Location: ${shop['city']} - ${shop['territory']}'),
                        Text('Distributor: ${shop['distributor']}'),
                        Text('Total Surveys: ${shop['totalSurveys']}'),
                      ],
                    ),
                    trailing: const Icon(Icons.store),
                  ),
                );
              },
            ),
    );
  }
}
