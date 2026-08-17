import 'package:flutter/material.dart';
import '../../services/executive_service.dart';
import '../../theme/glassmorphism.dart';

class ComparisonReportsScreen extends StatefulWidget {
  const ComparisonReportsScreen({Key? key}) : super(key: key);

  @override
  _ComparisonReportsScreenState createState() => _ComparisonReportsScreenState();
}

class _ComparisonReportsScreenState extends State<ComparisonReportsScreen> {
  final ExecutiveService _executiveService = ExecutiveService();
  
  // State
  String? _selectedType;
  List<String> _availableEntities = [];
  List<String> _selectedEntities = [];
  Map<String, dynamic>? _comparisonData;
  bool _isLoadingEntities = false;
  bool _isComparing = false;
  String? _errorMessage;

  final List<String> _comparisonTypes = [
    'Brand',
    'Territory',
    'Distributor',
    'Product Category'
  ];

  @override
  void initState() {
    super.initState();
  }

  Future<void> _fetchEntitiesForType(String type) async {
    setState(() {
      _isLoadingEntities = true;
      _errorMessage = null;
      _availableEntities = [];
      _selectedEntities = [];
      _comparisonData = null;
    });

    try {
      Set<String> uniqueEntities = {};
      if (type == 'Brand') {
        final prices = await _executiveService.getPrices();
        for (var p in prices) {
          if (p['brand'] != null) uniqueEntities.add(p['brand'].toString());
        }
      } else if (type == 'Territory') {
        final territories = await _executiveService.getTerritories();
        for (var t in territories) {
          if (t['name'] != null) uniqueEntities.add(t['name'].toString());
        }
      } else if (type == 'Distributor') {
        final shops = await _executiveService.getShops();
        for (var s in shops) {
          if (s['distributor'] != null) uniqueEntities.add(s['distributor'].toString());
        }
      } else if (type == 'Product Category') {
        final prices = await _executiveService.getPrices();
        for (var p in prices) {
          if (p['category'] != null) uniqueEntities.add(p['category'].toString());
        }
      }

      setState(() {
        _availableEntities = uniqueEntities.toList()..sort();
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load entities: $e';
      });
    } finally {
      setState(() {
        _isLoadingEntities = false;
      });
    }
  }

  Future<void> _compare() async {
    if (_selectedType == null || _selectedEntities.length < 2) return;

    setState(() {
      _isComparing = true;
      _errorMessage = null;
      _comparisonData = null;
    });

    try {
      final query = {
        'groupBy': _selectedType,
        'filters': {
          'entities': _selectedEntities
        }
      };
      
      final data = await _executiveService.getComparison(query);
      setState(() {
        _comparisonData = data;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load comparison data: $e';
      });
    } finally {
      setState(() {
        _isComparing = false;
      });
    }
  }

  void _toggleEntitySelection(String entity) {
    setState(() {
      if (_selectedEntities.contains(entity)) {
        _selectedEntities.remove(entity);
      } else {
        _selectedEntities.add(entity);
      }
      _comparisonData = null; // Reset results when selection changes
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Comparison Reports',
          style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildTypeSelector(),
              const SizedBox(height: 16),
              if (_selectedType != null) _buildEntitySelector(),
              const SizedBox(height: 24),
              if (_selectedType != null && _selectedEntities.length >= 2)
                Center(
                  child: GlassButton(
                    text: 'Compare Selected',
                    onPressed: _compare,
                    isLoading: _isComparing,
                    backgroundColor: const Color(0xFF0047B3),
                    textColor: Colors.white,
                    icon: Icons.compare_arrows,
                  ),
                ),
              if (_errorMessage != null)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16.0),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                ),
              const SizedBox(height: 24),
              if (_comparisonData != null) _buildResultsSection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTypeSelector() {
    return GlassContainer(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Step 1: Select Comparison Type',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF0F172A),
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _selectedType,
            decoration: InputDecoration(
              filled: true,
              fillColor: Colors.white.withOpacity(0.5),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            ),
            hint: const Text('Choose what to compare...'),
            items: _comparisonTypes.map((type) {
              return DropdownMenuItem(
                value: type,
                child: Text(type),
              );
            }).toList(),
            onChanged: (value) {
              if (value != null && value != _selectedType) {
                setState(() {
                  _selectedType = value;
                });
                _fetchEntitiesForType(value);
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildEntitySelector() {
    return GlassContainer(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Step 2: Pick $_selectedType',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF0F172A),
                ),
              ),
              Text(
                '${_selectedEntities.length} selected (min 2)',
                style: TextStyle(
                  fontSize: 12,
                  color: _selectedEntities.length >= 2 ? const Color(0xFF0047B3) : const Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (_isLoadingEntities)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24.0),
                child: CircularProgressIndicator(color: Color(0xFF0047B3)),
              ),
            )
          else if (_availableEntities.isEmpty)
            const Padding(
              padding: EdgeInsets.all(8.0),
              child: Text(
                'No items found.',
                style: TextStyle(color: Color(0xFF475569)),
              ),
            )
          else
            Wrap(
              spacing: 8.0,
              runSpacing: 8.0,
              children: _availableEntities.map((entity) {
                final isSelected = _selectedEntities.contains(entity);
                return FilterChip(
                  label: Text(entity),
                  selected: isSelected,
                  onSelected: (_) => _toggleEntitySelection(entity),
                  selectedColor: const Color(0xFF0047B3).withOpacity(0.2),
                  checkmarkColor: const Color(0xFF0047B3),
                  labelStyle: TextStyle(
                    color: isSelected ? const Color(0xFF0047B3) : const Color(0xFF475569),
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                  backgroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide(
                      color: isSelected ? const Color(0xFF0047B3) : Colors.grey.withOpacity(0.3),
                    ),
                  ),
                );
              }).toList(),
            ),
        ],
      ),
    );
  }

  Widget _buildResultsSection() {
    final cards = _comparisonData?['cards'] as Map<String, dynamic>? ?? {};
    final tableData = _comparisonData?['table'] as List<dynamic>? ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Results Overview',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildSummaryCard(
                'Total Shops',
                cards['totalShops']?.toString() ?? '0',
                Icons.store,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildSummaryCard(
                'Avg Price',
                'Rs. ${cards['avgPurchasePrice']?.toString() ?? '0'}',
                Icons.monetization_on,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),
        const Text(
          'Detailed Comparison',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 12),
        GlassContainer(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              headingRowColor: MaterialStateProperty.all(const Color(0xFF0047B3).withOpacity(0.1)),
              columns: [
                DataColumn(
                  label: Text(
                    _selectedType ?? 'Group',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                ),
                const DataColumn(
                  label: Text(
                    'Shops',
                    style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  numeric: true,
                ),
                const DataColumn(
                  label: Text(
                    'Purchase Price',
                    style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  numeric: true,
                ),
              ],
              rows: tableData.map((row) {
                return DataRow(
                  cells: [
                    DataCell(Text(row['group']?.toString() ?? '-')),
                    DataCell(Text(row['shopCount']?.toString() ?? '0')),
                    DataCell(Text('Rs. ${row['purchasePrice']?.toString() ?? '0'}')),
                  ],
                );
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryCard(String title, String value, IconData icon) {
    return GlassContainer(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: const Color(0xFF0047B3)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Color(0xFF64748B),
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }
}
