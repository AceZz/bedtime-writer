import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'flutter_flow/lat_lng.dart';

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

  String _lottieUrl = '';

  String get lottieUrl => _lottieUrl;

  set lottieUrl(String _value) {
    _lottieUrl = _value;
  }

  String _riveUrl = '';

  String get riveUrl => _riveUrl;

  set riveUrl(String _value) {
    _riveUrl = _value;
  }

  int _randomNum = 0;

  int get randomNum => _randomNum;

  set randomNum(int _value) {
    _randomNum = _value;
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
