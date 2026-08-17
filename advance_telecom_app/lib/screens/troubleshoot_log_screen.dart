import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../services/auth_service.dart';

class TroubleshootLogScreen extends StatefulWidget {
  const TroubleshootLogScreen({Key? key}) : super(key: key);

  @override
  State<TroubleshootLogScreen> createState() => _TroubleshootLogScreenState();
}

class _TroubleshootLogScreenState extends State<TroubleshootLogScreen> {
  final AuthService _authService = AuthService();
  List<dynamic> _tickets = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTickets();
  }

  Future<void> _fetchTickets() async {
    setState(() => _isLoading = true);
    try {
      final authUrl = await _authService.getBaseUrl();
      final masterUrl = authUrl.replaceAll('/auth', '/master');
      final token = await _authService.getToken();

      final response = await http.get(
        Uri.parse('$masterUrl/tickets'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token'
        },
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          setState(() {
            _tickets = data['data'] ?? [];
          });
        }
      } else {
        throw Exception('Failed to load tickets');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading your issues: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'open':
        return Colors.blue;
      case 'in progress':
      case 'progress':
        return Colors.orange;
      case 'closed':
      case 'resolved':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('My Troubleshoot Log', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0047B3),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchTickets,
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _tickets.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.assignment_turned_in, size: 80, color: Colors.grey[400]),
                      const SizedBox(height: 16),
                      Text('No issues reported yet.', style: TextStyle(fontSize: 18, color: Colors.grey[600])),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchTickets,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _tickets.length,
                    itemBuilder: (context, index) {
                      final ticket = _tickets[index];
                      final status = ticket['status'] ?? 'Open';
                      final date = ticket['createdAt'] != null 
                          ? DateTime.tryParse(ticket['createdAt'])?.toLocal().toString().split('.')[0] ?? ''
                          : '';

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        elevation: 2,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      ticket['subject'] ?? 'No Subject',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _getStatusColor(status).withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(color: _getStatusColor(status)),
                                    ),
                                    child: Text(
                                      status.toUpperCase(),
                                      style: TextStyle(
                                        color: _getStatusColor(status),
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                ticket['message'] ?? 'No description provided.',
                                style: const TextStyle(color: Color(0xFF475569)),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    date,
                                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                                  ),
                                  if (ticket['photo'] != null)
                                    const Row(
                                      children: [
                                        Icon(Icons.image, size: 14, color: Colors.grey),
                                        SizedBox(width: 4),
                                        Text('Attachment', style: TextStyle(fontSize: 12, color: Colors.grey)),
                                      ],
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
