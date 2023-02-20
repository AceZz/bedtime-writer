import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// A go-to-home-screen button.
class HomeButton extends StatelessWidget {
  final double iconSize;

  const HomeButton({Key? key, required this.iconSize}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Builder(
      builder: (context) => IconButton(
        iconSize: iconSize,
        onPressed: () => context.goNamed('home'),
        icon: Icon(
          Icons.home,
          color: Theme.of(context).textTheme.bodyMedium?.color,
        ),
      ),
    );
  }
}
