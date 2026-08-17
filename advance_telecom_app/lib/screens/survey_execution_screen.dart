import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../database/database_helper.dart';
import '../data/catalog_data.dart';

class SurveyExecutionScreen extends StatefulWidget {
  final Map<String, dynamic> shop;
  const SurveyExecutionScreen({Key? key, required this.shop}) : super(key: key);

  static final Map<int, Map<String, dynamic>> draftResponses = {};
  static final Map<int, int> draftStep = {};
  static final Map<int, bool> draftCheckedIn = {};
  static final Map<int, Position?> draftPosition = {};
  static final Map<int, List<File>> draftPhotos = {};
  static final Map<int, Map<int, int>> draftProductCounts = {};

  @override
  State<SurveyExecutionScreen> createState() => _SurveyExecutionScreenState();
}

class _SurveyExecutionScreenState extends State<SurveyExecutionScreen> {
  final DatabaseHelper _dbHelper = DatabaseHelper();
  Map<String, dynamic>? _surveyConfig;
  List<dynamic> _sections = [];
  Map<String, dynamic> _responses = {};
  
  bool _isCheckedIn = false;
  Position? _currentPosition;
  bool _isCheckingIn = false;
  
  int _currentStep = 0; // 0 is CheckIn, 1..N are sections, N+1 is Proof
  Map<int, int> _productCounts = {};
  Position? _checkoutPosition;
  bool _isGettingCheckoutPosition = false;

  final ImagePicker _picker = ImagePicker();
  List<File> _photos = [];
  String _tsoPhone = '';

  @override
  void initState() {
    super.initState();
    _loadUserPhone();
    
    // Load dynamic product catalog
    loadCatalogFromDb(_dbHelper).then((_) {
      final int shopId = widget.shop['id'] as int;
      
      if (SurveyExecutionScreen.draftResponses.containsKey(shopId)) {
        _responses = SurveyExecutionScreen.draftResponses[shopId]!;
        _currentStep = SurveyExecutionScreen.draftStep[shopId] ?? 0;
        _isCheckedIn = SurveyExecutionScreen.draftCheckedIn[shopId] ?? false;
        _currentPosition = SurveyExecutionScreen.draftPosition[shopId];
        _photos = SurveyExecutionScreen.draftPhotos[shopId] ?? [];
        _productCounts = SurveyExecutionScreen.draftProductCounts[shopId] ?? {};
        _loadActiveSurvey(isDraft: true);
      } else {
        SurveyExecutionScreen.draftResponses[shopId] = _responses;
        _loadActiveSurvey(isDraft: false);
      }
    });
  }

