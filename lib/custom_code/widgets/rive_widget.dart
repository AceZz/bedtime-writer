// Automatic FlutterFlow imports
import '../../flutter_flow/flutter_flow_theme.dart';
import '../../flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom widgets
import '../../flutter_flow/custom_functions.dart'; // Imports custom functions
import 'package:flutter/material.dart';
// Begin custom widget code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

import '../../flutter_flow/custom_functions.dart'
    as functions; // Imports custom functions

import 'package:rive/rive.dart';
import 'dart:math';

// Random possible choices

class RiveWidget extends StatefulWidget {
  RiveWidget({
    // removed const here
    Key? key,
    this.width,
    this.height,
  }) : super(key: key);

  final double? width;
  final double? height;

  @override
  _RiveWidgetState createState() => _RiveWidgetState();
}

class _RiveWidgetState extends State<RiveWidget> {
  var rivePath = functions.loadingGetRivePath();
  //var riveUrl = FFAppState().riveUrl; // must set local state riverUrl

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      // removed const here
      child: RiveAnimation.asset(
        rivePath,
        fit: BoxFit.cover,
      ),
    );
  }
}
