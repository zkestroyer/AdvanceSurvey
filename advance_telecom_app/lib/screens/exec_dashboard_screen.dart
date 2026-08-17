import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/analytics_service.dart';
import 'package:fl_chart/fl_chart.dart';

class ExecDashboardScreen extends StatefulWidget {
  const ExecDashboardScreen({Key? key}) : super(key: key);

  @override
  State<ExecDashboardScreen> createState() => _ExecDashboardScreenState();
}

class _ExecDashboardScreenState extends State<ExecDashboardScreen> {
  final AuthService _authService = AuthService();
  final AnalyticsService _analyticsService = AnalyticsService();
  
  Map<String, dynamic> _stats = {};
  Map<String, dynamic> _charts = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final stats = await _analyticsService.fetchDashboardStats();
    final charts = await _analyticsService.fetchDashboardCharts();
    setState(() {
      _stats = stats;
      _charts = charts;
      _isLoading = false;
    });
  }

  void _logout() async {
    await _authService.logout();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/login');
  }

  Widget _buildStatCard(String title, dynamic value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(
              '$value',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 11, color: Colors.grey),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildTopTSOChart() {
    final List topTSOs = _charts['topTSOs'] ?? [];
    if (topTSOs.isEmpty) return const SizedBox();

    return Container(
      height: 250,
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Top TSOs by Surveys', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Expanded(
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                barTouchData: BarTouchData(enabled: false),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (double value, TitleMeta meta) {
                        if (value.toInt() >= topTSOs.length) return const SizedBox();
                        String name = topTSOs[value.toInt()]['name'] ?? '';
                        if (name.length > 5) name = name.substring(0, 5) + '..';
                        return Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text(name, style: const TextStyle(fontSize: 10)),
                        );
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                gridData: FlGridData(show: false),
                borderData: FlBorderData(show: false),
                barGroups: topTSOs.asMap().entries.map((entry) {
                  return BarChartGroupData(
                    x: entry.key,
                    barRods: [
                      BarChartRodData(
                        toY: (entry.value['surveys'] ?? 0).toDouble(),
                        color: Colors.cyan,
                        width: 16,
                        borderRadius: BorderRadius.circular(4),
                      )
                    ],
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSurveysByTerritoryChart() {
    final List byTerritory = _charts['surveysByTerritory'] ?? [];
    if (byTerritory.isEmpty) return const SizedBox();

    final List<Color> colors = [Colors.cyan, Colors.indigo, Colors.green, Colors.orange, Colors.pink, Colors.purple];

    return Container(
      height: 250,
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Surveys by Territory', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Expanded(
            child: PieChart(
              PieChartData(
                sectionsSpace: 2,
                centerSpaceRadius: 40,
                sections: byTerritory.asMap().entries.map((entry) {
                  return PieChartSectionData(
                    color: colors[entry.key % colors.length],
                    value: (entry.value['surveys'] ?? 0).toDouble(),
                    title: '${entry.value['name']}\n(${entry.value['surveys']})',
                    radius: 50,
                    titleStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text('Exec Dashboard', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0047B3),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _loadData,
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: _logout,
          )
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _loadData,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Navigate to Reports Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.indigo,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.analytics, color: Colors.white),
                      label: const Text('View Detailed Reports', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                      onPressed: () {
                        Navigator.pushNamed(context, '/analytics_reports');
                      },
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  const Text('Summary Metrics', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  
                  // 12 Counters Grid
                  GridView.count(
                    crossAxisCount: 3,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    childAspectRatio: 0.8,
                    mainAxisSpacing: 8,
                    crossAxisSpacing: 8,
                    children: [
                      _buildStatCard('Total Shops', _stats['totalShops'] ?? 0, Icons.store, Colors.blueGrey),
                      _buildStatCard('Shops Today', _stats['shopsAddedToday'] ?? 0, Icons.calendar_today, Colors.green),
                      _buildStatCard('Shops Month', _stats['shopsAddedThisMonth'] ?? 0, Icons.trending_up, Colors.green),
                      _buildStatCard('Total Surveys', _stats['totalSurveys'] ?? 0, Icons.assignment, Colors.cyan),
                      _buildStatCard('Surveys Today', _stats['surveysToday'] ?? 0, Icons.schedule, Colors.indigo),
                      _buildStatCard('Surveys Month', _stats['surveysThisMonth'] ?? 0, Icons.analytics, Colors.indigo),
                      _buildStatCard('Active TSOs', _stats['activeTSOs'] ?? 0, Icons.people, Colors.blueGrey),
                      _buildStatCard('Active BDMs', _stats['activeBDMs'] ?? 0, Icons.security, Colors.orange),
                      _buildStatCard('Territories', _stats['territoriesCovered'] ?? 0, Icons.map, Colors.redAccent),
                      _buildStatCard('Areas', _stats['areasCovered'] ?? 0, Icons.layers, Colors.redAccent),
                      _buildStatCard('Avg Surveys/TSO', _stats['avgSurveysPerTSO']?.toStringAsFixed(1) ?? '0', Icons.bar_chart, Colors.cyan),
                      _buildStatCard('Pending', _stats['pendingSurveys'] ?? 0, Icons.work, Colors.orange),
                    ],
                  ),
                  
                  const SizedBox(height: 24),
                  const Text('Analytics Charts', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  
                  _buildTopTSOChart(),
                  _buildSurveysByTerritoryChart(),
                  
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
    );
  }
}
