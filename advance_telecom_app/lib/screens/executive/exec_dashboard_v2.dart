import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:percent_indicator/percent_indicator.dart';
import '../../services/executive_service.dart';
import '../../models/executive_models.dart';
import '../../theme/glassmorphism.dart';
import '../../services/auth_service.dart';
import '../../models/user.dart';
import 'survey_reports_screen.dart';
import 'notifications_screen.dart';

class ExecDashboardV2 extends StatefulWidget {
  const ExecDashboardV2({Key? key}) : super(key: key);

  @override
  _ExecDashboardV2State createState() => _ExecDashboardV2State();
}

class _ExecDashboardV2State extends State<ExecDashboardV2> {
  final ExecutiveService _service = ExecutiveService();
  final AuthService _authService = AuthService();
  DashboardSummary? _summary;
  Map<String, dynamic>? _chartsData;
  User? _currentUser;
  bool _isLoading = true;
  String _selectedFilter = 'Today';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      final user = await _authService.getCurrentUser();
      final summary = await _service.getDashboard();
      final chartsData = await _service.getDashboardCharts();
      setState(() {
        _currentUser = user;
        _summary = summary;
        _chartsData = chartsData;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _navigateToSurveys() {
    Navigator.push(context, MaterialPageRoute(builder: (_) => const SurveyReportsScreen()));
  }

  void _showComingSoon() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Coming soon')),
    );
  }

