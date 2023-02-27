import 'package:flutter/material.dart';

/// Marks the story as favorite (TODO).
class FavoriteButton extends StatelessWidget {
  final double iconSize;

  const FavoriteButton({Key? key, required this.iconSize}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return IconButton(
      iconSize: iconSize,
      icon: Icon(
        Icons.favorite,
        color: Theme.of(context).textTheme.bodyMedium?.color,
      ),
      onPressed: null,
    );
  }
}
