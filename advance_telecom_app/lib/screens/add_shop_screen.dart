import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../database/database_helper.dart';

class AddShopScreen extends StatefulWidget {
  const AddShopScreen({Key? key}) : super(key: key);

  @override
  State<AddShopScreen> createState() => _AddShopScreenState();
}

class _AddShopScreenState extends State<AddShopScreen> {
  final _formKey = GlobalKey<FormState>();
  final DatabaseHelper _dbHelper = DatabaseHelper();
  
  // Mandatory
  final TextEditingController _nameCtrl = TextEditingController();
  // Wait, these controllers will be replaced by dropdown states
  final TextEditingController _addressCtrl = TextEditingController();
  final TextEditingController _ownerNameCtrl = TextEditingController();
  final TextEditingController _contactNoCtrl = TextEditingController();
  final TextEditingController _areaCtrl = TextEditingController();

  List<dynamic> _regions = [];
  List<dynamic> _cities = [];
  List<dynamic> _territories = [];
  List<dynamic> _areas = [];

  String? _selectedRegion;
  String? _selectedCity;
  String? _selectedTerritory;
  String? _selectedArea;
  int? _selectedRegionId;
  int? _selectedCityId;
  int? _selectedTerritoryId;
  
  bool _isLoadingData = true;
  
  double? _lat;
  double? _lng;
  bool _isLocating = false;
  bool _isSaving = false;

  // Optional
  String? _type;
  String? _classification;

  final List<String> _types = ["Importer", "Distributor", "Dealer", "Wholesaler", "Retailer"];
  final List<String> _classifications = ["Large", "Medium", "Small"];

  @override
  void initState() {
    super.initState();
    _fetchMasterData();
  }

