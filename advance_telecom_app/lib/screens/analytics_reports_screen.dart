import 'package:flutter/material.dart';
import '../services/analytics_service.dart';

class AnalyticsReportsScreen extends StatefulWidget {
  const AnalyticsReportsScreen({Key? key}) : super(key: key);

  @override
  State<AnalyticsReportsScreen> createState() => _AnalyticsReportsScreenState();
}

class _AnalyticsReportsScreenState extends State<AnalyticsReportsScreen> {
  final AnalyticsService _analyticsService = AnalyticsService();
  
  final List<Map<String, String>> _reportTypes = [
    {'id': 'shop-addition', 'label': '1. Shop Addition Report'},
    {'id': 'tso-shop-addition', 'label': '2. TSO Shop Addition Report'},
    {'id': 'survey', 'label': '3. Survey Report'},
    {'id': 'territory-wise', 'label': '4. Territory Wise Survey Report'},
    {'id': 'area-wise', 'label': '5. Area Wise Survey Report'},
    {'id': 'tso-performance', 'label': '6. TSO Performance Report'},
    {'id': 'bdm-performance', 'label': '7. BDM Performance Report'},
    {'id': 'daily-survey', 'label': '8. Daily Survey Report'},
    {'id': 'survey-detail', 'label': '9. Survey Detail Report'},
  ];

  String _activeReportId = 'shop-addition';
  List<dynamic> _data = [];
  bool _isLoading = false;

  final Map<String, String> _filters = {
    'dateRange': 'month',
    'territoryId': '',
    'area': '',
    'status': ''
  };

  @override
  void initState() {
    super.initState();
    _fetchReportData();
  }

  Future<void> _fetchReportData() async {
    setState(() => _isLoading = true);
    final data = await _analyticsService.fetchReportData(_activeReportId, _filters);
    setState(() {
      _data = data;
      _isLoading = false;
    });
  }

  void _openFiltersSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                left: 16, right: 16, top: 16
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Filters', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  
                  DropdownButtonFormField<String>(
                    decoration: const InputDecoration(labelText: 'Date Range', border: OutlineInputBorder()),
                    initialValue: _filters['dateRange']!.isEmpty ? null : _filters['dateRange'],
                    items: const [
                      DropdownMenuItem(value: '', child: Text('All Time')),
                      DropdownMenuItem(value: 'today', child: Text('Today')),
                      DropdownMenuItem(value: 'month', child: Text('This Month')),
                    ],
                    onChanged: (val) {
                      setModalState(() => _filters['dateRange'] = val ?? '');
                    },
                  ),
                  const SizedBox(height: 12),
                  
                  TextFormField(
                    decoration: const InputDecoration(labelText: 'Territory ID', border: OutlineInputBorder()),
                    initialValue: _filters['territoryId'],
                    onChanged: (val) => setModalState(() => _filters['territoryId'] = val),
                  ),
                  const SizedBox(height: 12),
                  
                  TextFormField(
                    decoration: const InputDecoration(labelText: 'Area', border: OutlineInputBorder()),
                    initialValue: _filters['area'],
                    onChanged: (val) => setModalState(() => _filters['area'] = val),
                  ),
                  const SizedBox(height: 12),
                  
