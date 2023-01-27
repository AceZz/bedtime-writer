import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'flutter_flow/lat_lng.dart';
import 'dart:convert';

class FFAppState extends ChangeNotifier {
  static final FFAppState _instance = FFAppState._internal();

  factory FFAppState() {
    return _instance;
  }

  FFAppState._internal() {
    initializePersistedState();
  }

  Future initializePersistedState() async {
    prefs = await SharedPreferences.getInstance();
  }

  void update(VoidCallback callback) {
    callback();
    notifyListeners();
  }

  late SharedPreferences prefs;

  String _characterType = '';
  String get characterType => _characterType;
  set characterType(String _value) {
    _characterType = _value;
  }

  List<dynamic> _questions = [
    jsonDecode(
        '{\"id\":\"power\",\"question\":\"Choose a power\",\"choices\":[{\"text\":\"Fly very fast\"}]}')
  ];
  List<dynamic> get questions => _questions;
  set questions(List<dynamic> _value) {
    _questions = _value;
  }

  void addToQuestions(dynamic _value) {
    _questions.add(_value);
  }

  void removeFromQuestions(dynamic _value) {
    _questions.remove(_value);
  }

  String _storyText = '';
  String get storyText => _storyText;
  set storyText(String _value) {
    _storyText = _value;
  }

  String _storyImage = '';
  String get storyImage => _storyImage;
  set storyImage(String _value) {
    _storyImage = _value;
  }
}

LatLng? _latLngFromString(String? val) {
  if (val == null) {
    return null;
  }
  final split = val.split(',');
  final lat = double.parse(split.first);
  final lng = double.parse(split.last);
  return LatLng(lat, lng);
}
