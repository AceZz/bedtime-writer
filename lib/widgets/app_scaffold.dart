import 'package:flutter/material.dart';

/// Augmented [Scaffold] that comes with a full-width [Container].
///
/// Unless exception, every screen will use this class as a base widget.
class AppScaffold extends StatelessWidget {
  final Widget child;
  final bool showAppBar;

  const AppScaffold(
      {Key? key, required this.child, this.showAppBar = true})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: SafeArea(
        child: Container(
          width: MediaQuery.of(context).size.width,
          child: child,
        ),
      ),
      appBar: showAppBar ? AppBar() : null,
    );
  }
}
