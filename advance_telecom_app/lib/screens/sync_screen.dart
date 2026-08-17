import 'package:flutter/material.dart';
import '../database/database_helper.dart';
import '../services/sync_engine.dart';
import '../theme/glassmorphism.dart';

class SyncScreen extends StatefulWidget {
  const SyncScreen({Key? key}) : super(key: key);

  @override
  State<SyncScreen> createState() => _SyncScreenState();
}

class _SyncScreenState extends State<SyncScreen> {
  final DatabaseHelper _dbHelper = DatabaseHelper();
  final SyncEngine _syncEngine = SyncEngine();
  
  bool _isSyncing = false;
  int _pendingCount = 0;

  @override
  void initState() {
    super.initState();
    _loadPending();
  }

  Future<void> _loadPending() async {
    final pending = await _dbHelper.getPendingResponses();
    setState(() {
      _pendingCount = pending.length;
    });
  }

  Future<void> _performSync() async {
    setState(() => _isSyncing = true);
    await _syncEngine.syncAll();
    await _loadPending();
    setState(() => _isSyncing = false);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sync Complete!')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.cloud_sync, size: 80, color: _isSyncing ? Colors.cyanAccent : Colors.white54),
            const SizedBox(height: 20),
            Text(
              _isSyncing ? "Syncing in progress..." : "$_pendingCount items pending upload",
              style: const TextStyle(color: Colors.white, fontSize: 18),
            ),
            const SizedBox(height: 40),
            _isSyncing 
              ? const CircularProgressIndicator(color: Colors.cyanAccent)
              : GlassButton(
                  text: 'Sync Now',
                  onPressed: _performSync,
                )
          ],
        ),
      ),
    );
  }
}