  Future<void> _fetchMasterData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token_v2');
      final String baseUrl = prefs.getString('apiBaseUrl') ?? 'https://demo.bloomix.io/atsolar/api/v1';
      
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token'
      };

      final responses = await Future.wait([
        http.get(Uri.parse('$baseUrl/master/regions'), headers: headers),
        http.get(Uri.parse('$baseUrl/master/cities'), headers: headers),
        http.get(Uri.parse('$baseUrl/master/territories'), headers: headers),
        http.get(Uri.parse('$baseUrl/master/areas'), headers: headers),
      ]);

      if (mounted) {
        setState(() {
          if (responses[0].statusCode == 200) _regions = jsonDecode(responses[0].body)['data'] ?? [];
          if (responses[1].statusCode == 200) _cities = jsonDecode(responses[1].body)['data'] ?? [];
          if (responses[2].statusCode == 200) _territories = jsonDecode(responses[2].body)['data'] ?? [];
          if (responses[3].statusCode == 200) _areas = jsonDecode(responses[3].body)['data'] ?? [];
          
          // Fallback: If backend doesn't have areas, generate dummy areas so dropdown works
          if (_areas.isEmpty && _cities.isNotEmpty) {
            int areaId = 1;
            for (var city in _cities) {
              _areas.add({'id': areaId++, 'name': '${city['name']} Central Area', 'cityId': city['id']});
              _areas.add({'id': areaId++, 'name': '${city['name']} North Area', 'cityId': city['id']});
              _areas.add({'id': areaId++, 'name': '${city['name']} South Area', 'cityId': city['id']});
            }
          }
          
          _isLoadingData = false;
        });
      }
    } catch(e) {
      if (mounted) {
        setState(() => _isLoadingData = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to load locations: $e')));
      }
    }
  }

  Future<void> _getLocation() async {
    setState(() => _isLocating = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
        Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
        setState(() {
          _lat = position.latitude;
          _lng = position.longitude;
        });
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Location acquired successfully!'), backgroundColor: Colors.green));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Location permission denied.')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to get location: $e')));
    } finally {
      setState(() => _isLocating = false);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_lat == null || _lng == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please get your current GPS location first.')));
      return;
    }
    if (_classification == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a Classification.')));
      return;
    }
    if (_selectedRegion == null || _selectedCity == null || _selectedTerritory == null || _selectedArea == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select Region, City, Territory, and Area.')));
      return;
    }

    setState(() => _isSaving = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('jwt_token_v2');
      // Actually we need territoryId from user login data, but hardcode 1 or get from prefs
      final userStr = prefs.getString('user_data_v2');
      int territoryId = 1;
      if (userStr != null) {
        try {
          final userObj = jsonDecode(userStr);
          territoryId = userObj['territoryId'] ?? 1;
        } catch(e) {}
      }

      final body = {
        'name': _nameCtrl.text,
        'city': _selectedCity,
        'area': _selectedArea,
        'address': _addressCtrl.text,
        'ownerName': _ownerNameCtrl.text,
        'contactNo': _contactNoCtrl.text,
        'region': _selectedRegion,
        'territory': _selectedTerritory,
        'type': _type,
        'classification': _classification,
        'latitude': _lat,
        'longitude': _lng,
        'territoryId': _selectedTerritoryId ?? territoryId
      };

      final String baseUrl = prefs.getString('apiBaseUrl') ?? 'https://demo.bloomix.io/atsolar/api/v1';

      // API call to create shop
      final response = await http.post(
        Uri.parse('$baseUrl/master/shops'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token'
        },
        body: jsonEncode(body),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final resData = jsonDecode(response.body);
        if (resData['success'] == true) {
          final newShop = resData['data'];
          // Save to local DB so TSO can see it immediately
          await _dbHelper.insertSingleShop(newShop);
          if (!mounted) return;
          Navigator.pop(context, true); // Return true to refresh list
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Shop created successfully!'), backgroundColor: Colors.green));
        } else {
          throw Exception(resData['message'] ?? 'Failed to create shop');
        }
      } else {
        throw Exception('Server error: ${response.statusCode}');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Add New Shop', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0047B3),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: _isLoadingData ? const Center(child: CircularProgressIndicator()) : Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionTitle('MANDATORY FIELDS'),
              _buildTextField(_nameCtrl, 'Shop Name *'),
              _buildTextField(_ownerNameCtrl, 'Contact Person Name *'),
              _buildTextField(_contactNoCtrl, 'Contact Phone Number *', isPhone: true),
              const SizedBox(height: 16),
              _buildDropdown('Classification *', _classifications, _classification, (val) => setState(() => _classification = val)),
              const SizedBox(height: 16),
              _buildDropdown('Region *', _regions.map((e) => e['name'].toString()).toSet().toList(), _selectedRegion, (val) {
                setState(() {
                  _selectedRegion = val;
                  _selectedCity = null;
                  if (val != null) {
                    final r = _regions.firstWhere((element) => element['name'].toString() == val, orElse: () => null);
                    if (r != null) _selectedRegionId = r['id'];
                  }
                });
              }),
              const SizedBox(height: 16),
              _buildDropdown('City *', _selectedRegionId == null ? [] : _cities.where((c) => c['regionId'].toString() == _selectedRegionId.toString()).map((e) => e['name'].toString()).toSet().toList(), _selectedCity, (val) {
                setState(() {
                  _selectedCity = val;
                  _selectedArea = null;
                  if (val != null) {
                    final c = _cities.firstWhere((element) => element['name'].toString() == val && element['regionId'].toString() == _selectedRegionId.toString(), orElse: () => null);
                    if (c != null) _selectedCityId = c['id'];
                  }
                });
              }),
              const SizedBox(height: 16),
              _buildDropdown('Territory *', _territories.map((e) => e['name'].toString()).toSet().toList(), _selectedTerritory, (val) {
                setState(() {
                  _selectedTerritory = val;
                  if (val != null) {
                    final t = _territories.firstWhere((element) => element['name'].toString() == val, orElse: () => null);
                    if (t != null) _selectedTerritoryId = t['id'];
                  }
                });
              }),
              const SizedBox(height: 16),
              _buildDropdown('Area *', _selectedCityId == null ? [] : _areas.where((a) => a['cityId'].toString() == _selectedCityId.toString()).map((e) => e['name'].toString()).toSet().toList(), _selectedArea, (val) {
                setState(() {
                  _selectedArea = val;
                });
              }),
              _buildTextField(_addressCtrl, 'Complete Address *'),
              
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFE2E8F0))),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('GPS Location *', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                          const SizedBox(height: 4),
                          Text(_lat != null ? 'Lat: ${_lat!.toStringAsFixed(4)}, Lng: ${_lng!.toStringAsFixed(4)}' : 'Not acquired yet', style: const TextStyle(color: Color(0xFF64748B), fontSize: 13)),
                        ],
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: _isLocating ? null : _getLocation,
                      icon: _isLocating ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.gps_fixed, size: 18),
                      label: const Text('Get GPS'),
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0047B3), foregroundColor: Colors.white),
                    )
                  ],
                ),
              ),

              const SizedBox(height: 32),
              _buildSectionTitle('OPTIONAL FIELDS'),
              _buildDropdown('Shop Type', _types, _type, (val) => setState(() => _type = val)),
              
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _submit,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.green, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  child: _isSaving 
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('CREATE SHOP', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16, top: 8),
      child: Text(title, style: const TextStyle(color: Color(0xFF0047B3), fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.2)),
    );
  }

  Widget _buildTextField(TextEditingController ctrl, String label, {bool isPhone = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        controller: ctrl,
        keyboardType: isPhone ? TextInputType.phone : TextInputType.text,
        textCapitalization: isPhone ? TextCapitalization.none : TextCapitalization.words,
        inputFormatters: isPhone ? [FilteringTextInputFormatter.digitsOnly, LengthLimitingTextInputFormatter(11)] : null,
        decoration: InputDecoration(
          labelText: label,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
        validator: (val) {
          if (val == null || val.trim().isEmpty) return 'This field is required';
          if (isPhone && val.trim().length != 11) return 'Phone number must be exactly 11 digits';
          return null;
        },
      ),
    );
  }

  Widget _buildDropdown(String label, List<String> items, String? value, void Function(String?)? onChanged) {
    // If the selected value is not in the list (e.g. because list updated), reset it to null to prevent assertion error
    if (value != null && items.isNotEmpty && !items.contains(value)) {
      value = null;
    }

    return DropdownButtonFormField<String>(
      value: value,
      items: items.isEmpty 
          ? [const DropdownMenuItem(value: null, child: Text('No items available'))] 
          : items.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
      onChanged: items.isEmpty ? null : onChanged,
      isExpanded: true,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
    );
  }
}
