// Automatic FlutterFlow imports
import '../../flutter_flow/flutter_flow_theme.dart';
import '../../flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom widgets
import '../../flutter_flow/custom_functions.dart'; // Imports custom functions
import 'package:flutter/material.dart';
// Begin custom widget code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

import 'package:font_awesome_flutter/font_awesome_flutter.dart';

Map<String, IconData> ICONS_MAP = {
  'character_dog': FontAwesomeIcons.dog,
  'character_dove': FontAwesomeIcons.dove,
  'character_fish': FontAwesomeIcons.fish,
  'power_strength': FontAwesomeIcons.dumbbell,
  'power_fly': FontAwesomeIcons.feather,
  'power_smart': FontAwesomeIcons.brain,
  'place_ocean': FontAwesomeIcons.water,
  'place_tree': FontAwesomeIcons.tree,
  'place_magic': FontAwesomeIcons.wandMagicSparkles,
  'object_guitar': FontAwesomeIcons.guitar,
  'object_hat': FontAwesomeIcons.hatCowboy,
  'object_rocket': FontAwesomeIcons.rocket,
  'duration_short': FontAwesomeIcons.bolt,
  'duration_long': FontAwesomeIcons.clock,
};

class StringIcon extends StatefulWidget {
  const StringIcon({
    Key? key,
    this.width,
    this.height,
    this.icon,
  }) : super(key: key);

  final double? width;
  final double? height;
  final String? icon;

  @override
  _StringIconState createState() => _StringIconState();
}

class _StringIconState extends State<StringIcon> {
  @override
  Widget build(BuildContext context) {
    return Icon(
      ICONS_MAP[widget.icon],
      color: Theme.of(context).colorScheme.onPrimary,
      size: 50.0,
    );
  }
}
