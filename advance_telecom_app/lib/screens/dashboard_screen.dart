import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:percent_indicator/percent_indicator.dart';
import '../database/database_helper.dart';
import '../services/auth_service.dart';
import '../services/sync_engine.dart';
import '../models/user.dart';
import '../theme/glassmorphism.dart';
import 'survey_execution_screen.dart';
import 'map_screen.dart';
import 'history_screen.dart';
import 'profile_screen.dart';
import 'my_shops_screen.dart';
import 'add_shop_screen.dart';
import '../services/executive_service.dart';
import '../models/executive_models.dart';
import 'executive/notifications_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;
  final DatabaseHelper _dbHelper = DatabaseHelper();
  final AuthService _authService = AuthService();
  final SyncEngine _syncEngine = SyncEngine();
  
  List<Map<String, dynamic>> _shops = [];
  List<Map<String, dynamic>> _completedSurveys = [];
  bool _isLoading = true;
  int _pendingSurveys = 0;
  int _completedCount = 0;
  double _dailyAverage = 0.0;
  User? _currentUser;
  
  List<ExecutiveNotification> _notifications = [];
  int _unreadNotifs = 0;
  bool _hasShownPopup = false;

  @override
  void initState() {
    super.initState();
    _loadData();
    _silentSync();
  }

  Future<void> _silentSync() async {
    try {
      await _syncEngine.syncAll();
      if (mounted) {
        await _loadData();
      }
    } catch (e) {
      // Ignore errors silently
    }
  }

  Future<void> _loadData() async {
    final user = await _authService.getCurrentUser();
    final shops = await _dbHelper.getShops();
    final pending = await _dbHelper.getPendingResponses();
    final completed = await _dbHelper.getCompletedSurveys();
    
    // Calculate Daily Average
    Map<String, int> dailyCounts = {};
    for (var comp in completed) {
      if (comp['submittedAt'] != null) {
        String date = comp['submittedAt'].toString().split('T')[0];
        dailyCounts[date] = (dailyCounts[date] ?? 0) + 1;
      }
    }
    double avg = dailyCounts.isEmpty ? 0 : completed.length / dailyCounts.length;

    final shopsList = List<Map<String, dynamic>>.from(shops);
    shopsList.sort((a, b) {
      int idA = int.tryParse(a['id'].toString()) ?? 0;
      int idB = int.tryParse(b['id'].toString()) ?? 0;
      return idB.compareTo(idA);
    });

    List<ExecutiveNotification> notifs = [];
    int unread = 0;
    try {
      notifs = await ExecutiveService().getNotifications();
      unread = notifs.where((n) => !n.isRead).length;
    } catch (e) {
      // Ignore network errors for notifications
    }

    setState(() {
      _currentUser = user;
      _shops = shopsList;
      _completedSurveys = completed;
      _pendingSurveys = pending.length;
      _completedCount = completed.length;
      _dailyAverage = avg;
      _notifications = notifs;
      _unreadNotifs = unread;
      _isLoading = false;
    });

    if (_unreadNotifs > 0 && !_hasShownPopup && mounted) {
      _hasShownPopup = true;
      _showNotificationPopup();
    }
  }

  void _showNotificationPopup() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('New Notifications'),
        content: Text('You have $_unreadNotifs unread notifications. Would you like to view them now?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Later')),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _openNotifications();
            },
            child: const Text('View'),
          ),
        ],
      ),
    );
  }

  void _openNotifications() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const NotificationsScreen()),
    ).then((_) => _loadData());
  }

  Widget _buildInfoIcon(String message, {Color color = Colors.white70}) {
    return Tooltip(
      message: message,
      margin: const EdgeInsets.symmetric(horizontal: 20),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(8),
      ),
      textStyle: const TextStyle(color: Colors.white, fontSize: 13),
      triggerMode: TooltipTriggerMode.tap,
      showDuration: const Duration(seconds: 4),
      child: Padding(
        padding: const EdgeInsets.only(left: 4.0),
        child: Icon(Icons.info_outline, size: 14, color: color),
      ),
    );
  }

  void _logout() async {
    await _authService.logout();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/login');
  }

  Future<void> _performSync() async {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Syncing data...')));
    setState(() => _isLoading = true);
    await _syncEngine.syncAll();
    await _loadData();
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sync Complete!')));
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        body: const Center(child: CircularProgressIndicator(color: Colors.cyan)),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      extendBodyBehindAppBar: false,
      body: SafeArea(
        bottom: false,
        child: _buildBodyContent(),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -4),
            )
          ]
        ),
        child: Theme(
          data: Theme.of(context).copyWith(
            splashColor: Colors.transparent,
            highlightColor: Colors.transparent,
          ),
          child: BottomNavigationBar(
            currentIndex: _selectedIndex,
            onTap: (index) => setState(() => _selectedIndex = index),
            backgroundColor: Colors.white,
            elevation: 0,
            selectedItemColor: const Color(0xFF0047B3),
            unselectedItemColor: const Color(0xFF94A3B8),
            type: BottomNavigationBarType.fixed,
            items: const [
              BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Home'),
              BottomNavigationBarItem(icon: Icon(Icons.storefront), label: 'Shops'),
              BottomNavigationBarItem(icon: Icon(Icons.map), label: 'Map'),
              BottomNavigationBarItem(icon: Icon(Icons.history), label: 'History'),
              BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF0047B3),
        child: const Icon(Icons.add_business, color: Colors.white),
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const AddShopScreen()),
          );
          if (result == true) {
            _loadData();
          }
        },
      ),
    );
  }

  Widget _buildBodyContent() {
    if (_selectedIndex == 0) return _buildDashboardView();
    if (_selectedIndex == 1) return const MyShopsScreen();
    if (_selectedIndex == 2) return const MapScreen();
    if (_selectedIndex == 3) return const HistoryScreen();
    if (_selectedIndex == 4) return const ProfileScreen();
    return _buildDashboardView();
  }

  Widget _buildDashboardView() {
    double percent = _shops.isEmpty ? 0.0 : (_completedCount / _shops.length).clamp(0.0, 1.0);
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: Row(
          children: [
            Image.asset('assets/logo.png', height: 28),
            const SizedBox(width: 8),
            const Text('Advance Telecom', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ]
        ),
        backgroundColor: const Color(0xFF0047B3),
        elevation: 0,
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications, color: Colors.white),
                onPressed: _openNotifications,
              ),
              if (_unreadNotifs > 0)
                Positioned(
                  right: 12,
                  top: 12,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10)),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text('$_unreadNotifs', style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
                  ),
                ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.cloud_sync, color: Colors.white),
            onPressed: _performSync,
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white70),
            onPressed: _logout,
          )
        ],
      ),
      body: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          children: [
            const SizedBox(height: 10),
            // KPI Header with Progress Ring
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: GlassContainer(
                padding: const EdgeInsets.all(20),
                backgroundColor: const Color(0xFF0047B3),
                borderColor: const Color(0xFF0047B3),
                child: Row(
                  children: [
                    CircularPercentIndicator(
                      radius: 35.0,
                      lineWidth: 6.0,
                      animation: true,
                      percent: percent,
                      center: Text(
                        "$_completedCount",
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0, color: Colors.white),
                      ),
                      circularStrokeCap: CircularStrokeCap.round,
                      progressColor: Colors.white,
                      backgroundColor: Colors.white24,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Welcome Back,', style: TextStyle(color: Colors.white70, fontSize: 14)),
                          Text(_currentUser?.name ?? 'TSO', style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Text(
                                'Shops Completed Today: ${_dailyAverage.toStringAsFixed(0)}',
                                style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13),
                              ),
                              _buildInfoIcon('Number of shops where surveys have been successfully submitted.', color: Colors.white.withOpacity(0.8)),
                            ],
                          ),
                          Row(
                            children: [
                              Text(
                                'Total Assigned: ${_shops.length}',
                                style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 13),
                              ),
                              _buildInfoIcon('Number of shops allocated to you for visitation.', color: Colors.white.withOpacity(0.8)),
                            ],
                          )
                        ],
                      ),
                    )
                  ],
                ),
              ),
            ),

            // Offline Sync Card (Conditional)
            if (_pendingSurveys > 0)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                child: GlassContainer(
                  padding: const EdgeInsets.all(16),
                  backgroundColor: Colors.orange.withOpacity(0.1),
                  borderColor: Colors.orangeAccent,
                  child: Row(
                    children: [
                      const Icon(Icons.cloud_upload, color: Colors.orangeAccent, size: 30),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Text('Pending Sync', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold)),
                                _buildInfoIcon('Surveys completed offline that need internet connection to upload.', color: const Color(0xFF0F172A)),
                              ],
                            ),
                            Text('$_pendingSurveys completed surveys waiting to upload.', style: const TextStyle(color: Color(0xFF475569), fontSize: 12)),
                          ],
                        ),
                      ),
                      GlassButton(
                        text: 'Sync Now',
                        onPressed: _performSync,
                      )
                    ],
                  ),
                ),
              ),

            // Massive Sync Button
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 4,
                  ),
                  icon: const Icon(Icons.cloud_sync, color: Colors.white, size: 28),
                  label: const Text('SYNC ALL DATA TO SERVER', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1.1)),
                  onPressed: _isLoading ? null : _performSync,
                ),
              ),
            ),



            const Padding(
              padding: EdgeInsets.fromLTRB(16, 24, 16, 12),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text('Shops to Visit', style: TextStyle(color: Color(0xFF0F172A), fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ),

            // Shops List
            _shops.isEmpty 
                ? const Padding(
                    padding: EdgeInsets.all(20),
                    child: Text('No assigned shops found. Try Syncing.', style: TextStyle(color: Color(0xFF475569))),
                  )
                : Builder(
                    builder: (context) {
                      final displayShops = _shops.take(4).toList();
                      return ListView.builder(
                        padding: const EdgeInsets.only(top: 0, left: 16, right: 16, bottom: 40),
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: displayShops.length,
                        itemBuilder: (context, index) {
                          final shop = displayShops[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 16.0),
                        child: GlassContainer(
                          padding: const EdgeInsets.all(16),
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
                                child: const Icon(Icons.storefront, color: Color(0xFF0047B3)),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(shop['name'] ?? 'Unknown', style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 16)),
                                    const SizedBox(height: 4),
                                    Text('Owner: ${shop['ownerName'] ?? 'N/A'}', style: const TextStyle(color: Color(0xFF475569), fontSize: 13)),
                                    const SizedBox(height: 2),
                                    Text([shop['address'], shop['area'], shop['city']].where((s) => s != null && s.toString().trim().isNotEmpty).join(', ').isEmpty ? 'N/A' : [shop['address'], shop['area'], shop['city']].where((s) => s != null && s.toString().trim().isNotEmpty).join(', '), style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12),
                              GlassButton(
                                text: 'Start',
                                compact: true,
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => SurveyExecutionScreen(shop: shop),
                                    ),
                                  ).then((_) => _loadData()); // refresh on back
                                },
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