                  DropdownButtonFormField<String>(
                    decoration: const InputDecoration(labelText: 'Status', border: OutlineInputBorder()),
                    initialValue: _filters['status']!.isEmpty ? null : _filters['status'],
                    items: const [
                      DropdownMenuItem(value: '', child: Text('All Statuses')),
                      DropdownMenuItem(value: 'completed', child: Text('Completed')),
                      DropdownMenuItem(value: 'draft', child: Text('Draft')),
                    ],
                    onChanged: (val) {
                      setModalState(() => _filters['status'] = val ?? '');
                    },
                  ),
                  const SizedBox(height: 24),
                  
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _fetchReportData();
                      },
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                      child: const Text('Apply Filters'),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            );
          }
        );
      }
    );
  }

  List<DataColumn> _getColumns() {
    switch (_activeReportId) {
      case 'shop-addition':
        return const [DataColumn(label: Text('Shop Name')), DataColumn(label: Text('Territory')), DataColumn(label: Text('Added By')), DataColumn(label: Text('Date Added'))];
      case 'tso-shop-addition':
        return const [DataColumn(label: Text('TSO Name')), DataColumn(label: Text('Territory')), DataColumn(label: Text('Total Shops'))];
      case 'survey':
      case 'survey-detail':
        return const [DataColumn(label: Text('ID')), DataColumn(label: Text('Shop')), DataColumn(label: Text('TSO')), DataColumn(label: Text('Status'))];
      case 'territory-wise':
        return const [DataColumn(label: Text('Territory')), DataColumn(label: Text('Total Surveys')), DataColumn(label: Text('No. of TSOs'))];
      case 'area-wise':
        return const [DataColumn(label: Text('Area')), DataColumn(label: Text('Territory')), DataColumn(label: Text('Total Surveys'))];
      case 'tso-performance':
        return const [DataColumn(label: Text('TSO')), DataColumn(label: Text('Territory')), DataColumn(label: Text('Surveys')), DataColumn(label: Text('Shops Added'))];
      case 'bdm-performance':
        return const [DataColumn(label: Text('BDM')), DataColumn(label: Text('Total TSOs')), DataColumn(label: Text('Surveys'))];
      case 'daily-survey':
        return const [DataColumn(label: Text('Date')), DataColumn(label: Text('Surveys Done')), DataColumn(label: Text('Active TSOs'))];
      default:
        return [];
    }
  }

  List<DataRow> _getRows() {
    return _data.map((row) {
      List<DataCell> cells = [];
      switch (_activeReportId) {
        case 'shop-addition':
          cells = [
            DataCell(Text(row['shopName']?.toString() ?? '')),
            DataCell(Text(row['territory']?.toString() ?? '')),
            DataCell(Text(row['addedBy']?.toString() ?? '')),
            DataCell(Text(row['dateAdded'] != null ? row['dateAdded'].toString().split('T')[0] : '')),
          ];
          break;
        case 'tso-shop-addition':
          cells = [
            DataCell(Text(row['tsoName']?.toString() ?? '')),
            DataCell(Text(row['territory']?.toString() ?? '')),
            DataCell(Text(row['totalShopsAdded']?.toString() ?? '0')),
          ];
          break;
        case 'survey':
        case 'survey-detail':
          cells = [
            DataCell(Text('#${row['id']}')),
            DataCell(Text(row['shopName']?.toString() ?? '')),
            DataCell(Text(row['tsoName']?.toString() ?? '')),
            DataCell(Text(row['status']?.toString() ?? '')),
          ];
          break;
        case 'territory-wise':
          cells = [
            DataCell(Text(row['territory']?.toString() ?? '')),
            DataCell(Text(row['totalSurveys']?.toString() ?? '0')),
            DataCell(Text(row['noOfTsos']?.toString() ?? '0')),
          ];
          break;
        case 'area-wise':
          cells = [
            DataCell(Text(row['area']?.toString() ?? '')),
            DataCell(Text(row['territory']?.toString() ?? '')),
            DataCell(Text(row['totalSurveys']?.toString() ?? '0')),
          ];
          break;
        case 'tso-performance':
          cells = [
            DataCell(Text(row['tsoName']?.toString() ?? '')),
            DataCell(Text(row['territory']?.toString() ?? '')),
            DataCell(Text(row['totalSurveys']?.toString() ?? '0')),
            DataCell(Text(row['totalShopsAdded']?.toString() ?? '0')),
          ];
          break;
        case 'bdm-performance':
          cells = [
            DataCell(Text(row['bdmName']?.toString() ?? '')),
            DataCell(Text(row['totalTsos']?.toString() ?? '0')),
            DataCell(Text(row['totalSurveys']?.toString() ?? '0')),
          ];
          break;
        case 'daily-survey':
          cells = [
            DataCell(Text(row['date']?.toString() ?? '')),
            DataCell(Text(row['surveysDone']?.toString() ?? '0')),
            DataCell(Text(row['activeTsos']?.toString() ?? '0')),
          ];
          break;
      }
      return DataRow(cells: cells);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Analytics Reports', style: TextStyle(color: Colors.white)),
        backgroundColor: const Color(0xFF0047B3),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _openFiltersSheet,
          )
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Dropdown
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.grey[100],
            child: DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                filled: true,
                fillColor: Colors.white,
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8)
              ),
              initialValue: _activeReportId,
              isExpanded: true,
              items: _reportTypes.map((rt) {
                return DropdownMenuItem<String>(
                  value: rt['id'],
                  child: Text(rt['label']!, style: const TextStyle(fontWeight: FontWeight.w500)),
                );
              }).toList(),
              onChanged: (val) {
                if (val != null) {
                  setState(() {
                    _activeReportId = val;
                  });
                  _fetchReportData();
                }
              },
            ),
          ),
          
          // Data Table
          Expanded(
            child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _data.isEmpty
                ? const Center(child: Text('No data found for selected filters', style: TextStyle(color: Colors.grey)))
                : SingleChildScrollView(
                    scrollDirection: Axis.vertical,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: DataTable(
                        headingRowColor: WidgetStateProperty.all(Colors.grey[200]),
                        columns: _getColumns(),
                        rows: _getRows(),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
