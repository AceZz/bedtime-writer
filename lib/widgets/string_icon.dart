// Automatic FlutterFlow imports
import 'package:flutter/material.dart';
// Begin custom widget code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

import 'package:font_awesome_flutter/font_awesome_flutter.dart';

Map<String, IconData> ICONS_MAP = {
  'character_dog': FontAwesomeIcons.dog,
  'character_dove': FontAwesomeIcons.dove,
  'character_fish': FontAwesomeIcons.fish,
  'character_dragon': FontAwesomeIcons.dragon,
  'character_horse': FontAwesomeIcons.horse,
  'character_pirate': FontAwesomeIcons.skullCrossbones,
  'flaw_afraid_failure': FontAwesomeIcons.triangleExclamation,
  'flaw_not_confident': FontAwesomeIcons.comment,
  'flaw_lazy': FontAwesomeIcons.pause,
  'flaw_give_up': FontAwesomeIcons.xmark,
  'flaw_ugly': FontAwesomeIcons.heartCrack,
  'flaw_no_advice': FontAwesomeIcons.earDeaf,
  'place_magic': FontAwesomeIcons.wandMagicSparkles,
  'place_village': FontAwesomeIcons.houseChimney,
  'place_underwater': FontAwesomeIcons.water,
  'place_space': FontAwesomeIcons.rocket,
  'place_desert': FontAwesomeIcons.sunPlantWilt,
  'place_beach': FontAwesomeIcons.umbrellaBeach,
  'challenge_lost': FontAwesomeIcons.map,
  'challenge_witch': FontAwesomeIcons.dungeon,
  'challenge_animal': FontAwesomeIcons.cow,
  'challenge_friend': FontAwesomeIcons.userGroup,
  'challenge_riddle': FontAwesomeIcons.question,
  'power_fly': FontAwesomeIcons.feather,
  'power_animals': FontAwesomeIcons.cow,
  'power_invisible': FontAwesomeIcons.eyeSlash,
  'power_weather': FontAwesomeIcons.cloud,
  'power_heal': FontAwesomeIcons.briefcaseMedical,
  'power_minds': FontAwesomeIcons.brain,
  'object_ring': FontAwesomeIcons.ring,
  'object_amulet': FontAwesomeIcons.ankh,
  'object_shield': FontAwesomeIcons.shield,
  'object_flower': FontAwesomeIcons.leaf,
  'object_diamond': FontAwesomeIcons.gem,
  'moral_believe': FontAwesomeIcons.star,
  'moral_never_give_up': FontAwesomeIcons.star,
  'moral_honesty': FontAwesomeIcons.star,
  'moral_others': FontAwesomeIcons.star,
  'moral_beauty': FontAwesomeIcons.star,
  'moral_what_is_right': FontAwesomeIcons.star,
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
