import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';

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
    return Builder(
      builder: (context) => IconButton(
        iconSize: iconSize,
        onPressed: () => _onShare(context, text),
        icon: Icon(
          _shareIcon,
          color: Theme.of(context).textTheme.bodyMedium?.color,
        ),
      ),
    );
  }

  /// Returns the icon corresponding to the OS.
  IconData get _shareIcon {
    // The web case must be tackled first, as `Platform` is not available on it.
    if (kIsWeb) return Icons.share;
    if (Platform.isAndroid) {
      return Icons.share;
    }
    if (Platform.isIOS) {
      return Icons.ios_share;
    }
    return Icons.share;
  }
}
