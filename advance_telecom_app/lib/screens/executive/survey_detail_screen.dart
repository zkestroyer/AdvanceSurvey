import 'package:flutter/material.dart';
import '../../services/executive_service.dart';

class SurveyDetailScreen extends StatefulWidget {
  final int surveyId;
  const SurveyDetailScreen({Key? key, required this.surveyId}) : super(key: key);

  @override
  _SurveyDetailScreenState createState() => _SurveyDetailScreenState();
}

class _SurveyDetailScreenState extends State<SurveyDetailScreen> {
  final ExecutiveService _service = ExecutiveService();
  Map<String, dynamic>? _survey;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final survey = await _service.getSurveyDetail(widget.surveyId);
    setState(() {
      _survey = survey;
      _isLoading = false;
    });
  }

  Widget _buildSection(String title, List<Widget> children) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0047B3))),
            const Divider(),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(flex: 2, child: Text(label, style: const TextStyle(color: Colors.grey))),
          Expanded(flex: 3, child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Survey Details')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _survey == null
              ? const Center(child: Text('Survey not found'))
              : ListView(
                  children: [
                    _buildSection('Shop Information', [
                      _buildRow('Shop Name', _survey!['shop']?['name'] ?? ''),
                      _buildRow('Owner', _survey!['shop']?['ownerName'] ?? ''),
                      _buildRow('Contact', _survey!['shop']?['contactNo'] ?? ''),
                      _buildRow('City', _survey!['shop']?['city'] ?? ''),
                      _buildRow('Area', _survey!['shop']?['area'] ?? ''),
                      _buildRow('Territory', _survey!['shop']?['territory']?['name'] ?? ''),
                    ]),
                    _buildSection('Survey Information', [
                      _buildRow('Date', _survey!['startedAt']?.split('T')[0] ?? ''),
                      _buildRow('Surveyor', _survey!['user']?['name'] ?? ''),
                      _buildRow('Template', _survey!['template']?['title'] ?? ''),
                      _buildRow('Status', _survey!['status'] ?? ''),
                    ]),
                    _buildSection('Responses', _buildAnswers()),
                  ],
                ),
    );
  }

  List<Widget> _buildAnswers() {
    if (_survey!['answers'] == null) return [const Text('No answers recorded')];
    final answers = _survey!['answers'] as List<dynamic>;
    
    return answers.map((a) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(a['question']?['questionText'] ?? 'Unknown Question', style: const TextStyle(fontWeight: FontWeight.bold)),
            Text(a['value'] ?? 'No Answer', style: const TextStyle(color: Colors.black87)),
            const Divider(height: 16),
          ],
        ),
      );
    }).toList();
  }
}
