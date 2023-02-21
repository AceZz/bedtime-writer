import 'package:flutter/material.dart';

import '../../widgets/home_button.dart';

/// Augmented [Scaffold] that comes with a full-width [Container].
///
/// Unless exception, every screen will use this class as a base widget.
class AppScaffold extends StatelessWidget {
  final Widget child;
  final bool showNavigationBar;

  const AppScaffold(
      {Key? key, required this.child, this.showNavigationBar = true})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final Widget bottomNavigationBar = Container(
      child: Padding(
        padding: const EdgeInsets.only(
          bottom: 20,
        ),
        child: HomeButton(
          iconSize: 40,
        ),
      ),
    );

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: SafeArea(
        child: Container(
          width: MediaQuery.of(context).size.width,
          child: child,
        ),
      ),
      bottomNavigationBar: showNavigationBar ? bottomNavigationBar : null,
    );
  }
}
