import 'package:flutter/material.dart';
import '../../services/executive_service.dart';
import 'survey_detail_screen.dart';
import '../../theme/glassmorphism.dart';

class SurveyReportsScreen extends StatefulWidget {
  const SurveyReportsScreen({Key? key}) : super(key: key);

  @override
  _SurveyReportsScreenState createState() => _SurveyReportsScreenState();
}

class _SurveyReportsScreenState extends State<SurveyReportsScreen> {
  final ExecutiveService _service = ExecutiveService();
  List<dynamic> _surveys = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final surveys = await _service.getSurveys();
    setState(() {
      _surveys = surveys;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Survey Reports', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: const Color(0xFF0047B3),
        elevation: 0,
        actions: [
          IconButton(icon: const Icon(Icons.filter_list, color: Colors.white), onPressed: () {}),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0047B3)))
          : _surveys.isEmpty
              ? const Center(child: Text('No surveys found', style: TextStyle(color: Color(0xFF475569))))
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _surveys.length,
                    itemBuilder: (context, index) {
                      final survey = _surveys[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: GlassContainer(
                          padding: const EdgeInsets.all(16),
                          child: InkWell(
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => SurveyDetailScreen(surveyId: survey['id']),
                                ),
                              );
                            },
                            child: Row(
                              children: [
                                Container(
                                  width: 50,
                                  height: 50,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0047B3).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFF0047B3).withOpacity(0.3)),
                                  ),
                                  child: const Icon(Icons.assignment, color: Color(0xFF0047B3)),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(survey['shopName'] ?? 'Unknown Shop', style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 16)),
                                      const SizedBox(height: 4),
                                      Text('Surveyor: ${survey['surveyor']}', style: const TextStyle(color: Color(0xFF475569), fontSize: 13)),
                                      const SizedBox(height: 2),
                                      Text('${survey['city'] ?? ''} - ${survey['territory'] ?? ''}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(survey['date']?.toString().split('T')[0] ?? '', style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                                    const SizedBox(height: 8),
                                    const Icon(Icons.chevron_right, color: Color(0xFF94A3B8)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