  Future<void> _loadUserPhone() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data_v2');
    if (userData != null) {
      try {
        final user = jsonDecode(userData);
        setState(() {
          _tsoPhone = user['mobileNumber'] ?? '';
        });
      } catch(e) {}
    }
  }

  @override
  void dispose() {
    final int shopId = widget.shop['id'] as int;
    SurveyExecutionScreen.draftStep[shopId] = _currentStep;
    SurveyExecutionScreen.draftCheckedIn[shopId] = _isCheckedIn;
    SurveyExecutionScreen.draftPosition[shopId] = _currentPosition;
    SurveyExecutionScreen.draftPhotos[shopId] = _photos;
    SurveyExecutionScreen.draftProductCounts[shopId] = _productCounts;
    super.dispose();
  }

  Future<void> _loadActiveSurvey({bool isDraft = false}) async {
    final surveys = await _dbHelper.getSurveys();
    if (surveys.isNotEmpty) {
      final config = surveys.first;
      final parsed = jsonDecode(config['schemaJson']);
      List<dynamic> loadedSections = List.from(parsed['sections'] ?? []);
      
      // Sort sections by orderIndex if available
      try {
        loadedSections.sort((a, b) {
          int orderA = a['orderIndex'] is int ? a['orderIndex'] : int.tryParse(a['orderIndex']?.toString() ?? '0') ?? 0;
          int orderB = b['orderIndex'] is int ? b['orderIndex'] : int.tryParse(b['orderIndex']?.toString() ?? '0') ?? 0;
          return orderA.compareTo(orderB);
        });
        for (var section in loadedSections) {
          if (section['questions'] != null && section['questions'] is List) {
            List<dynamic> questions = List.from(section['questions']);
            questions.sort((a, b) {
              int orderA = a['orderIndex'] is int ? a['orderIndex'] : int.tryParse(a['orderIndex']?.toString() ?? '0') ?? 0;
              int orderB = b['orderIndex'] is int ? b['orderIndex'] : int.tryParse(b['orderIndex']?.toString() ?? '0') ?? 0;
              return orderA.compareTo(orderB);
            });
            section['questions'] = questions;
          }
        }
      } catch (e) {
        print('Sorting failed: $e');
      }

      if (mounted) {
        setState(() {
          _surveyConfig = parsed;
          _sections = loadedSections;

          if (!isDraft) {
            // Auto-fill from Shop details only if it's a new survey
            for (var section in _sections) {
              if (section['questions'] != null) {
                bool isSourceSection = section['title'] != null && section['title'].toString().toLowerCase().contains('source');
                for (var q in section['questions']) {
                  final label = (q['questionText'] ?? '').toString().toLowerCase();
                  final id = q['id'].toString();
                  if (label.contains('outlet') && label.contains('name')) {
                    _responses[id] = widget.shop['name'] ?? '';
                  } else if (label == 'city' || label == 'city / town' || label.contains('city / town')) {
                    _responses[id] = widget.shop['city'] ?? '';
                  } else if (!isSourceSection && (label.contains('address') || label.contains('outlet address'))) {
                    _responses[id] = widget.shop['address'] ?? widget.shop['area'] ?? ''; 
                  } else if (!isSourceSection && label.contains('contact person')) {
                    _responses[id] = widget.shop['ownerName'] ?? '';
                  } else if (label.contains('contact number') || label.contains('phone')) {
                    _responses[id] = widget.shop['contactNo'] ?? '';
                  }
                }
              }
            }
          }
        });
      }
    }
  }

  bool _isQuestionVisible(dynamic question) {
    if (question['parentQuestionId'] != null) {
      String parentId = question['parentQuestionId'].toString();
      if (question['id'].toString().contains('_copy_')) {
        String suffix = question['id'].toString().split('_copy_')[1];
        parentId = '${parentId}_copy_$suffix';
      }
      final expectedVal = question['showIfParentValue']?.toString().toLowerCase();
      final actualVal = _responses[parentId]?.toString().toLowerCase();
      if (actualVal != expectedVal) return false;
    }
    
    // Check Brand/Model dynamic visibility
    final label = (question['questionText'] ?? '').toString().toLowerCase();
    if (label.contains('model') && (question['options'] != null && question['options'].toString().length > 5)) {
      String? selectedBrand;
      final sectionId = question['sectionId']?.toString();
      String suffix = question['id'].toString().contains('_copy_') ? '_copy_${question['id'].toString().split('_copy_')[1]}' : '';
      
      _responses.forEach((key, val) {
        bool matchesSuffix = suffix.isEmpty ? !key.contains('_copy_') : key.endsWith(suffix);
        if (matchesSuffix) {
          String origKey = key.split('_copy_')[0];
          for (var section in _sections) {
            for (var q in section['questions']) {
              if (q['id'].toString() == origKey && 
                  q['sectionId']?.toString() == sectionId &&
                  q['questionText'].toString().toLowerCase().contains('brand')) {
                selectedBrand = val?.toString().toLowerCase();
              }
            }
          }
        }
      });
      if (selectedBrand != null && selectedBrand!.trim().isNotEmpty) {
        bool labelMentionsTrina = label.contains('trina');
        bool labelMentionsCanadian = label.contains('canadian');
        bool labelMentionsJinko = label.contains('jinko');
        bool labelMentionsLongi = label.contains('longi');
        
        if ((labelMentionsTrina && !selectedBrand!.contains('trina')) ||
            (labelMentionsCanadian && !selectedBrand!.contains('canadian')) ||
            (labelMentionsJinko && !selectedBrand!.contains('jinko')) ||
            (labelMentionsLongi && !selectedBrand!.contains('longi'))) {
          return false;
        }
        
        List<dynamic> options = jsonDecode(question['options']);
        if (!labelMentionsTrina && !labelMentionsCanadian && !labelMentionsJinko && !labelMentionsLongi) {
           if (selectedBrand!.contains('trina')) {
              options = options.where((o) => ['vertex', 'tall', 'max'].any((k) => o.toString().toLowerCase().contains(k))).toList();
           } else if (selectedBrand!.contains('canadian')) {
              options = options.where((o) => ['hiku', 'biku', 'kumax', 'hihero'].any((k) => o.toString().toLowerCase().contains(k))).toList();
           } else if (selectedBrand!.contains('jinko')) {
              options = options.where((o) => ['tiger', 'swan', 'cheetah'].any((k) => o.toString().toLowerCase().contains(k))).toList();
           } else if (selectedBrand!.contains('longi')) {
              options = options.where((o) => o.toString().toLowerCase().contains('hi-mo')).toList();
           }
        }
        
        if (options.isEmpty) {
          return false;
        }
      }
    }
    
    return true;
  }

  Future<void> _performCheckIn() async {
    setState(() => _isCheckingIn = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) throw Exception('Location services are disabled.');

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permissions are denied');
        }
      }

      final position = await Geolocator.getCurrentPosition();
      
      final shopLat = (widget.shop['lat'] as num?)?.toDouble() ?? 0.0;
      final shopLng = (widget.shop['lng'] as num?)?.toDouble() ?? 0.0;

      if (shopLat != 0 && shopLng != 0) {
        final distance = Geolocator.distanceBetween(
          position.latitude, position.longitude,
          shopLat, shopLng
        );
        if (distance > 200) {
          _responses['redFlag'] = 'true';
          _responses['distance_off'] = (distance / 1000).toStringAsFixed(2);
          
          setState(() {
            _currentPosition = position;
            _isCheckedIn = true;
            _currentStep = 1; // Proceed to first section
          });
          
          if (!mounted) return;
          showDialog(
            context: context,
            builder: (ctx) => AlertDialog(
              backgroundColor: Colors.white,
              title: const Text('⚠️ Location Red Flag', style: TextStyle(color: Colors.redAccent)),
              content: Text('You are ${(distance / 1000).toStringAsFixed(2)}km away from the shop location. Check-in has been recorded with a red flag.', style: const TextStyle(color: Color(0xFF0F172A))),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('OK', style: TextStyle(color: Color(0xFF0047B3))),
                )
              ],
            )
          );
          return;
        }
      }

      setState(() {
        _currentPosition = position;
        _isCheckedIn = true;
        _currentStep = 1; // Proceed to first section
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Check-in Failed: $e')));
    } finally {
      setState(() => _isCheckingIn = false);
    }
  }

  Future<void> _fetchCheckoutPosition() async {
    setState(() => _isGettingCheckoutPosition = true);
    try {
      final position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      setState(() {
        _checkoutPosition = position;
        _responses['checkout_lat'] = position.latitude;
        _responses['checkout_lng'] = position.longitude;
        _responses['checkout_time'] = DateTime.now().toIso8601String();
      });
    } catch (e) {
      print('Failed to get checkout position: $e');
    } finally {
      setState(() => _isGettingCheckoutPosition = false);
    }
  }

  Future<void> _takePhoto() async {
    final photo = await _picker.pickImage(
      source: ImageSource.camera, 
      imageQuality: 50, 
      maxWidth: 800, 
      maxHeight: 800
    );
    if (photo != null) {
      setState(() {
        _photos.add(File(photo.path));
      });
    }
  }

  void _removePhoto(int index) {
    setState(() {
      _photos.removeAt(index);
    });
  }

  Future<void> _submitSurvey() async {
    if (!_isCheckedIn) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please Check-In first!')));
      return;
    }

    if (_photos.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please take at least one shop photo!')));
      setState(() => _currentStep = 1);
      return;
    }

    for (int stepIndex = 2; stepIndex < _sections.length + 2; stepIndex++) {
      final section = _sections[stepIndex - 2];
      final title = (section['title'] ?? '').toString().toLowerCase();
      bool isCompulsorySection = title.contains('outlet details') || 
                                 title.contains('displays') || 
                                 title.contains('stock') || 
                                 title.contains('source');
      
      if (isCompulsorySection) {
        final questions = section['questions'] ?? [];
        for (var q in questions) {
          if (_isQuestionVisible(q)) {
            final qText = (q['questionText'] ?? '').toString().toLowerCase();
            bool isOptional = qText.contains('email address') || qText == 'email' || qText.contains('optional');
            final id = q['id'].toString();
            if (!isOptional && (_responses[id] == null || _responses[id].toString().trim().isEmpty)) {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Please fill all mandatory fields on Step ${stepIndex + 1} (${section['title']}) before proceeding.')));
              setState(() => _currentStep = stepIndex); // Jump to the missing step
              return;
            }
          }
        }
      }
    }

    List<String> photoBase64List = [];
    for (var file in _photos) {
      final bytes = await file.readAsBytes();
      photoBase64List.add(base64Encode(bytes));
    }
    if (photoBase64List.isNotEmpty) {
      _responses['photo_proofs'] = jsonEncode(photoBase64List);
    }

    await _dbHelper.insertPendingResponse({
      'surveyId': _surveyConfig!['id'],
      'shopId': widget.shop['id'],
      'tsoId': 1, 
      'responseJson': jsonEncode(_responses),
      'checkinLat': _currentPosition?.latitude,
      'checkinLng': _currentPosition?.longitude,
      'timestamp': DateTime.now().toIso8601String(),
    });

    final int shopId = widget.shop['id'] as int;
    SurveyExecutionScreen.draftResponses.remove(shopId);
    SurveyExecutionScreen.draftStep.remove(shopId);
    SurveyExecutionScreen.draftCheckedIn.remove(shopId);
    SurveyExecutionScreen.draftPosition.remove(shopId);
    SurveyExecutionScreen.draftPhotos.remove(shopId);
    SurveyExecutionScreen.draftProductCounts.remove(shopId);

    if (!mounted) return;
    
    // Show confirmation dialog instead of just a snackbar
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 28),
            SizedBox(width: 8),
            Text('Success!', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
          ],
        ),
        content: const Text('Your survey has been saved successfully. Please make sure to Sync your data when you have internet access.', style: TextStyle(color: Color(0xFF0F172A), fontSize: 16)),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx); // Close dialog
              Navigator.pop(context); // Close survey screen
            },
            child: const Text('OK', style: TextStyle(color: Color(0xFF0047B3), fontSize: 18, fontWeight: FontWeight.bold)),
          )
        ],
      )
    );
  }

  bool _validateCurrentStep() {
    if (_currentStep == 0) {
      if (!_isCheckedIn) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please Check-In first!'), backgroundColor: Colors.red));
        return false;
      }
      return true;
    }
    
    if (_currentStep == 1) {
      if (_photos.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please take at least one photo!'), backgroundColor: Colors.red));
        return false;
      }
      return true;
    }
    
    if (_currentStep >= 2 && _currentStep <= _sections.length + 1) {
      final section = _sections[_currentStep - 2];
      final title = (section['title'] ?? '').toString().toLowerCase();
      bool isCompulsorySection = title.contains('outlet details') || 
                                 title.contains('displays') || 
                                 title.contains('stock') || 
                                 title.contains('source');
      
      if (!isCompulsorySection) {
        return true; // Let them skip optional pages
      }
      final questions = section['questions'] ?? [];
      for (var q in questions) {
        if (_isQuestionVisible(q)) {
          final qText = (q['questionText'] ?? '').toString().toLowerCase();
          bool isOptional = qText.contains('email address') || qText == 'email' || qText.contains('optional');
          final id = q['id'].toString();
          if (!isOptional && (_responses[id] == null || _responses[id].toString().trim().isEmpty)) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Please fill all mandatory fields on this page.'), backgroundColor: Colors.red),
            );
            return false;
          }
        }
      }
      return true;
    }
    return true;
  }

  void _showStepNavigationSheet() {
    int totalSteps = _sections.length + 3;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Navigate to Step', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const SizedBox(height: 10),
              Expanded(
                child: ListView.builder(
                  itemCount: totalSteps,
                  itemBuilder: (context, index) {
                    String title;
                    if (index == 0) title = 'Check In';
                    else if (index == 1) title = 'Shop Photos';
                    else if (index == totalSteps - 1) title = 'Review & Submit';
                    else title = (_sections[index - 2]['title'] ?? '').toString().replaceAll(RegExp(r'^\d+\.\s*'), '');

                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: _currentStep == index ? const Color(0xFF0047B3) : const Color(0xFFE2E8F0),
                        child: Text('${index + 1}', style: TextStyle(color: _currentStep == index ? Colors.white : const Color(0xFF475569))),
                      ),
                      title: Text(title, style: TextStyle(color: const Color(0xFF0F172A), fontWeight: _currentStep == index ? FontWeight.bold : FontWeight.normal)),
                      onTap: () {
                        if (index > _currentStep) {
                          if (!_validateCurrentStep()) {
                            Navigator.pop(context);
                            return;
                          }
                        }
                        setState(() => _currentStep = index);
                        Navigator.pop(context);
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        );
      }
    );
  }

  Widget _buildStepIndicator() {
    int totalSteps = _sections.length + 3;
    int totalFields = 2;
    int filledFields = 0;
    
    if (_isCheckedIn) filledFields++;
    if (_photos.isNotEmpty) filledFields++;

    for (var section in _sections) {
      final questions = section['questions'] ?? [];
      for (var q in questions) {
        if (_isQuestionVisible(q)) {
          totalFields++;
          final id = q['id'].toString();
          if (_responses[id] != null && _responses[id].toString().trim().isNotEmpty) {
            filledFields++;
          }
        }
      }
    }
    
    double progress = totalFields == 0 ? 0.0 : (filledFields / totalFields);
    String currentSectionName;
    if (_currentStep == 0) currentSectionName = 'Check In';
    else if (_currentStep == 1) currentSectionName = 'Shop Photos';
    else if (_currentStep == totalSteps - 1) currentSectionName = 'Review & Submit';
    else currentSectionName = (_sections[_currentStep - 2]['title'] ?? '').toString().replaceAll(RegExp(r'^\d+\.\s*'), '');
    
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.shop['name'] ?? 'Shop', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF0F172A))),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 14, color: Color(0xFF0047B3)),
                        const SizedBox(width: 4),
                        Text('${widget.shop['area'] ?? ''}, ${widget.shop['city'] ?? ''}'.trim().replaceAll(RegExp(r'^,\s*'), ''), style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(DateTime.now().toIso8601String().split('T')[0], style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                  Text('${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}', style: const TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(border: Border.all(color: Colors.green.withOpacity(0.5)), borderRadius: BorderRadius.circular(16), color: Colors.green.withOpacity(0.1)),
                    child: Row(
                      children: [
                        const Icon(Icons.gps_fixed, size: 12, color: Colors.green),
                        const SizedBox(width: 4),
                        Text(_isCheckedIn ? 'GPS Verified' : 'No GPS', style: const TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(border: Border.all(color: Colors.orange.withOpacity(0.5)), borderRadius: BorderRadius.circular(16), color: Colors.orange.withOpacity(0.1)),
                    child: const Row(
                      children: [
                        Icon(Icons.wifi, size: 12, color: Colors.orange),
                        SizedBox(width: 4),
                        Text('Pending Sync', style: TextStyle(color: Colors.orange, fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: _showStepNavigationSheet,
                child: Text('Step ${_currentStep + 1}/$totalSteps', style: const TextStyle(color: Color(0xFF0047B3), fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                onTap: _showStepNavigationSheet,
                child: Row(
                  children: [
                    Text('Step ${_currentStep + 1} - $currentSectionName', style: const TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.bold, fontSize: 14)),
                    const Icon(Icons.arrow_drop_down, color: Color(0xFF0F172A)),
                  ],
                ),
              ),
              Text('${(progress * 100).toInt()}%', style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: progress,
            backgroundColor: const Color(0xFFE2E8F0),
            valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF0047B3)),
            minHeight: 6,
            borderRadius: BorderRadius.circular(3),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckInStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('VERIFY MY LOCATION', style: TextStyle(color: Color(0xFF0F172A), fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text('You must check in to verify your physical presence at the shop.', style: TextStyle(color: Color(0xFF475569))),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: Colors.blue.withOpacity(0.05), borderRadius: BorderRadius.circular(8)),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('• Ensure Location Services are enabled.', style: TextStyle(color: Color(0xFF0F172A), fontSize: 13)),
              SizedBox(height: 4),
              Text('• Internet connection is required for data synchronization.', style: TextStyle(color: Color(0xFF0F172A), fontSize: 13)),
              SizedBox(height: 4),
              Text('• Take clear and visible shop photographs before submission.', style: TextStyle(color: Color(0xFF0F172A), fontSize: 13)),
            ],
          ),
        ),
        const SizedBox(height: 32),
        
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))]
          ),
          child: Column(
            children: [
              Icon(Icons.location_on, size: 64, color: _isCheckedIn ? Colors.green : const Color(0xFF0047B3)),
              const SizedBox(height: 16),
              Text(_isCheckedIn ? 'GPS Verified' : 'Check-in Required', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const SizedBox(height: 24),
              if (!_isCheckedIn)
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0047B3),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _isCheckingIn ? null : _performCheckIn,
                    child: _isCheckingIn 
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Verify Location', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
              if (_isCheckedIn && _currentPosition != null) ...[
                Text('Lat: ${_currentPosition!.latitude}\nLng: ${_currentPosition!.longitude}', textAlign: TextAlign.center, style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                SizedBox(
                  height: 150,
                  width: double.infinity,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: GoogleMap(
                      initialCameraPosition: CameraPosition(
                        target: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                        zoom: 15,
                      ),
                      markers: {
                        Marker(
                          markerId: const MarkerId('current_location'),
                          position: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                        )
                      },
                      zoomControlsEnabled: false,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
        
        if (_isCheckedIn) ...[
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0047B3),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                if (_validateCurrentStep()) {
                  setState(() => _currentStep = 1);
                }
              },
              child: const Text('Next Step', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ),
        ]
      ],
    );
  }

  Widget _buildSectionStep(dynamic section) {
    final questions = section['questions'] ?? [];
    int sectionIndex = _sections.indexOf(section);
    int count = _productCounts[sectionIndex] ?? 1;
    bool isProductSection = sectionIndex >= 1 && sectionIndex <= 5; // Skip index 0 (Outlet Details), include up to C&I ESS (index 5)
    String sectionTitle = (section['title'] ?? '').toString().replaceAll(RegExp(r'^\d+\.\s*'), '');
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(sectionTitle, style: const TextStyle(color: Color(0xFF0F172A), fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 24),
        ...List.generate(count, (productIndex) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isProductSection && count > 1) 
                 Padding(
                   padding: const EdgeInsets.symmetric(vertical: 12.0),
                   child: Row(
                     mainAxisAlignment: MainAxisAlignment.spaceBetween,
                     children: [
                       Text('Product ${productIndex + 1}', style: const TextStyle(color: Color(0xFF0047B3), fontWeight: FontWeight.bold, fontSize: 18)),
                       if (productIndex > 0)
                         IconButton(
                           icon: const Icon(Icons.remove_circle_outline, color: Colors.red),
                           onPressed: () {
                             setState(() {
                               _productCounts[sectionIndex] = count - 1;
                               _responses.removeWhere((key, value) => key.endsWith('_copy_$productIndex'));
                             });
                           },
                         ),
                     ],
                   ),
                 ),
              ...questions.expand<Widget>((q) {
                Map<String, dynamic> qClone = Map<String, dynamic>.from(q);
                if (productIndex > 0) {
                  qClone['id'] = '${q['id']}_copy_$productIndex';
                  qClone['originalId'] = q['id'];
                }
                
                List<Widget> widgets = [];
                if (_isQuestionVisible(qClone)) {
                   widgets.add(_buildDynamicField(qClone));
                }
                return widgets;
              }).toList(),
              if (isProductSection && count > 1) const Divider(thickness: 2, height: 32),
            ]
          );
        }),
        if (isProductSection) ...[
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                side: const BorderSide(color: Color(0xFF0047B3), width: 2),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.add_circle_outline, color: Color(0xFF0047B3)),
              label: const Text('Add Another Product', style: TextStyle(color: Color(0xFF0047B3), fontSize: 16, fontWeight: FontWeight.bold)),
              onPressed: () {
                setState(() {
                  _productCounts[sectionIndex] = count + 1;
                });
              },
            ),
          ),
        ],
        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0047B3),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () async {
              FocusScope.of(context).unfocus();
              if (_validateCurrentStep()) {
                if (_currentStep == _sections.length + 1 && _checkoutPosition == null) {
                  // Wait for GPS when moving to Submit Step
                  await _fetchCheckoutPosition();
                }
                setState(() => _currentStep++);
              }
            },
            child: _isGettingCheckoutPosition 
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Next Step', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: TextButton(
            onPressed: () => setState(() => _currentStep--),
            child: const Text('Go Back', style: TextStyle(color: Color(0xFF0047B3), fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }

  Widget _buildPhotoStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('SHOP PHOTOS', style: TextStyle(color: Color(0xFF0F172A), fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text('Please take clear photos of the shop as proof of visit.', style: TextStyle(color: Color(0xFF475569))),
        const SizedBox(height: 32),
        
        if (_photos.isNotEmpty)
          SizedBox(
            height: 120,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _photos.length,
              itemBuilder: (context, index) {
                return Stack(
                  children: [
                    Container(
                      margin: const EdgeInsets.only(right: 12),
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        image: DecorationImage(image: FileImage(_photos[index]), fit: BoxFit.cover),
                      ),
                    ),
                    Positioned(
                      top: 4,
                      right: 16,
                      child: GestureDetector(
                        onTap: () => _removePhoto(index),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                          child: const Icon(Icons.close, color: Colors.white, size: 16),
                        ),
                      ),
                    )
                  ],
                );
              },
            ),
          ),
          
        const SizedBox(height: 16),
        GestureDetector(
          onTap: _takePhoto,
          child: Container(
            height: 100,
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5, style: BorderStyle.solid),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.add_a_photo, size: 32, color: Color(0xFF0047B3)),
                const SizedBox(height: 8),
                Text(_photos.isEmpty ? 'Tap to capture photo' : 'Add another photo', style: TextStyle(color: const Color(0xFF0F172A).withOpacity(0.8))),
              ],
            ),
          ),
        ),

        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0047B3),
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              if (_validateCurrentStep()) {
                setState(() => _currentStep++);
              }
            },
            child: const Text('Next Step', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: TextButton(
            onPressed: () => setState(() => _currentStep--),
            child: const Text('Go Back', style: TextStyle(color: Color(0xFF0047B3), fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('REVIEW & SUBMIT', style: TextStyle(color: Color(0xFF0F172A), fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text('Please review all your answers before submitting. Note that once submitted, you cannot edit this survey.', style: TextStyle(color: Color(0xFF475569))),
        const SizedBox(height: 24),
        
        // Checkout GPS Display
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.my_location, color: Colors.green, size: 20),
                  SizedBox(width: 8),
                  Text('Checkout Location Captured', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 14)),
                ],
              ),
              const SizedBox(height: 12),
              if (_checkoutPosition != null) ...[
                Text('Latitude: ${_checkoutPosition!.latitude.toStringAsFixed(6)}', style: const TextStyle(color: Color(0xFF475569), fontSize: 13)),
                const SizedBox(height: 4),
                Text('Longitude: ${_checkoutPosition!.longitude.toStringAsFixed(6)}', style: const TextStyle(color: Color(0xFF475569), fontSize: 13)),
                const SizedBox(height: 4),
                Text('Time: ${DateTime.now().toString().split('.')[0]}', style: const TextStyle(color: Color(0xFF475569), fontSize: 13)),
              ] else ...[
                const Text('Location pending or unavailable.', style: TextStyle(color: Colors.red, fontSize: 13)),
              ]
            ],
          ),
        ),
        
        const SizedBox(height: 24),
        
        // Comments Box
        const Text('Comments (Optional)', style: TextStyle(color: Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: TextFormField(
            key: const ValueKey('comments_box'),
            textCapitalization: TextCapitalization.sentences,
            maxLines: 3,
            initialValue: _responses['comments']?.toString() ?? _responses['feedback']?.toString() ?? '',
            onChanged: (val) {
              _responses['comments'] = val;
            },
            decoration: const InputDecoration(border: InputBorder.none, hintText: 'Enter any shop-related issues or additional remarks...', hintStyle: TextStyle(color: Color(0xFF94A3B8))),
          ),
        ),
        
        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              padding: const EdgeInsets.symmetric(vertical: 24),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 4,
            ),
            onPressed: _submitSurvey,
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.cloud_upload, color: Colors.white, size: 28),
                SizedBox(width: 12),
                Text('SUBMIT SURVEY', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: TextButton(
            onPressed: () => setState(() => _currentStep--),
            child: const Text('Go Back', style: TextStyle(color: Color(0xFF0047B3), fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
      ],
    );
  }

  Widget _buildDynamicField(dynamic field) {
    final String type = field['type'];
    final String label = field['questionText'];
    final String id = field['id'].toString();

    if (type == 'text') {
      String autoFill = '';
      String labelLower = label.toLowerCase();
      if (labelLower.contains('shop name') || (labelLower.contains('outlet') && labelLower.contains('name'))) autoFill = widget.shop['name']?.toString() ?? '';
      else if (labelLower.contains('city')) autoFill = widget.shop['city']?.toString() ?? '';
      else if (labelLower.contains('area')) autoFill = widget.shop['area']?.toString() ?? '';
      else if (labelLower.contains('address')) autoFill = widget.shop['address']?.toString() ?? '';
      else if (labelLower.contains('person') || labelLower.contains('owner')) autoFill = widget.shop['ownerName']?.toString() ?? '';
      
      if (autoFill.isNotEmpty && (_responses[id] == null || _responses[id].toString().isEmpty)) {
        _responses[id] = autoFill;
      }

      return Padding(
        padding: const EdgeInsets.only(bottom: 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TextFormField(
                key: ValueKey(id),
                textCapitalization: TextCapitalization.words,
                initialValue: _responses[id]?.toString() ?? '',
                onChanged: (val) {
                  setState(() {
                    _responses[id] = val;
                  });
                },
                decoration: const InputDecoration(border: InputBorder.none, hintText: 'Enter response...', hintStyle: TextStyle(color: Color(0xFF94A3B8))),
              ),
            ),
          ],
        ),
      );
    } else if (type == 'number') {
      bool isContact = label.toLowerCase().contains('contact') || label.toLowerCase().contains('phone');
      
      // Auto-fill from shop data if empty
      if (isContact && widget.shop['contactNo'] != null && (_responses[id] == null || _responses[id].toString().isEmpty)) {
        _responses[id] = widget.shop['contactNo']?.toString() ?? '';
      }
      
      return Padding(
        padding: const EdgeInsets.only(bottom: 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TextFormField(
                key: ValueKey(id),
                initialValue: _responses[id]?.toString() ?? '',
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  if (isContact) LengthLimitingTextInputFormatter(11),
                ],
                onChanged: (val) {
                  setState(() {
                    _responses[id] = val;
                  });
                },
                decoration: const InputDecoration(border: InputBorder.none, hintText: 'Enter number...', hintStyle: TextStyle(color: Color(0xFF94A3B8))),
              ),
            ),
          ],
        ),
      );
    } else if (type == 'dropdown' || type == 'radio') {
      List<dynamic> options = field['options'] != null ? jsonDecode(field['options']) : [];
      final String sectionId = field['sectionId']?.toString() ?? '';

      String labelLower = label.toLowerCase();
      String autoFill = '';
      if (labelLower.contains('shop type') || labelLower == 'type') autoFill = widget.shop['type']?.toString() ?? '';
      else if (labelLower.contains('classification')) autoFill = widget.shop['classification']?.toString() ?? '';
      
      if (autoFill.isNotEmpty && (_responses[id] == null || _responses[id].toString().isEmpty)) {
        if (options.any((o) => o.toString().toLowerCase() == autoFill.toLowerCase())) {
          _responses[id] = options.firstWhere((o) => o.toString().toLowerCase() == autoFill.toLowerCase());
        }
      }

      if (label.toLowerCase() == 'brand' || label.toLowerCase().contains('brand')) {
        String sectionTitle = '';
        for (var section in _sections) {
          if (section['id'].toString() == sectionId) {
            sectionTitle = section['title']?.toString() ?? '';
            break;
          }
        }
        final brands = getBrandsForSection(sectionTitle);
        if (brands != null && brands.isNotEmpty) {
           options = brands;
        }
      }
      
      if (label.toLowerCase().contains('model') && options.isNotEmpty) {
        String? selectedBrand;
        String sectionTitle = '';
        String suffix = id.contains('_copy_') ? '_copy_${id.split('_copy_')[1]}' : '';
        
        _responses.forEach((key, val) {
          bool matchesSuffix = suffix.isEmpty ? !key.contains('_copy_') : key.endsWith(suffix);
          if (matchesSuffix) {
            String origKey = key.split('_copy_')[0];
            for (var section in _sections) {
              if (section['id'].toString() == sectionId) {
                sectionTitle = section['title']?.toString() ?? '';
              }
              for (var q in section['questions']) {
                if (q['id'].toString() == origKey && 
                    q['sectionId']?.toString() == sectionId &&
                    q['questionText'].toString().toLowerCase().contains('brand')) {
                  selectedBrand = val?.toString().toLowerCase();
                }
              }
            }
          }
        });

        if (selectedBrand != null && selectedBrand!.trim().isNotEmpty) {
          final catalogModels = getModelsForBrand(selectedBrand!, sectionTitle);
          if (catalogModels != null && catalogModels.isNotEmpty) {
             // Use the models from the catalog
             options = catalogModels;
          } else {
             // Legacy hardcoded logic for old surveys if brand not in new catalog
             bool labelMentionsTrina = label.toLowerCase().contains('trina');
             bool labelMentionsCanadian = label.toLowerCase().contains('canadian');
             bool labelMentionsJinko = label.toLowerCase().contains('jinko');
             bool labelMentionsLongi = label.toLowerCase().contains('longi');
             
             if ((labelMentionsTrina && !selectedBrand!.contains('trina')) ||
                 (labelMentionsCanadian && !selectedBrand!.contains('canadian')) ||
                 (labelMentionsJinko && !selectedBrand!.contains('jinko')) ||
                 (labelMentionsLongi && !selectedBrand!.contains('longi'))) {
               return const SizedBox.shrink();
             }
             
             if (!labelMentionsTrina && !labelMentionsCanadian && !labelMentionsJinko && !labelMentionsLongi) {
                if (selectedBrand!.contains('trina')) {
                   options = options.where((o) => ['vertex', 'tall', 'max'].any((k) => o.toString().toLowerCase().contains(k))).toList();
                } else if (selectedBrand!.contains('canadian')) {
                   options = options.where((o) => ['hiku', 'biku', 'kumax', 'hihero'].any((k) => o.toString().toLowerCase().contains(k))).toList();
                } else if (selectedBrand!.contains('jinko')) {
                   options = options.where((o) => ['tiger', 'swan', 'cheetah'].any((k) => o.toString().toLowerCase().contains(k))).toList();
                } else if (selectedBrand!.contains('longi')) {
                   options = options.where((o) => o.toString().toLowerCase().contains('hi-mo')).toList();
                }
             }
          }
        }
      }
      
      if (options.isEmpty) return const SizedBox.shrink();

      bool hasOther = options.any((o) => o.toString().toLowerCase() == 'other');
      if (!hasOther) {
        options.add('Other');
      }

      bool isCustomString = _responses[id] != null && 
                            !options.any((o) => o.toString() == _responses[id]);
      
      String? dropdownValue;
      if (isCustomString || _responses['${id}_is_other'] == true) {
        dropdownValue = 'Other';
      } else if (_responses[id] != null) {
        dropdownValue = _responses[id];
      }

      return Padding(
        padding: const EdgeInsets.only(bottom: 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  isExpanded: true,
                  menuMaxHeight: 300,
                  hint: const Text('Select an option', style: TextStyle(color: Color(0xFF94A3B8))),
                  value: dropdownValue,
                  icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF0047B3)),
                  onChanged: (String? newValue) {
                    FocusScope.of(context).unfocus();
                    setState(() {
                      if (newValue == 'Other') {
                         _responses['${id}_is_other'] = true;
                         _responses[id] = ' '; // initialize with space
                      } else {
                         _responses['${id}_is_other'] = false;
                         _responses[id] = newValue;
                      }
                    });
                  },
                  items: options.map<DropdownMenuItem<String>>((dynamic value) {
                    return DropdownMenuItem<String>(
                      value: value.toString(),
                      child: Text(value.toString(), style: const TextStyle(color: Color(0xFF0F172A))),
                    );
                  }).toList(),
                ),
              ),
            ),
            if (dropdownValue == 'Other') ...[
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: TextFormField(
                  key: ValueKey('${id}_other'),
                  textCapitalization: TextCapitalization.words,
                  initialValue: _responses[id]?.toString().trim() ?? '',
                  onChanged: (val) {
                    setState(() {
                      _responses['${id}_is_other'] = true;
                      _responses[id] = val;
                    });
                  },
                  decoration: const InputDecoration(border: InputBorder.none, hintText: 'Please specify...', hintStyle: TextStyle(color: Color(0xFF94A3B8))),
                ),
              ),
            ]
          ],
        ),
      );
    } else if (type == 'checkbox') {
      List<dynamic> options = field['options'] != null ? jsonDecode(field['options']) : [];
      if (options.isEmpty) return const SizedBox.shrink();

      return Padding(
        padding: const EdgeInsets.only(bottom: 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
              child: Column(
                children: options.map((opt) {
                  List<String> currentSelections = [];
                  if (_responses[id] != null) {
                    if (_responses[id] is String) {
                      currentSelections = _responses[id].toString().split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
                    } else if (_responses[id] is List) {
                      currentSelections = (_responses[id] as List).map((e) => e.toString()).toList();
                    }
                  }
                  
                  return CheckboxListTile(
                    title: Text(opt.toString(), style: const TextStyle(color: Color(0xFF0F172A))),
                    value: currentSelections.contains(opt.toString()),
                    activeColor: const Color(0xFF0047B3),
                    onChanged: (val) {
                      setState(() {
                        if (val == true) {
                          if (!currentSelections.contains(opt.toString())) currentSelections.add(opt.toString());
                        } else {
                          currentSelections.remove(opt.toString());
                        }
                        _responses[id] = currentSelections.join(', ');
                      });
                    },
                  );
                }).toList(),
              ),
            )
          ],
        ),
      );
    } else if (type == 'date') {
      return Padding(
        padding: const EdgeInsets.only(bottom: 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () async {
                final selectedDate = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now(),
                  firstDate: DateTime(2000),
                  lastDate: DateTime(2100),
                  builder: (context, child) {
                    return Theme(
                      data: Theme.of(context).copyWith(
                        colorScheme: const ColorScheme.light(
                          primary: Color(0xFF0047B3),
                          onPrimary: Colors.white,
                          onSurface: Color(0xFF0F172A),
                        ),
                      ),
                      child: child!,
                    );
                  },
                );
                if (selectedDate != null) {
                  setState(() {
                    _responses[id] = selectedDate.toIso8601String().split('T')[0];
                  });
                }
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _responses[id] ?? 'Select a date',
                      style: TextStyle(
                        color: _responses[id] != null ? const Color(0xFF0F172A) : const Color(0xFF94A3B8),
                        fontSize: 16,
                      ),
                    ),
                    const Icon(Icons.calendar_today, color: Color(0xFF0047B3)),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    } else if (type == 'photo') {
      return Padding(
        padding: const EdgeInsets.only(bottom: 24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Color(0xFF0F172A), fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () async {
                final pic = await _picker.pickImage(source: ImageSource.camera, imageQuality: 50);
                if (pic != null) {
                  final bytes = await pic.readAsBytes();
                  setState(() => _responses[id] = base64Encode(bytes));
                }
              },
              child: Container(
                height: 120,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: _responses[id] != null ? Colors.green.withOpacity(0.1) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _responses[id] != null ? Colors.green : const Color(0xFFE2E8F0)),
                ),
                child: Center(
                  child: Icon(
                    _responses[id] != null ? Icons.check_circle : Icons.camera_alt, 
                    color: _responses[id] != null ? Colors.green : const Color(0xFF0047B3), 
                    size: 32
                  )
                ),
              ),
            )
          ],
        ),
      );
    }
    return const SizedBox.shrink();
  }

  @override
  Widget build(BuildContext context) {
    if (_surveyConfig == null) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(title: Text(widget.shop['name'] ?? 'Survey', style: const TextStyle(color: Colors.white)), backgroundColor: const Color(0xFF0047B3), elevation: 0),
        body: const Center(child: Text('No active surveys synced.', style: TextStyle(color: Color(0xFF475569)))),
      );
    }

    Widget stepContent;
    if (_currentStep == 0) {
      stepContent = _buildCheckInStep();
    } else if (_currentStep == 1) {
      stepContent = _buildPhotoStep();
    } else if (_currentStep > 1 && _currentStep <= _sections.length + 1) {
      stepContent = _buildSectionStep(_sections[_currentStep - 2]);
    } else {
      stepContent = _buildSubmitStep();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Survey Format', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0047B3),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Column(
        children: [
          _buildStepIndicator(),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20.0),
              child: stepContent,
            ),
          ),
        ],
      ),
    );
  }
}
