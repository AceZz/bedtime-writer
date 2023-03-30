import 'package:flutter/material.dart';

/// Displays a full heart if [isFavorite], an empty heart otherwise.
class FavoriteButton extends StatelessWidget {
  final bool isFavorite;
  final double iconSize;
  final Function()? onPressed;

  const FavoriteButton({
    Key? key,
    required this.isFavorite,
    required this.iconSize,
    required this.onPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return IconButton(
      iconSize: iconSize,
      icon: Icon(
        isFavorite ? Icons.favorite : Icons.favorite_border,
        color: Theme.of(context).textTheme.bodyMedium?.color,
      ),
      onPressed: onPressed,
    );
  }
}
