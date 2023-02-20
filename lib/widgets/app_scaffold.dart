import 'package:flutter/material.dart';
import '../../widgets/home_button.dart';

/// Augmented [Scaffold] that comes with a full-width [Container].
///
/// Unless exception, every screen will use this class as a base widget.
class AppScaffold extends StatelessWidget {
  final Widget child;

  const AppScaffold({Key? key, required this.child}) : super(key: key);

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
        bottomNavigationBar: Container(
            child: Padding(
          padding: const EdgeInsets.only(
            bottom: 20,
          ),
          child: HomeButton(
            iconSize: 40,
          ),
        )));
  }
}
