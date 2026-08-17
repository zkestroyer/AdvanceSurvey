import 'package:flutter/material.dart';
import '../database/database_helper.dart';
import 'shop_details_screen.dart';

import 'add_shop_screen.dart';

class MyShopsScreen extends StatefulWidget {
  const MyShopsScreen({Key? key}) : super(key: key);

  @override
  State<MyShopsScreen> createState() => _MyShopsScreenState();
}

class _MyShopsScreenState extends State<MyShopsScreen> {
  final DatabaseHelper _dbHelper = DatabaseHelper();
  List<Map<String, dynamic>> _shops = [];
  List<Map<String, dynamic>> _filteredShops = [];
  bool _isLoading = true;
  String _searchQuery = '';
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    _loadShops();
  }

  Future<void> _loadShops() async {
    try {
      final dbShops = await _dbHelper.getShops();
      final shopsList = List<Map<String, dynamic>>.from(dbShops);
      shopsList.sort((a, b) {
        int idA = int.tryParse(a['id'].toString()) ?? 0;
        int idB = int.tryParse(b['id'].toString()) ?? 0;
        return idB.compareTo(idA);
      });
      
      setState(() {
        _shops = shopsList;
        _filteredShops = shopsList;
        _isLoading = false;
      });
    } catch (e) {
      print("Error loading shops: $e");
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _applyFilters() {
    setState(() {
      _filteredShops = _shops.where((shop) {
        final name = (shop['name'] ?? '').toString().toLowerCase();
        final city = (shop['city'] ?? '').toString().toLowerCase();
        final matchesSearch = name.contains(_searchQuery.toLowerCase()) || city.contains(_searchQuery.toLowerCase());
        
        bool matchesDate = true;
        if (_selectedDate != null) {
          final createdAtStr = shop['createdAt'];
          if (createdAtStr != null) {
            try {
              final createdAt = DateTime.parse(createdAtStr.toString());
              matchesDate = createdAt.year == _selectedDate!.year &&
                            createdAt.month == _selectedDate!.month &&
                            createdAt.day == _selectedDate!.day;
            } catch (e) {
              matchesDate = false;
            }
          } else {
            matchesDate = false;
          }
        }
        
        return matchesSearch && matchesDate;
      }).toList();
    });
  }

  void _onSearchChanged(String query) {
    _searchQuery = query;
    _applyFilters();
  }

  Future<void> _pickDate() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF0047B3), // header background color
              onPrimary: Colors.white, // header text color
              onSurface: Color(0xFF0F172A), // body text color
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _selectedDate = picked;
      });
      _applyFilters();
    }
  }

  void _clearDateFilter() {
    setState(() {
      _selectedDate = null;
    });
    _applyFilters();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF0047B3)));
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('My Shops', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0047B3),
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF0047B3),
        child: const Icon(Icons.add, color: Colors.white),
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const AddShopScreen()),
          );
          if (result == true) {
            _loadShops(); // Refresh list if a shop was added
          }
        },
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: const Color(0xFF0047B3),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    onChanged: _onSearchChanged,
                    decoration: InputDecoration(
                      hintText: 'Search shops by name or city...',
                      hintStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
                      prefixIcon: const Icon(Icons.search, color: Colors.white),
                      filled: true,
                      fillColor: Colors.white.withOpacity(0.2),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(vertical: 0),
                    ),
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: BoxDecoration(
                    color: _selectedDate != null ? Colors.white : Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: IconButton(
                    icon: Icon(
                      _selectedDate != null ? Icons.event_busy : Icons.calendar_today,
                      color: _selectedDate != null ? const Color(0xFF0047B3) : Colors.white,
                    ),
                    onPressed: _selectedDate != null ? _clearDateFilter : _pickDate,
                    tooltip: _selectedDate != null ? 'Clear Date Filter' : 'Filter by Date',
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _filteredShops.isEmpty
                ? Center(
                    child: Text(
                      _searchQuery.isEmpty ? 'No shops assigned.' : 'No shops found.',
                      style: const TextStyle(color: Colors.grey, fontSize: 16),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filteredShops.length,
                    itemBuilder: (context, index) {
                      final shop = _filteredShops[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: const BorderSide(color: Color(0xFFE2E8F0)),
                        ),
                        child: InkWell(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => ShopDetailsScreen(shop: shop),
                              ),
                            ).then((value) {
                              if (value == true) {
                                _loadShops();
                              }
                            });
                          },
                          borderRadius: BorderRadius.circular(12),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0047B3).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(Icons.storefront, color: Color(0xFF0047B3)),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        shop['name'] ?? 'Unknown Shop',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                          color: Color(0xFF0F172A),
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          const Icon(Icons.location_on, size: 14, color: Color(0xFF64748B)),
                                          const SizedBox(width: 4),
                                          Expanded(
                                            child: Text(
                                              '${shop['area'] ?? ''}, ${shop['city'] ?? ''}'.trim().replaceAll(RegExp(r'^,\s*'), ''),
                                              style: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
