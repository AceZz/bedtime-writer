import 'dart:async';

import 'package:flutter/material.dart';

/// A "fade in" transition (opacity goes from 0.0 to 1.0).
///
/// The animation lasts [duration] and can be delayed with [delay]. It is not
/// advised to set [delay] to `Duration()` (aka no delay), as the animation will
/// not be clean.
class FadeIn extends StatefulWidget {
  final Widget child;
  final Duration duration;
  final Duration delay;

  const FadeIn({
    Key? key,
    required this.child,
    this.duration = const Duration(milliseconds: 1500),
    this.delay = const Duration(milliseconds: 100),
  }) : super(key: key);

  @override
  FadeInState createState() => FadeInState();
}

class FadeInState extends State<FadeIn> {
  double _opacity = 0.0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer(
      widget.delay,
      () {
        setState(() {
          _opacity = 1.0;
        });
      },
    );
  }

  @override
  void dispose() {
    super.dispose();
    _timer?.cancel();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: _opacity,
      duration: widget.duration,
      child: widget.child,
    );
  }
}

/// Each call to [add] returns a [FadeIn] that starts [delay] ms after the
/// previous one.
///
/// Note: the first [FadeIn] starts after [delay] ms.
class FadeInGroup {
  final int delay;
  final int duration;
  int _previousDelay = 0;

  FadeInGroup({
    this.delay = 500,
    this.duration = 1500,
  });

  FadeIn add({required Widget child}) {
    _previousDelay += delay;

    return FadeIn(
      duration: Duration(milliseconds: duration),
      delay: Duration(milliseconds: _previousDelay),
      child: child,
    );
  }
}
