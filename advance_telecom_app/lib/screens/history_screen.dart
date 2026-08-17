import 'dart:convert';
import 'package:flutter/material.dart';
import '../database/database_helper.dart';
import '../theme/glassmorphism.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({Key? key}) : super(key: key);

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final DatabaseHelper _dbHelper = DatabaseHelper();
  List<Map<String, dynamic>> _completedSurveys = [];
  List<Map<String, dynamic>> _filteredSurveys = [];
  bool _isLoading = true;
  String _searchQuery = '';
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    final completed = await _dbHelper.getCompletedSurveys();
    setState(() {
      _completedSurveys = completed;
      _isLoading = false;
    });
    _applyFilters();
  }

  void _applyFilters() {
    setState(() {
      _filteredSurveys = _completedSurveys.where((survey) {
        final shopName = (survey['shopName'] ?? '').toString().toLowerCase();
        final title = (survey['surveyTitle'] ?? '').toString().toLowerCase();
        final matchesSearch = shopName.contains(_searchQuery.toLowerCase()) || title.contains(_searchQuery.toLowerCase());
        
        bool matchesDate = true;
        if (_selectedDate != null) {
          final submittedAtStr = survey['submittedAt'];
          if (submittedAtStr != null) {
            try {
              final submittedAt = DateTime.parse(submittedAtStr.toString());
              matchesDate = submittedAt.year == _selectedDate!.year &&
                            submittedAt.month == _selectedDate!.month &&
                            submittedAt.day == _selectedDate!.day;
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

  void _showDetails(Map<String, dynamic> survey) {
    List<dynamic> answers = [];
    if (survey['data'] != null) {
      try {
        if (survey['data'] is String) {
          answers = jsonDecode(survey['data']);
        } else {
          answers = survey['data'];
        }
      } catch (e) {
        print('Error decoding data: $e');
      }
    }
    
    Map<String, List<dynamic>> tempGrouped = {};
    for (var a in answers) {
      String sectionName = a['question']?['section']?['title'] ?? 'General';
      
      String qId = a['questionId']?.toString() ?? '';
      String val = a['value']?.toString() ?? '';
      
      // Filter out internal UI flags that might have been saved in older syncs
      if (qId.endsWith('_is_other')) continue;
      
      // The backend sometimes strips the '_is_other' suffix and returns duplicate questions with 'false' or 'true'.
      // Since no real question has a literal "false" or "true" answer (checkboxes use lists), filter them out.
      if (val == 'false' || val == 'true') continue;
      
      // If it fell into the default 'Responses' section, allow checkout data and comments (feedback) to show
      if (sectionName == 'Responses' || sectionName == 'General') {
        sectionName = 'Responses'; // Normalize
        if (qId != 'checkout_lat' && qId != 'checkout_lng' && qId != 'checkout_time' && qId != 'comments' && qId != 'feedback') {
          continue;
        }
      }

      if (!tempGrouped.containsKey(sectionName)) tempGrouped[sectionName] = [];
      tempGrouped[sectionName]!.add(a);
    }
    
    // Sort the sections numerically based on their original hardcoded numbers (e.g. "2. Source Details")
    List<String> sectionKeys = tempGrouped.keys.toList();
    sectionKeys.sort((a, b) {
      if (a == 'Responses') return 1; // Always push Responses to the end
      if (b == 'Responses') return -1;
      
      int getSortNum(String key) {
        final match = RegExp(r'^(\d+)').firstMatch(key);
        if (match != null) return int.parse(match.group(1)!);
        if (key.toLowerCase().contains('source')) return 997; // Force 3rd last
        if (key.toLowerCase().contains('photo')) return 998;  // Force 2nd last
        return 990; // Any other unnumbered sections come before the end blocks
      }
      
      int numA = getSortNum(a);
      int numB = getSortNum(b);
      
      if (numA != numB) return numA.compareTo(numB);
      return a.compareTo(b);
    });

    Map<String, List<dynamic>> groupedAnswers = {};
    for (String key in sectionKeys) {
      String name = key;
      if (name == 'Responses') {
        name = 'Checkout & Feedback'; // Give it a nicer name
      }
      groupedAnswers[name] = tempGrouped[key]!;
    }
    
    if (groupedAnswers.isEmpty) {
      groupedAnswers['All'] = [];
    }
    List<String> tabs = groupedAnswers.keys.toList();

    showDialog(
      context: context,
      builder: (ctx) {
        String activeTab = tabs.first;
        return StatefulBuilder(
          builder: (context, setState) {
            final answersToDisplay = groupedAnswers[activeTab] ?? [];
            return AlertDialog(
              title: Text('${survey['surveyTitle']} Details', style: const TextStyle(fontWeight: FontWeight.bold)),
              content: SizedBox(
                width: double.maxFinite,
                child: answers.isEmpty
                    ? const Text('No detailed answers found.')
                    : Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (tabs.length > 1)
                            SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                children: tabs.map((tab) => Padding(
                                  padding: const EdgeInsets.only(right: 8.0, bottom: 12.0),
                                  child: ChoiceChip(
                                    label: Text(tab),
                                    selected: activeTab == tab,
                                    onSelected: (selected) {
                                      if (selected) setState(() => activeTab = tab);
                                    },
                                    selectedColor: const Color(0xFF0047B3),
                                    labelStyle: TextStyle(color: activeTab == tab ? Colors.white : const Color(0xFF0F172A)),
                                  ),
                                )).toList(),
                              ),
                            ),
                          Expanded(
                            child: ListView.builder(
                              shrinkWrap: true,
                              itemCount: answersToDisplay.length,
                              itemBuilder: (context, idx) {
                                final a = answersToDisplay[idx];
                                String questionText = a['question']?['questionText'] ?? 'Question ${a['questionId']}';
                                String qId = a['questionId']?.toString() ?? '';
                                final valueText = a['value'] ?? 'N/A';
                                
                                // Rename specific fallback keys
                                if (qId == 'checkout_lat') questionText = 'Checkout Location (Lat)';
                                if (qId == 'checkout_lng') questionText = 'Checkout Location (Lng)';
                                if (qId == 'checkout_time') questionText = 'Check Out Time';
                                if (qId == 'comments' || qId == 'feedback') questionText = 'Feedback Comments';

                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 12.0),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(questionText, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                                      const SizedBox(height: 4),
                                      if (a['question']?['type'] == 'photo')
                                        const Text('[Photo Placeholder]', style: TextStyle(color: Colors.blueAccent, fontStyle: FontStyle.italic))
                                      else
                                        Text(valueText, style: const TextStyle(color: Color(0xFF475569))),
                                    ],
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Close', style: TextStyle(color: Color(0xFF0047B3))),
                )
              ],
            );
          }
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: Colors.cyan));
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: const Text('Past Surveys', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 24)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false,
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
                      hintText: 'Search by shop or survey title...',
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
            child: _filteredSurveys.isEmpty 
              ? const Center(
                  child: Text('No history found.', style: TextStyle(color: Color(0xFF475569))),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _filteredSurveys.length,
                  itemBuilder: (context, index) {
                    final survey = _filteredSurveys[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: GestureDetector(
                  onTap: () => _showDetails(survey),
                  child: GlassContainer(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle, color: Colors.greenAccent, size: 36),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(survey['shopName'] ?? 'Unknown Shop', style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 16)),
                              const SizedBox(height: 4),
                              Text('${survey['surveyTitle']} | ${survey['submittedAt']?.split('T')[0] ?? ''}', style: const TextStyle(color: Color(0xFF475569), fontSize: 13)),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios, color: Color(0xFF0047B3), size: 16),
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
