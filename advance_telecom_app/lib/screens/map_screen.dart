import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../database/database_helper.dart';
import '../theme/glassmorphism.dart';
import 'dart:async';

class MapScreen extends StatefulWidget {
  const MapScreen({Key? key}) : super(key: key);

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final DatabaseHelper _dbHelper = DatabaseHelper();
  Set<Marker> _markers = {};
  final Completer<GoogleMapController> _controller = Completer();
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadShops();
  }

  Future<void> _loadShops() async {
    final shops = await _dbHelper.getShops();
    Set<Marker> markers = {};
    double minLat = 90.0;
    double maxLat = -90.0;
    double minLng = 180.0;
    double maxLng = -180.0;

    for (var shop in shops) {
      if (shop['lat'] != null && shop['lng'] != null && shop['lat'] != 0) {
        double lat = (shop['lat'] as num).toDouble();
        double lng = (shop['lng'] as num).toDouble();
        
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;

        markers.add(
          Marker(
            markerId: MarkerId(shop['id'].toString()),
            position: LatLng(lat, lng),
            infoWindow: InfoWindow(
              title: shop['name'],
              snippet: 'Owner: ${shop['ownerName']}',
            ),
            onTap: () {
              showModalBottomSheet(
                context: context,
                backgroundColor: Colors.transparent,
                builder: (context) => GlassContainer(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(shop['name'] ?? '', style: const TextStyle(color: Color(0xFF0047B3), fontSize: 22, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Text('Owner: ${shop['ownerName'] ?? 'N/A'}', style: const TextStyle(color: Color(0xFF475569), fontSize: 16)),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              );
            },
          )
        );
      }
    }

    setState(() {
      _markers = markers;
      _isLoading = false;
    });

    if (markers.isNotEmpty) {
      final GoogleMapController controller = await _controller.future;
      controller.animateCamera(CameraUpdate.newLatLngBounds(
        LatLngBounds(
          southwest: LatLng(minLat, minLng),
          northeast: LatLng(maxLat, maxLng),
        ),
        50.0,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: Color(0xFF0047B3)));
    }

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: _markers.isEmpty 
        ? const Center(child: Text("No shop locations available.", style: TextStyle(color: Color(0xFF475569))))
        : Stack(
            children: [
              GoogleMap(
                initialCameraPosition: const CameraPosition(
                  target: LatLng(24.8607, 67.0011),
                  zoom: 12,
                ),
                markers: _markers,
                onMapCreated: (GoogleMapController controller) {
                  _controller.complete(controller);
                },
                myLocationEnabled: true,
                myLocationButtonEnabled: true,
                zoomControlsEnabled: false,
              ),
              IgnorePointer(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.white.withOpacity(0.5),
                        Colors.transparent,
                        Colors.transparent,
                        Colors.white.withOpacity(0.8)
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
    );
  }
}