  Widget _buildClickableNumber(dynamic value, VoidCallback onTap, {double fontSize = 16, Color color = const Color(0xFF0F172A), FontWeight weight = FontWeight.bold}) {
    return GestureDetector(
      onTap: onTap,
      child: Text(
        value.toString(),
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: weight,
          color: color,
          decoration: TextDecoration.underline,
        ),
      ),
    );
  }

  Widget _buildFilterChips() {
    final filters = ['Today', 'This Week', 'This Month', 'Custom'];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: filters.map((filter) {
          final isSelected = _selectedFilter == filter;
          return Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: ChoiceChip(
              label: Text(filter),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) {
                  setState(() {
                    _selectedFilter = filter;
                  });
                  // Optionally trigger data reload based on filter here
                }
              },
              selectedColor: const Color(0xFF0047B3).withOpacity(0.1),
              labelStyle: TextStyle(
                color: isSelected ? const Color(0xFF0047B3) : const Color(0xFF475569),
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isSelected ? const Color(0xFF0047B3) : Colors.grey.shade300,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildKPIHeader() {
    final totalSurveys = _summary?.surveySummary['totalSurveys'] ?? 0;
    final activeTSOs = _summary?.users['activeToday'] ?? 0;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: const LinearGradient(
            colors: [Color(0xFF0047B3), Color(0xFF003380)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF0047B3).withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            GestureDetector(
              onTap: _navigateToSurveys,
              child: CircularPercentIndicator(
                radius: 35.0,
                lineWidth: 6.0,
                animation: true,
                percent: 1.0,
                center: Text(
                  "$totalSurveys",
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0, color: Colors.white, decoration: TextDecoration.underline),
                ),
                circularStrokeCap: CircularStrokeCap.round,
                progressColor: Colors.white,
                backgroundColor: Colors.white24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Welcome Back,', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  Text(_currentUser?.name ?? 'Executive', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text('Total Surveys: ', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
                      _buildClickableNumber(totalSurveys, _navigateToSurveys, fontSize: 13, color: Colors.white),
                    ],
                  ),
                  Row(
                    children: [
                      Text('Active TSOs Today: ', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13)),
                      _buildClickableNumber(activeTSOs, _showComingSoon, fontSize: 13, color: Colors.white),
                    ],
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildSurveySummaryRow(String label, dynamic count, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: const Border(
          left: BorderSide(color: Color(0xFF0047B3), width: 4),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF64748B), size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontSize: 14, color: Color(0xFF475569), fontWeight: FontWeight.w500),
            ),
          ),
          _buildClickableNumber(count, _navigateToSurveys, fontSize: 16, color: const Color(0xFF0F172A)),
        ],
      ),
    );
  }

  Widget _buildSurveySummaryCard() {
    final summary = _summary!.surveySummary;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: GlassContainer(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Survey Summary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                GestureDetector(
                  onTap: _navigateToSurveys,
                  child: const Text('View All >', style: TextStyle(fontSize: 14, color: Color(0xFF0047B3), fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildSurveySummaryRow('Total Surveys', summary['totalSurveys'], Icons.analytics_outlined),
            _buildSurveySummaryRow('Surveys Today', summary['surveysToday'], Icons.today),
            _buildSurveySummaryRow('Surveys This Week', summary['surveysThisWeek'], Icons.calendar_view_week),
            _buildSurveySummaryRow('Surveys This Month', summary['surveysThisMonth'], Icons.calendar_month),
          ],
        ),
      ),
    );
  }

  Widget _buildSurveysByTerritoryChart() {
    if (_chartsData == null || _chartsData!['territoryPerformance'] == null) return const SizedBox();
    final List byTerritory = _chartsData!['territoryPerformance'];
    if (byTerritory.isEmpty) return const SizedBox();

    final List<Color> colors = [const Color(0xFF0047B3), const Color(0xFF3B82F6), const Color(0xFF60A5FA), const Color(0xFF93C5FD), const Color(0xFFBFDBFE)];
    int totalShops = byTerritory.fold(0, (sum, item) => sum + (item['count'] as int));

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: GlassContainer(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Shops by Territory (Top 5)', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Top 5', style: TextStyle(fontSize: 12, color: Color(0xFF475569))),
                      Icon(Icons.arrow_drop_down, size: 16, color: Color(0xFF475569)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 200,
              child: Row(
                children: [
                  Expanded(
                    flex: 1,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        PieChart(
                          PieChartData(
                            sectionsSpace: 2,
                            centerSpaceRadius: 40,
                            sections: byTerritory.asMap().entries.map((entry) {
                              return PieChartSectionData(
                                color: colors[entry.key % colors.length],
                                value: (entry.value['count'] ?? 0).toDouble(),
                                title: '',
                                radius: 25,
                              );
                            }).toList(),
                          ),
                        ),
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('Total Shops', style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                            _buildClickableNumber(totalShops, _showComingSoon, fontSize: 16, color: const Color(0xFF0F172A)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    flex: 1,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: byTerritory.asMap().entries.map((entry) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: Row(
                            children: [
                              Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  color: colors[entry.key % colors.length],
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  entry.value['name'].toString(),
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF475569)),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              _buildClickableNumber(entry.value['count'], _showComingSoon, fontSize: 12, weight: FontWeight.w600, color: const Color(0xFF0F172A)),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGenericCard(String title, Map<String, dynamic> data, IconData icon, VoidCallback onNumberTap) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: GlassContainer(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: const Color(0xFF0047B3), size: 24),
                const SizedBox(width: 8),
                Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              ],
            ),
            const Divider(color: Colors.black12, height: 24),
            ...data.entries.map((e) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 6.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(_formatKey(e.key), style: const TextStyle(fontSize: 14, color: Color(0xFF475569))),
                  _buildClickableNumber(e.value, onNumberTap),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }

  String _formatKey(String key) {
    String formatted = key.replaceAll(RegExp(r'(?<!^)(?=[A-Z])'), ' ');
    return formatted[0].toUpperCase() + formatted.substring(1);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF0047B3), Color(0xFF003380)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        title: Row(
          children: [
            Image.asset('assets/logo.png', height: 28, errorBuilder: (context, error, stackTrace) => const Icon(Icons.signal_cellular_alt, color: Colors.white)),
            const SizedBox(width: 8),
            const Text('Advance Telecom', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
          ]
        ),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Badge(
              label: Text('3'),
              child: Icon(Icons.notifications, color: Colors.white),
            ),
            onPressed: () {
              Navigator.push(context, MaterialPageRoute(builder: (_) => const NotificationsScreen()));
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _loadData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0047B3)))
          : _summary == null
              ? const Center(child: Text('Failed to load dashboard data'))
              : RefreshIndicator(
                  onRefresh: _loadData,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    children: [
                      _buildFilterChips(),
                      _buildKPIHeader(),
                      _buildSurveySummaryCard(),
                      _buildSurveysByTerritoryChart(),
                      _buildGenericCard('Shop Summary', _summary!.shopSummary, Icons.storefront, _showComingSoon),
                      _buildGenericCard('User Activity', _summary!.users, Icons.people, _showComingSoon),
                      _buildGenericCard('Geographic Coverage', _summary!.geographicCoverage, Icons.map, _showComingSoon),
                      _buildGenericCard('Product Insights', _summary!.productInsights, Icons.inventory, _showComingSoon),
                      _buildGenericCard('Survey Quality', _summary!.surveyQuality, Icons.verified, _navigateToSurveys),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
    );
  }
}
