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
      onPressed: () {
        onPressed?.call();
        _showSnackBar(context, isFavorite);
      },
    );
  }
}

void _showSnackBar(BuildContext context, bool isFavorite) {
  final String text =
      isFavorite ? 'Removed from Favorites' : 'Added to Favorites';
  final snackBar = SnackBar(
    content: Center(
        child: Text(text, style: Theme.of(context).textTheme.bodyMedium)),
    backgroundColor: Theme.of(context).colorScheme.primary,
    behavior: SnackBarBehavior.floating,
    duration: Duration(seconds: 3),
  );
  ScaffoldMessenger.of(context).showSnackBar(snackBar);
}
