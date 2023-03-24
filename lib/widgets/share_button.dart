import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'dart:io';

Future<void> _onShare(BuildContext context, String text) async {
  final box = context.findRenderObject() as RenderBox?;
  await Share.share(
    text,
    sharePositionOrigin: box!.localToGlobal(Offset.zero) & box.size,
  );
}

/// A share button.
class ShareButton extends StatelessWidget {
  final String text;
  final double iconSize;

  const ShareButton({Key? key, required this.text, required this.iconSize})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Check the OS to choose the corresponding icon
    IconData shareIcon;
    if (Platform.isAndroid) {
      shareIcon = Icons.share;
    } else if (Platform.isIOS) {
      shareIcon = Icons.ios_share;
    } else {
      shareIcon = Icons.share;
    }

    return Builder(
      builder: (context) => IconButton(
        iconSize: iconSize,
        onPressed: () => _onShare(context, text),
        icon: Icon(
          shareIcon,
          color: Theme.of(context).textTheme.bodyMedium?.color,
        ),
      ),
    );
  }
}
