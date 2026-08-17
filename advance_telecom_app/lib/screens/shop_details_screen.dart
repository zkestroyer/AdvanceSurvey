import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'dart:convert';
import '../database/database_helper.dart';
import 'survey_execution_screen.dart';

class ShopDetailsScreen extends StatefulWidget {
  final Map<String, dynamic> shop;
  const ShopDetailsScreen({Key? key, required this.shop}) : super(key: key);

  @override
  State<ShopDetailsScreen> createState() => _ShopDetailsScreenState();
}

class _ShopDetailsScreenState extends State<ShopDetailsScreen> {
  final DatabaseHelper _dbHelper = DatabaseHelper();
  List<Map<String, dynamic>> _shopHistory = [];
  bool _isLoadingHistory = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    final allCompleted = await _dbHelper.getCompletedSurveys();
    setState(() {
      _shopHistory = allCompleted.where((s) => s['shopId'].toString() == widget.shop['id'].toString()).toList();
      _isLoadingHistory = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final latStr = widget.shop['latitude']?.toString();
    final lngStr = widget.shop['longitude']?.toString();
    final double lat = double.tryParse(latStr ?? '') ?? 24.8607;
    final double lng = double.tryParse(lngStr ?? '') ?? 67.0011;

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          title: Text(widget.shop['name'] ?? 'Shop Details', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          backgroundColor: const Color(0xFF0047B3),
          elevation: 0,
          actions: [
            IconButton(
              icon: const Icon(Icons.delete, color: Colors.white),
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Delete Shop', style: TextStyle(fontWeight: FontWeight.bold)),
                    content: const Text('Are you sure you want to delete this shop? This action cannot be undone.'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                      TextButton(
                        onPressed: () async {
                          await _dbHelper.deleteShop(widget.shop['id']);
                          Navigator.pop(ctx); // Close dialog
                          Navigator.pop(context, true); // Close screen and return true
                        },
                        child: const Text('Delete', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
          bottom: const TabBar(
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            indicatorColor: Colors.white,
            indicatorWeight: 3,
            labelStyle: TextStyle(fontWeight: FontWeight.bold),
            unselectedLabelStyle: TextStyle(fontWeight: FontWeight.normal),
            tabs: [
              Tab(text: 'Info'),
              Tab(text: 'Map'),
              Tab(text: 'History'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildInfoTab(),
            _buildMapTab(lat, lng),
            _buildHistoryTab(),
          ],
        ),
        floatingActionButton: FloatingActionButton.extended(
          backgroundColor: const Color(0xFF0047B3),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => SurveyExecutionScreen(shop: widget.shop),
              ),
            ).then((_) => _loadHistory());
          },
          icon: const Icon(Icons.play_arrow, color: Colors.white),
          label: const Text('Start Visit', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }

  Widget _buildInfoTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildInfoCard(
            title: 'Shop Information',
            children: [
              _buildInfoRow('Name', widget.shop['name']),
              _buildInfoRow('City', widget.shop['city']),
              _buildInfoRow('Area', widget.shop['area']),
              _buildInfoRow('Address', widget.shop['address']),
              if (widget.shop['type'] != null) _buildInfoRow('Outlet Type', widget.shop['type']),
              if (widget.shop['classification'] != null) _buildInfoRow('Classification', widget.shop['classification']),
            ],
          ),
          const SizedBox(height: 16),
          _buildInfoCard(
            title: 'Contact Details',
            children: [
              _buildInfoRow('Contact Person', widget.shop['ownerName']),
              _buildInfoRow('Phone', widget.shop['contactNo']),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard({required String title, required List<Widget> children}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
          const Divider(height: 24, color: Color(0xFFE2E8F0)),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: const TextStyle(color: Color(0xFF64748B), fontSize: 14)),
          ),
          Expanded(
            child: Text(
              value?.toString().isNotEmpty == true ? value.toString() : 'N/A',
              style: const TextStyle(color: Color(0xFF0F172A), fontSize: 14, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapTab(double lat, double lng) {
    return GoogleMap(
      initialCameraPosition: CameraPosition(
        target: LatLng(lat, lng),
        zoom: 15.0,
      ),
      markers: {
        Marker(
          markerId: const MarkerId('shop_location'),
          position: LatLng(lat, lng),
          infoWindow: InfoWindow(title: widget.shop['name']),
        ),
      },
      zoomControlsEnabled: false,
    );
  }

  Widget _buildHistoryTab() {
    if (_isLoadingHistory) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_shopHistory.isEmpty) {
      return const Center(
        child: Text('No previous visits recorded for this shop.', style: TextStyle(color: Colors.grey, fontSize: 16)),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16).copyWith(bottom: 80),
      itemCount: _shopHistory.length,
      itemBuilder: (context, index) {
        final history = _shopHistory[index];
        final date = history['submittedAt'] ?? 'Unknown Date';
        
        return Card(
          elevation: 0,
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Visit Recorded', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                    Text(date.toString().split('T')[0], style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.green, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      history['isSynced'] == 1 ? 'Synced with server' : 'Pending sync',
                      style: TextStyle(color: history['isSynced'] == 1 ? Colors.green : Colors.orange, fontSize: 12),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
