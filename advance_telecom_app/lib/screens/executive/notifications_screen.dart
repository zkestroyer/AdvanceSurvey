import 'package:flutter/material.dart';
import '../../services/executive_service.dart';
import '../../models/executive_models.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  @override
  _NotificationsScreenState createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ExecutiveService _service = ExecutiveService();
  List<ExecutiveNotification> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final notifications = await _service.getNotifications();
    setState(() {
      _notifications = notifications;
      _isLoading = false;
    });
  }

  Future<void> _markRead(int index) async {
    final notif = _notifications[index];
    if (!notif.isRead) {
      final success = await _service.markNotificationRead(notif.id);
      if (success) {
        setState(() {
          _notifications[index] = ExecutiveNotification(
            id: notif.id,
            notificationId: notif.notificationId,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            isRead: true,
            createdAt: notif.createdAt,
          );
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Alerts & Notifications')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? const Center(child: Text('No notifications'))
              : ListView.builder(
                  itemCount: _notifications.length,
                  itemBuilder: (context, index) {
                    final notif = _notifications[index];
                    return Card(
                      color: notif.isRead ? Colors.white : const Color(0xFFE9F2FB),
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: ListTile(
                        leading: Icon(
                          notif.type == 'alert' ? Icons.warning : Icons.info,
                          color: notif.type == 'alert' ? Colors.red : Colors.blue,
                        ),
                        title: Text(notif.title, style: TextStyle(fontWeight: notif.isRead ? FontWeight.normal : FontWeight.bold)),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(notif.message),
                            const SizedBox(height: 4),
                            Text(notif.createdAt.split('T')[0], style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        ),
                        onTap: () => _markRead(index),
                      ),
                    );
                  },
                ),
    );
  }
}
